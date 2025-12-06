import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createProject,
  addLeadToProject,
  listProjects,
  getProject,
  completeProject,
  deleteProject,
  addProjectMessage,// ⬅ NEW
} from "../controllers/project.controller.js";
import { replyToProject } from "../controllers/projectEmail.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/:id/add-lead", addLeadToProject);
router.patch("/:id/complete", completeProject);
router.delete("/:id", deleteProject);

// ⭐ NEW (Gmail send like client)
router.post("/:id/reply", replyToProject);

// Internal log text
router.post("/:id/message", addProjectMessage);

export default router;
