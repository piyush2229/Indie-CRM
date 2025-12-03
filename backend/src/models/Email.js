import mongoose from "mongoose";
const { Schema } = mongoose;

const emailSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messageId: { type: String, index: true, required: true, unique: true },
  threadId: { type: String },
  from: { type: String },
  to: { type: String },
  subject: { type: String },
  snippet: { type: String },
  body: { type: String }, // plain/text fallback
  raw: { type: Schema.Types.Mixed }, // raw API object
  fetchedAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false }, // whether converted to lead
}, { timestamps: true });

emailSchema.index({ user: 1, processed: 1, fetchedAt: -1 });

export default mongoose.model("Email", emailSchema);
