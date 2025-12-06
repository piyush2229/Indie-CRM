// backend/src/models/Project.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Message / Email History Schema (same style as Client history)
const MessageSchema = new Schema({
  type: { type: String, default: "reply" }, // could be: reply, note, update
  message: { type: String, required: true },
  meta: {
    subject: { type: String, default: "" }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },

    title: { type: String, required: true },
    description: { type: String, default: "" },

    leads: [{ type: Schema.Types.ObjectId, ref: "Lead" }],

    completed: { type: Boolean, default: false },
    completed_at: { type: Date, default: null },

    // ⭐ NEW: Project messages for history + Gmail replies
    messages: [MessageSchema]
  },
  { timestamps: true }
);

// Index for fast queries
ProjectSchema.index({ user: 1, client: 1, completed: 1 });

export default mongoose.model("Project", ProjectSchema);
