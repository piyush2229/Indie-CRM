// backend/src/controllers/projectEmail.controller.js
import { google } from "googleapis";
import Project from "../models/Project.js";
import Client from "../models/Client.js";
import User from "../models/User.js";

export const replyToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const user = await User.findById(req.user._id);
    const project = await Project.findOne({ _id: projectId, user: req.user._id })
      .populate("client");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!user.gmailRefreshToken)
      return res.status(400).json({ message: "Google not connected" });

    if (!project.client?.email)
      return res.status(400).json({ message: "Client email unavailable" });

    const to = project.client.email;

    // ---------------------
    // OAuth Setup
    // ---------------------
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
    const subject = `Update regarding project: ${project.title}`;

    // ---------------------
    // Build raw email
    // ---------------------
    const rawEmail =
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `From: ${user.email}\r\n` +
      `\r\n` +
      message;

    const encodedMessage = Buffer.from(rawEmail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    // ---------------------
    // Send Email
    // ---------------------
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    // ---------------------
    // SAVE MESSAGE INTO PROJECT HISTORY
    // ---------------------
    if (!project.messages) project.messages = [];

    project.messages.push({
      type: "reply",
      message,
      meta: { subject },
      createdBy: req.user._id,
      createdAt: new Date(),
    });

    await project.save();

    res.json({
      success: true,
      message: "Email sent & saved to project history",
      project,
    });

  } catch (err) {
    console.error("replyToProject error:", err);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
};
