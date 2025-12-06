import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },

    password: { type: String },

    googleId: { type: String, default: null },
    googleEmail: { type: String, default: null },
    googleName: { type: String, default: null },

    gmailAccessToken: { type: String, default: null },
    gmailRefreshToken: { type: String, default: null },

    googlePicture: { type: String, default: null },

    profession: {
      type: String,
      enum: ["freelancer", "agency", "real_estate", "coach"],
      default: null,
    },

    mustSelectProfession: {
      type: Boolean,
      default: true,
    },

    // ⭐ New fields for Gmail sync logic
    firstSyncDone: {
      type: Boolean,
      default: false,
    },

    lastSyncedMessageId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
