import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { triggerSync, listEmails } from "../controllers/gmail.controller.js";

const router = express.Router();

router.use(protect);

router.post("/sync", triggerSync);   // POST /api/gmail/sync
router.get("/", listEmails);         // GET  /api/gmail

export default router;
