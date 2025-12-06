import mongoose from "mongoose";

const { Schema } = mongoose;

const leadSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Basic info
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    source: {
      type: String,
      enum: ["gmail", "linkedin", "webform", "manual", "other"],
      default: "manual",
    },

    subject: { type: String, default: "" },
    body: { type: String, default: "" },

    // Pipeline
    stage: {
      type: String,
      enum: [
        "new",
        "contacted",
        "in-conversation",
        "proposal-sent",
        "qualified",
        "won",
        "lost",
        "archived",
      ],
      default: "new",
    },

    // ⭐ AI processing status — REQUIRED
    aiStatus: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },

    // AI fields
    ai_tags: [{ type: String }],
    ai_summary: { type: String, default: "" },
    lead_score: { type: Number, default: 0 },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "unknown"],
      default: "unknown",
    },

    next_followup_at: { type: Date },
    followup_required: { type: Boolean, default: false },
    reminders_sent: { type: Number, default: 0 },

    messageId: { type: String },
    threadId: { type: String },
    isPromotion: { type: Boolean, default: false },

    archived: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    completed_at: { type: Date, default: null },
    handled_by: { type: Schema.Types.ObjectId, ref: "User", default: null },

    convertedToClient: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  { timestamps: true }
);

leadSchema.index({ user: 1, stage: 1, lead_score: -1 });
leadSchema.index({ email: 1 });

export default mongoose.model("Lead", leadSchema);
