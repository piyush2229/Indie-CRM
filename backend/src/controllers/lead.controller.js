import Lead from "../models/Lead.js";
import { classifyLead } from "../services/gemini.service.js";

/**
 * Create lead (manual or Gmail import)
 */
export const createLead = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      email,
      phone,
      company,
      subject,
      body,
      source,
      next_followup_at
    } = req.body;

    const lead = new Lead({
      user: userId,
      name,
      email,
      phone,
      company,
      subject,
      body,
      source: source || "manual",
      next_followup_at: next_followup_at || null,
      archived: false,        // ⭐ IMPORTANT FIX
      isPromotion: false,
    });

    // AI processing
    const aiText = `${subject || ""}\n\n${body || ""}`;
    const ai = await classifyLead(aiText);

    lead.ai_tags = ai.tags;
    lead.ai_summary = ai.summary;
    lead.lead_score = ai.score;
    lead.urgency = ai.urgency;

    await lead.save();

    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error("createLead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * List leads with pagination
 */
export const listLeads = async (req, res) => {
  try {
    const userId = req.user._id;

    let { page = 1, limit = 10, q, stage } = req.query;
    page = Number(page);
    limit = Number(limit);

    const filter = { user: userId, archived: false };

    if (stage) filter.stage = stage;

    if (q)
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } }
      ];

    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      leads,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("listLeads:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get a single lead
 */
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    res.json({ success: true, lead });
  } catch (err) {
    console.error("getLead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update lead
 */
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, lead });
  } catch (err) {
    console.error("updateLead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update stage
 */
export const updateStage = async (req, res) => {
  try {
    const allowed = [
      "new",
      "contacted",
      "in-conversation",
      "proposal-sent",
      "qualified",
      "won",
      "lost",
      "archived"
    ];

    if (!allowed.includes(req.body.stage))
      return res.status(400).json({ success: false, message: "Invalid stage" });

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { stage: req.body.stage },
      { new: true }
    );

    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    res.json({ success: true, lead });
  } catch (err) {
    console.error("updateStage:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Soft delete lead
 */
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { archived: true },
      { new: true }
    );

    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    res.json({ success: true, lead });
  } catch (err) {
    console.error("deleteLead:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mark completed
 */
export const markLeadCompleted = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    lead.completed = true;
    lead.completed_at = new Date();
    lead.handled_by = req.user._id;

    await lead.save();

    res.json({ success: true, lead });
  } catch (err) {
    console.error("markLeadCompleted:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Toggle Promotion
 */
export const togglePromotion = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!lead)
      return res.status(404).json({ message: "Lead not found" });

    lead.isPromotion = !lead.isPromotion;

    await lead.save();

    res.json({ success: true, lead });
  } catch (err) {
    console.error("togglePromotion:", err);
    res.status(500).json({ message: err.message });
  }
};
