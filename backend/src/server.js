import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import "./config/redis.js";

import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import gmailRoutes from "./routes/gmail.routes.js";
import clientsRouter from "./routes/clients.routes.js";
import projectsRouter from "./routes/projects.routes.js";

import { startEmailWorker } from "./workers/emailWorker.js";
import { startAiWorker } from "./workers/aiWorker.js";   // <-- ADD THIS

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Start Workers
startEmailWorker();   // email ingestion
startAiWorker();      // <-- 🚀 AI CLASSIFICATION WORKER

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/clients", clientsRouter);
app.use("/api/projects", projectsRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
