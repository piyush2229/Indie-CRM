import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createLead,
  listLeads,
  getLead,
  updateLead,
  updateStage,
  deleteLead,
  togglePromotion
} from "../controllers/lead.controller.js";
import { markLeadCompleted } from "../controllers/lead.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createLead);
router.get("/", listLeads);
router.get("/:id", getLead);
router.patch("/:id", updateLead);
router.patch("/:id/stage", updateStage);
router.patch("/:id/complete", markLeadCompleted);
router.patch("/:id/promotion", togglePromotion);
router.delete("/:id", deleteLead);

export default router;
