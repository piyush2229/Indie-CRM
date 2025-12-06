import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { oauth2Client, SCOPES } from "../config/google.config.js";
import { google } from "googleapis";

// ------------------ SIGNUP ------------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, profession } = req.body;

    if (!profession) {
      return res.status(400).json({ message: "Profession is required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      profession,
      mustSelectProfession: false
    });

    res.status(201).json({
      message: "Signup successful",
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GOOGLE LOGIN URL ------------------
export const googleAuthUrl = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
    });

    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ GOOGLE CALLBACK ------------------
export const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    const newOauth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    const { tokens } = await newOauth.getToken(code);
    newOauth.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: newOauth,
      version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();

    let user = await User.findOne({ email: userInfo.data.email });

    if (!user) {
      user = await User.create({
        name: userInfo.data.name,
        email: userInfo.data.email,
        googleId: userInfo.data.id,
        password: "",
        gmailAccessToken: tokens.access_token || null,
        gmailRefreshToken: tokens.refresh_token || null,
      });
    } else {
      user.googleId = userInfo.data.id;
      user.gmailAccessToken = tokens.access_token || user.gmailAccessToken;

      if (tokens.refresh_token) {
        user.gmailRefreshToken = tokens.refresh_token;
      }

      await user.save();
    }

    const jwtToken = generateToken(user._id);

    return res.redirect(`http://localhost:5173/auth-success?token=${jwtToken}`);

  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.status(500).json({
      message: "Google OAuth Error",
      error
    });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfession = async (req, res) => {
  try {
    const { profession } = req.body;

    const allowed = ["freelancer", "agency", "real_estate", "coach"];
    if (!allowed.includes(profession))
      return res.status(400).json({ message: "Invalid profession" });

    const user = await User.findById(req.user._id);
    user.profession = profession;
    user.mustSelectProfession = false;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
