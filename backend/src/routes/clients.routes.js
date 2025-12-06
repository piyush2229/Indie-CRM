// backend/src/routes/clients.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  convertLeadToClient,
  listClients,
  getClient,
  addClientHistory,
  deleteClient // ⭐ NEW
} from "../controllers/client.controller.js";

import { replyToClient } from "../controllers/clientEmail.controller.js";

const router = express.Router();

router.post("/from-lead/:id", protect, convertLeadToClient);

router.get("/", protect, listClients);
router.get("/:id", protect, getClient);

router.post("/:id/history", protect, addClientHistory);

// ⭐ Send email reply
router.post("/:id/reply", protect, replyToClient);

// ⭐ NEW — Delete Client + All Related Leads
router.delete("/:id", protect, deleteClient);

export default router;
