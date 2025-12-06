import { Worker } from "bullmq";
import Lead from "../models/Lead.js";
import { classifyLeadWithRotation } from "../services/geminiRotating.js";
import { bullmqConnection } from "../config/redis.js";

export const startAiWorker = () => {
  console.log("🚀 AI Worker Started...");

  const worker = new Worker(
    "aiQueue",
    async () => {
      const lead = await Lead.findOne({ aiStatus: "pending" }).sort({ createdAt: 1 });

      if (!lead) {
        console.log("⏳ No pending leads. AI worker idle.");
        return;
      }
      const ai = await classifyLeadWithRotation(`${lead.subject}\n\n${lead.body}`);

      console.log("🎯 AI Response:", ai);

      lead.lead_score = ai.score || 0;
      lead.urgency = ai.urgency || "unknown";
      lead.ai_summary = ai.summary || "";
      lead.ai_tags = ai.tags || [];
      lead.aiStatus = "done";

      await lead.save();

      console.log("✔️ AI job completed and lead updated:", lead._id);
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
      limiter: { max: 1, duration: 5000 }
    }
  );

  return worker;
};
