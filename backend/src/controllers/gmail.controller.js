import { google } from "googleapis";
import User from "../models/User.js";
import Email from "../models/Email.js";
import { emailQueue } from "../queues/emailQueue.js";

// ---------- SYNC GMAIL (QUEUE EMAILS) ----------
export const triggerSync = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    // FIXED: correct field names
    if (!user || !user.gmailRefreshToken) {
      return res.status(400).json({ error: "Google account not connected" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL  // must match your OAuth
    );

    oauth2Client.setCredentials({
      refresh_token: user.gmailRefreshToken,  // FIXED FIELD NAME
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });

    const messages = list.data.messages || [];

    if (!messages.length) {
      return res.json({
        success: true,
        queued: 0,
        message: "No unread emails found",
      });
    }

    for (const msg of messages) {
      await emailQueue.add("processEmail", {
        userId,
        messageId: msg.id,
      });
    }

    return res.json({
      success: true,
      queued: messages.length,
      message: "Emails synced and queued",
    });
  } catch (err) {
    console.error("triggerSync Error:", err);
    res.status(500).json({ error: "Failed to sync emails" });
  }
};

// ---------- LIST SAVED EMAILS ----------
export const listEmails = async (req, res) => {
  const emails = await Email.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, emails });
};
