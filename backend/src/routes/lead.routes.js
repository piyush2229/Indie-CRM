import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createLead, listLeads, getLead, updateLead, updateStage, deleteLead
} from "../controllers/lead.controller.js";
import { markLeadCompleted } from "../controllers/lead.controller.js";
const router = express.Router();

router.use(protect); // all lead routes require auth

router.post("/", createLead);                  // create
router.get("/", listLeads);                    // list with filters
router.get("/:id", getLead);                   // get single
router.patch("/:id", updateLead);              // update partial
router.patch("/:id/stage", updateStage);       // update stage
router.delete("/:id", deleteLead);             // soft delete
router.patch("/:id/complete", protect, markLeadCompleted);
export default router;
