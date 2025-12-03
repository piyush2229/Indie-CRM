import express from "express";
import {
  signup,
  login,
  googleAuthUrl,
  googleCallback,
  getMe
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Email/Password Auth
router.post("/signup", signup);
router.post("/login", login);

// Google OAuth
router.get("/google/url", googleAuthUrl);
router.get("/google/callback", googleCallback);

// Protected: Get current user
router.get("/me", protect, getMe);  // ✔ now works

export default router;
