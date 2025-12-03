import { Worker } from "bullmq";
import { google } from "googleapis";
import { bullmqConnection } from "../config/redis.js";
import User from "../models/User.js";
import Email from "../models/Email.js";
import Lead from "../models/Lead.js";
import { classifyLead } from "../services/gemini.service.js";

/**
 * Helper: safe base64 decode for Gmail payload (URL-safe)
 */
function base64UrlDecode(input = "") {
  // Gmail uses URL-safe base64 ( - and _ ). Convert to standard base64.
  const fixed = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '=' if needed
  const pad = fixed.length % 4 === 0 ? "" : "=".repeat(4 - (fixed.length % 4));
  return Buffer.from(fixed + pad, "base64").toString("utf8");
}

/**
 * Extract header value by name (case-insensitive)
 */
function headerValue(headers = [], name) {
  const h = headers.find((x) => x.name && x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : "";
}

/**
 * Recursively find text/plain part in message payload
 */
function extractPlainTextFromParts(parts = []) {
  const queue = Array.isArray(parts) ? [...parts] : [];
  while (queue.length) {
    const p = queue.shift();
    if (!p) continue;
    if (p.mimeType === "text/plain" && p.body && p.body.data) {
      return base64UrlDecode(p.body.data);
    }
    // sometimes text/html but no text/plain - keep html as fallback
    if (p.mimeType === "text/html" && p.body && p.body.data) {
      // keep as fallback if no plain found later
      if (!p._fallback) p._fallback = base64UrlDecode(p.body.data);
    }
    if (p.parts) queue.push(...p.parts);
  }
  return ""; // fallback to snippet later
}

/**
 * Decide whether to create a lead from subject/body (simple heuristic)
 * You can expand this rule or always create leads and later filter.
 */
function shouldCreateLead(subject = "", body = "") {
  const text = `${subject} ${body}`.toLowerCase();
  return /budget|hire|need|project|website|app|build|interested|quote|proposal/i.test(text);
}

/**
 * Create worker and start processing jobs
 */
export const startEmailWorker = () => {
  console.log("Starting Email Worker...");

  const worker = new Worker(
    "emailQueue",
    async (job) => {
      const { userId, messageId } = job.data;
      console.log(`[worker] processing job ${job.id} message=${messageId} user=${userId}`);

      // reload user fresh from DB for tokens
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found in worker for id=" + userId);

      if (!user.gmailRefreshToken && !user.gmailAccessToken) {
        throw new Error("User has no Gmail tokens");
      }

      // create oauth client per-job
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL || process.env.GOOGLE_REDIRECT_URI
      );

      // Put refresh_token (preferred) and access token if present
      const creds = {};
      if (user.gmailRefreshToken) creds.refresh_token = user.gmailRefreshToken;
      if (user.gmailAccessToken) creds.access_token = user.gmailAccessToken;
      oauth2Client.setCredentials(creds);

      // Ensure we have a valid access token (will refresh if needed)
      try {
        const at = await oauth2Client.getAccessToken();
        if (at && at.token) {
          // store fresh access token in DB for future quick usage (non-blocking)
          user.gmailAccessToken = at.token;
          // best-effort save (won't block processing)
          user.save().catch((e) => console.warn("Could not save new access token:", e.message || e));
        }
      } catch (err) {
        // If refresh fails, let processing continue and surface error
        console.warn("Could not refresh access token:", err.message || err);
      }

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // fetch full message
      let msg;
      try {
        const resp = await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "full"
        });
        msg = resp.data;
      } catch (err) {
        console.error("[worker] failed to fetch message", messageId, err.message || err);
        throw err;
      }

      // headers & basic info
      const headers = (msg.payload && msg.payload.headers) || [];
      const subject = headerValue(headers, "subject") || "";
      const from = headerValue(headers, "from") || "";
      const to = headerValue(headers, "to") || "";
      const date = headerValue(headers, "date") || "";
      const threadId = msg.threadId || "";

      // extract body: text/plain preferred, fallback to snippet or text/html fallback
      let body = "";
      if (msg.payload && msg.payload.parts) {
        body = extractPlainTextFromParts(msg.payload.parts) || "";
      }
      // sometimes top-level body (no parts)
      if (!body && msg.payload && msg.payload.body && msg.payload.body.data) {
        body = base64UrlDecode(msg.payload.body.data);
      }
      if (!body) {
        body = msg.snippet || "";
      }

      // Upsert Email doc (unique on messageId)
      const emailDoc = await Email.findOneAndUpdate(
        { messageId },
        {
          user: userId,
          messageId,
          threadId,
          from,
          to,
          subject,
          snippet: msg.snippet || "",
          body,
          raw: msg,
          fetchedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // If already processed and lead exists for this message, skip
      if (emailDoc.processed) {
        console.log(`[worker] message ${messageId} already processed — skipping`);
        return { ok: true, skipped: true };
      }

      // Decide whether to create a lead
      const createLeadFlag = shouldCreateLead(subject, body);

      if (createLeadFlag) {
        // avoid duplicate leads by messageId or threadId
        const existing = await Lead.findOne({
          $or: [{ messageId }, { threadId }],
          user: userId
        });
        if (existing) {
          console.log(`[worker] lead already exists for message/thread ${messageId}/${threadId}`);
        } else {
          // call Gemini classify
          let ai = { urgency: "unknown", tags: [], score: 0, summary: "" };
          try {
            ai = await classifyLead(`${subject}\n\n${body}`);
          } catch (e) {
            console.warn("[worker] ai classify error:", e.message || e);
          }

          // parse email "from" to get name & email address
          let senderName = from;
          let senderEmail = from;
          const m = from.match(/(.*)<(.+@.+)>/);
          if (m) {
            senderName = m[1].trim().replace(/(^"|"$)/g, "");
            senderEmail = m[2].trim();
          }

          const lead = new Lead({
            user: userId,
            name: senderName,
            email: senderEmail,
            subject,
            body,
            source: "gmail",
            threadId,
            messageId,
            ai_tags: ai.tags || [],
            ai_summary: ai.summary || "",
            lead_score: Number(ai.score) || 0,
            urgency: ai.urgency || "unknown",
            followup_required: true,
            next_followup_at: (ai.urgency === "high") ? new Date(Date.now() + 1000 * 60 * 60 * 24) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
          });

          await lead.save();
          console.log(`[worker] created lead ${lead._id} from message ${messageId}`);
        }
      } else {
        console.log(`[worker] heuristics decided NOT to create lead for ${messageId}`);
      }

      // mark email processed
      emailDoc.processed = true;
      await emailDoc.save();

      return { ok: true };
    },
    {
      connection: bullmqConnection,
      concurrency: 3
    }
  );

  worker.on("completed", (job) => {
    console.log("[worker] completed job:", job.id);
  });

  worker.on("failed", (job, err) => {
    console.error("[worker] job failed:", job.id, err.message || err);
  });

  worker.on("error", (err) => {
    console.error("[worker] error:", err.message || err);
  });

  return worker;
};
