// backend/src/models/Client.js
import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  type: { type: String, enum: ["note", "email", "reply", "import"], default: "note" },
  message: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

const ClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, default: "" },
  company: { type: String, default: "" },
  notes: { type: String, default: "" },

  history: { type: [HistorySchema], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 🔥 FIXED — Updated Mongoose v7 hook (no next argument!)
ClientSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.model("Client", ClientSchema);
