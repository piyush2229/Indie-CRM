import mongoose from "mongoose";

const { Schema } = mongoose;

const leadSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // owner

    // Basic info
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    source: { type: String, enum: ["gmail","linkedin","webform","manual","other"], default: "manual" },

    // message / email content
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

    // AI-generated fields
    ai_tags: [{ type: String }],
    ai_summary: { type: String, default: "" },
    lead_score: { type: Number, default: 0 }, // 0-100
    urgency: { type: String, enum: ["low","medium","high","unknown"], default: "unknown" },

    // Follow-up automation
    next_followup_at: { type: Date },
    followup_required: { type: Boolean, default: false },
    reminders_sent: { type: Number, default: 0 },

    // raw metadata
    messageId: { type: String },
    threadId: { type: String },

    // soft deletes / flags
    archived: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
completed_at: { type: Date, default: null },
handled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // ⭐ NEW FIELD — track conversion lead → client
    convertedToClient: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  { timestamps: true }
);

// Useful index for user lookups and stage filtering
leadSchema.index({ user: 1, stage: 1, lead_score: -1 });
leadSchema.index({ email: 1 });

export default mongoose.model("Lead", leadSchema);
