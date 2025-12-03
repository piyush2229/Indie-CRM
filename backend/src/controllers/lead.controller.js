import Lead from "../models/Lead.js";
import { classifyLead } from "../services/gemini.service.js";

// Create a new lead (manual or after Gmail fetch)
export const createLead = async (req, res) => {
  try {
    // require auth middleware to have set req.user
    const userId = req.user._id;

    const {
      name, email, phone, company, subject, body, source,
      next_followup_at
    } = req.body;

    const lead = new Lead({
      user: userId,
      name, email, phone, company, subject, body,
      source: source || "manual",
      next_followup_at: next_followup_at || null
    });

    // Attempt AI classification (non-blocking if desired)
    const textForAi = `${subject || ""}\n\n${body || ""}`;
    const ai = await classifyLead(textForAi);
    lead.ai_tags = ai.tags;
    lead.ai_summary = ai.summary;
    lead.lead_score = ai.score;
    lead.urgency = ai.urgency;

    await lead.save();

    return res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error("createLead", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Get leads list (with simple filters)
export const listLeads = async (req, res) => {
  try {
    const userId = req.user._id;
    const { stage, page = 1, limit = 20, q } = req.query;
    const filter = { user: userId, archived: false };
    if (stage) filter.stage = stage;
    if (q) filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { body: { $regex: q, $options: "i" } }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, count] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(filter)
    ]);
    return res.json({ success:true, leads, total: count, page: Number(page) });
  } catch (err) {
    console.error("listLeads", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Get single lead
export const getLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const lead = await Lead.findOne({ _id: id, user: userId });
    if (!lead) return res.status(404).json({ success:false, message: "Lead not found" });
    return res.json({ success:true, lead });
  } catch (err) {
    console.error("getLead", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Update lead (partial)
export const updateLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const payload = req.body;
    const lead = await Lead.findOneAndUpdate({ _id: id, user: userId }, { $set: payload }, { new: true });
    if (!lead) return res.status(404).json({ success:false, message:"Lead not found" });
    return res.json({ success:true, lead });
  } catch (err) {
    console.error("updateLead", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Update stage (drag & drop)
export const updateStage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { stage } = req.body;
    const allowed = ["new","contacted","in-conversation","proposal-sent","qualified","won","lost","archived"];
    if (!allowed.includes(stage)) return res.status(400).json({ success:false, message: "Invalid stage" });
    const lead = await Lead.findOneAndUpdate({ _id: id, user: userId }, { $set: { stage }}, { new: true });
    if (!lead) return res.status(404).json({ success:false, message:"Lead not found" });
    return res.json({ success:true, lead });
  } catch (err) {
    console.error("updateStage", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Delete (soft-delete)
export const deleteLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const lead = await Lead.findOneAndUpdate({ _id: id, user: userId }, { $set: { archived: true }}, { new: true });
    if (!lead) return res.status(404).json({ success:false, message:"Lead not found" });
    return res.json({ success:true, lead });
  } catch (err) {
    console.error("deleteLead", err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

export const markLeadCompleted = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const lead = await Lead.findOne({ _id: id, user: userId });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    lead.completed = true;
    lead.completed_at = new Date();
    lead.handled_by = userId;

    await lead.save();

    return res.json({ success: true, lead });
  } catch (err) {
    console.error("markLeadCompleted", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

