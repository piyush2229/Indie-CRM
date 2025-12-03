import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },

    // Normal login
    password: { type: String },

    // Google profile info
    googleId: { type: String, default: null },
    googleEmail: { type: String, default: null },
    googleName: { type: String, default: null },

    // Gmail OAuth tokens
    gmailAccessToken: { type: String, default: null },
    gmailRefreshToken: { type: String, default: null },

    // Optional: profile picture
    googlePicture: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
