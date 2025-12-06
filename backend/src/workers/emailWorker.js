import { Worker, Queue } from "bullmq";
import { google } from "googleapis";
import { bullmqConnection } from "../config/redis.js";
import User from "../models/User.js";
import Email from "../models/Email.js";
import Lead from "../models/Lead.js";

/* -------------------------------------------
   BASE64 DECODING
------------------------------------------- */
function base64UrlDecode(input = "") {
  const fixed = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = fixed.length % 4 === 0 ? "" : "=".repeat(4 - (fixed.length % 4));
  return Buffer.from(fixed + pad, "base64").toString("utf8");
}

/* -------------------------------------------
   HEADER HELPER
------------------------------------------- */
function headerValue(headers = [], name) {
  const h = headers.find(x => x.name?.toLowerCase() === name.toLowerCase());
  return h ? h.value : "";
}

/* -------------------------------------------
   BODY EXTRACTOR
------------------------------------------- */
function extractPlainTextFromParts(parts = []) {
  const queue = [...parts];
  let htmlFallback = "";

  while (queue.length) {
    const p = queue.shift();
    if (!p) continue;

    if (p.mimeType === "text/plain" && p.body?.data) {
      return base64UrlDecode(p.body.data);
    }
    if (p.mimeType === "text/html" && p.body?.data) {
      htmlFallback = base64UrlDecode(p.body.data);
    }
    if (p.parts) queue.push(...p.parts);
  }

  return htmlFallback;
}

/* -------------------------------------------
   LEAD FILTER LOGIC
------------------------------------------- */
function shouldCreateLead(subject = "", body = "") {
  const text = `${subject} ${body}`.toLowerCase();
  return /budget|hire|need|project|website|app|build|interested|quote|proposal/i.test(text);
}

/* -------------------------------------------
   EMAIL WORKER
------------------------------------------- */
export const startEmailWorker = () => {

  console.log("🚀 Email Worker Started...");

  const aiQueue = new Queue("aiQueue", { connection: bullmqConnection });

  const worker = new Worker(
    "emailQueue",
    async (job) => {
      const { userId, messageId, index, total } = job.data;
      console.log(`📨 [${index}/${total}] Processing email: ${messageId}`);

      /* -------------------------------------
         LOAD USER
      -------------------------------------- */
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found: " + userId);

      if (!user.gmailRefreshToken && !user.gmailAccessToken) {
        throw new Error("No Gmail tokens for user");
      }

      /* -------------------------------------
         GOOGLE AUTH
      -------------------------------------- */
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
      );

      oauth2Client.setCredentials({
        refresh_token: user.gmailRefreshToken,
        access_token: user.gmailAccessToken
      });

      try {
        const at = await oauth2Client.getAccessToken();
        if (at?.token) {
          user.gmailAccessToken = at.token;
          user.save().catch(() => {});
        }
      } catch {}

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      /* -------------------------------------
         FETCH EMAIL
      -------------------------------------- */
      let msg;
      try {
        msg = (await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "full",
        })).data;
      } catch (err) {
        console.error("❌ Unable to fetch email:", err.message);
        return;
      }

      const headers = msg.payload?.headers || [];
      const subject = headerValue(headers, "subject") || "";
      const from = headerValue(headers, "from") || "";
      const to = headerValue(headers, "to") || "";
      const threadId = msg.threadId;

      /* -------------------------------------
         EMAIL BODY
      -------------------------------------- */
      let body = "";
      if (msg.payload?.parts) body = extractPlainTextFromParts(msg.payload.parts);
      if (!body && msg.payload?.body?.data) body = base64UrlDecode(msg.payload.body.data);
      if (!body) body = msg.snippet || "";

      /* -------------------------------------
         UPSERT EMAIL RECORD
      -------------------------------------- */
      const emailDoc = await Email.findOneAndUpdate(
        { messageId },
        {
          user: userId,
          messageId,
          from,
          to,
          subject,
          threadId,
          snippet: msg.snippet,
          body,
          fetchedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      if (emailDoc.processed) {
        console.log("⏭️ Already processed, skipping.");
        return;
      }

      /* -------------------------------------
         PARSE SENDER DETAILS
      -------------------------------------- */
      let senderName = from;
      let senderEmail = from;

      const match = from.match(/(.*)<(.+@.+)>/);
      if (match) {
        senderName = match[1].trim().replace(/"/g, "");
        senderEmail = match[2].trim();
      }

      /* -------------------------------------
         ⛔ SKIP EMAIL SENT BY USER THEMSELVES
      -------------------------------------- */
      if (
        senderEmail.toLowerCase() === user.email.toLowerCase() ||
        (user.googleEmail && senderEmail.toLowerCase() === user.googleEmail.toLowerCase())
      ) {
        console.log("⏭️ Skipping self-sent email:", senderEmail);
        emailDoc.processed = true;
        await emailDoc.save();
        return;
      }

      /* -------------------------------------
         CHECK IF LEAD SHOULD BE CREATED
      -------------------------------------- */
      if (shouldCreateLead(subject, body)) {

        const exists = await Lead.findOne({
          user: userId,
          $or: [{ messageId }, { threadId }],
        });

        if (!exists) {
          const lead = await Lead.create({
            user: userId,
            name: senderName,
            email: senderEmail,
            subject,
            body,
            source: "gmail",
            messageId,
            threadId,
            aiStatus: "pending",
          });

          console.log("🆕 Lead created:", lead._id);

          await aiQueue.add("classifyLead", {
            leadId: lead._id,
            profession: user.profession || "freelancer",
          });
        }
      }

      /* -------------------------------------
         MARK AS PROCESSED
      -------------------------------------- */
      emailDoc.processed = true;
      await emailDoc.save();

      return { ok: true };
    },

    {
      connection: bullmqConnection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) =>
    console.log("✔️ Email job completed:", job.id)
  );
  worker.on("failed", (job, err) =>
    console.error("❌ Email job failed:", job.id, err.message)
  );

  return worker;
};
