// backend/src/controllers/clientEmail.controller.js
import { google } from "googleapis";
import Client from "../models/Client.js";
import User from "../models/User.js";

export const replyToClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const user = await User.findById(req.user._id);
    const client = await Client.findOne({ _id: clientId, user: req.user._id });

    if (!client) return res.status(404).json({ message: "Client not found" });
    if (!user.gmailRefreshToken)
      return res.status(400).json({ message: "Google not connected" });

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

    // Subject rule:
    const subject = `Update from ${user.name}`;

    // Build email format
    const rawEmail =
      `To: ${client.email}\r\n` +
      `Subject: ${subject}\r\n` +
      `From: ${user.email}\r\n` +
      `\r\n` +
      message;

    const encodedMessage = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    // Send email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    // Save to client history
    client.history.push({
      type: "reply",
      message,
      meta: { subject },
      createdBy: req.user._id,
    });

    await client.save();

    res.json({
      success: true,
      message: "Email sent & saved to history",
      client,
    });
  } catch (err) {
    console.error("replyToClient error:", err);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
};
