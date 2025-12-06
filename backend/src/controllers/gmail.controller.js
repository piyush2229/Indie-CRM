import { google } from "googleapis";
import User from "../models/User.js";
import Email from "../models/Email.js";
import { emailQueue } from "../queues/emailQueue.js";

export const triggerSync = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.gmailRefreshToken) {
      return res.status(400).json({ error: "Google account not connected" });
    }

    // OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    oauth2Client.setCredentials({
      refresh_token: user.gmailRefreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // --------------------------------------------------------------------
    // ⭐ FIRST SYNC → Fetch last 20 emails ONLY
    // --------------------------------------------------------------------
    if (!user.firstSyncDone) {
      console.log("🚀 FIRST SYNC → Fetching last 20 emails");

      const list = await gmail.users.messages.list({
        userId: "me",
        maxResults: 20,
      });

      const messages = list.data.messages || [];
      console.log(`📩 Gmail returned ${messages.length} emails`);

      for (let i = 0; i < messages.length; i++) {
        await emailQueue.add("processEmail", {
          userId,
          messageId: messages[i].id,
          index: i + 1,
          total: messages.length,
        });
      }

      if (messages.length > 0) {
        user.lastSyncedMessageId = messages[0].id;
      }

      user.firstSyncDone = true;
      await user.save();

      return res.json({
        success: true,
        queued: messages.length,
        firstSync: true,
        message: "First sync complete",
      });
    }

    // --------------------------------------------------------------------
    // ⭐ SUBSEQUENT SYNC → Fetch ONLY NEW EMAILS (up to 20)
    // --------------------------------------------------------------------
    console.log("🔄 SUBSEQUENT SYNC → Fetching new emails...");

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100, // safe upper limit
    });

    const allMessages = list.data.messages || [];
    let newMessages = [];

    for (const msg of allMessages) {
      if (msg.id === user.lastSyncedMessageId) break;

      newMessages.push(msg);

      if (newMessages.length >= 20) break;
    }

    console.log(`🆕 Found ${newMessages.length} new emails`);

    for (let i = 0; i < newMessages.length; i++) {
      await emailQueue.add("processEmail", {
        userId,
        messageId: newMessages[i].id,
        index: i + 1,
        total: newMessages.length,
      });
    }

    if (newMessages.length > 0) {
      user.lastSyncedMessageId = newMessages[0].id;
      await user.save();
    }

    return res.json({
      success: true,
      queued: newMessages.length,
      firstSync: false,
      message: "Synced new emails",
    });

  } catch (err) {
    console.error("❌ triggerSync error:", err);
    res.status(500).json({ error: "Failed to sync emails" });
  }
};

export const listEmails = async (req, res) => {
  try {
    const emails = await Email.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, emails });
  } catch (err) {
    res.status(500).json({ error: "Failed to load emails" });
  }
};
