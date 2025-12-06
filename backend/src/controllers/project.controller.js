// backend/src/controllers/project.controller.js
import Project from "../models/Project.js";
import Lead from "../models/Lead.js";
import Client from "../models/Client.js";

/**
 * Create project (optional attach initial lead)
 * body: { clientId, title, description, initialLeadId? }
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clientId, title, description = "", initialLeadId } = req.body;

    if (!clientId || !title) {
      return res.status(400).json({ message: "clientId and title required" });
    }

    // verify client belongs to user
    const client = await Client.findOne({ _id: clientId, user: userId });
    if (!client) return res.status(404).json({ message: "Client not found" });

    const project = new Project({
      user: userId,
      client: clientId,
      title,
      description,
      leads: initialLeadId ? [initialLeadId] : [],
    });

    await project.save();

    // optionally update lead convertedToClient
    if (initialLeadId) {
      await Lead.findOneAndUpdate(
        { _id: initialLeadId, user: userId },
        { $set: { convertedToClient: clientId } }
      );
    }

    return res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("createProject:", err);
    return res
      .status(500)
      .json({ message: "Could not create project", error: err.message });
  }
};

/**
 * Add existing lead to project
 * POST /projects/:id/add-lead  body: { leadId }
 */
export const addLeadToProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: projectId } = req.params;
    const { leadId } = req.body;

    if (!leadId) return res.status(400).json({ message: "leadId required" });

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const lead = await Lead.findOne({ _id: leadId, user: userId });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // avoid duplicates
    if (!project.leads.includes(lead._id)) {
      project.leads.push(lead._id);
      await project.save();
    }

    // set convertedToClient on lead (if not)
    if (!lead.convertedToClient) {
      lead.convertedToClient = project.client;
      await lead.save();
    }

    return res.json({ success: true, project });
  } catch (err) {
    console.error("addLeadToProject:", err);
    return res
      .status(500)
      .json({ message: "Could not add lead to project", error: err.message });
  }
};

/**
 * List projects (filter by clientId optionally)
 * GET /projects?clientId=...&completed=true|false
 */
export const listProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clientId, completed } = req.query;

    const filter = { user: userId };
    if (clientId) filter.client = clientId;
    if (completed !== undefined) filter.completed = completed === "true";

    const projects = await Project.find(filter)
      .sort({ updatedAt: -1 })
      .populate("leads")
      .populate("client");

    return res.json({ success: true, projects });
  } catch (err) {
    console.error("listProjects:", err);
    return res.status(500).json({ message: "Could not list projects" });
  }
};

/**
 * Get project details
 * GET /projects/:id
 */
export const getProject = async (req, res) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate("leads")
      .populate("client");

    if (!project) return res.status(404).json({ message: "Project not found" });

    return res.json({ success: true, project });
  } catch (err) {
    console.error("getProject:", err);
    return res.status(500).json({ message: "Could not fetch project" });
  }
};

/**
 * Mark project complete
 * PATCH /projects/:id/complete
 */
export const completeProject = async (req, res) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: req.params.id,
      user: userId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.completed = true;
    project.completed_at = new Date();
    await project.save();

    return res.json({ success: true, project });
  } catch (err) {
    console.error("completeProject:", err);
    return res
      .status(500)
      .json({ message: "Could not complete project" });
  }
};

/**
 * Delete project + its leads + delete client if no more projects remain
 * DELETE /projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;

    const project = await Project.findOne({ _id: projectId, user: userId })
      .populate("leads")
      .populate("client");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 1. Delete all leads inside the project
    if (project.leads && project.leads.length > 0) {
      const leadIds = project.leads.map((l) => l._id);
      await Lead.deleteMany({ _id: { $in: leadIds }, user: userId });
    }

    const clientId = project.client?._id;

    // 2. Delete the project itself
    await Project.findByIdAndDelete(projectId);

    // 3. If client has no more projects → delete client
    if (clientId) {
      const remainingProjects = await Project.countDocuments({
        user: userId,
        client: clientId,
      });

      if (remainingProjects === 0) {
        await Client.findByIdAndDelete(clientId);
      }
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("deleteProject:", err);
    return res.status(500).json({
      message: "Could not delete project",
      error: err.message,
    });
  }
};

/**
 * Add project message (for internal notes / "email sent" log)
 * POST /projects/:id/message
 * body: { message }
 */
export const addProjectMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const project = await Project.findOne({ _id: id, user: userId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Ensure messages array exists
    if (!Array.isArray(project.messages)) {
      project.messages = [];
    }

    project.messages.push({
      text: message,
      date: new Date(),
    });

    await project.save();

    return res.json({
      success: true,
      message: "Message added",
      project,
    });
  } catch (err) {
    console.error("addProjectMessage:", err);
    return res
      .status(500)
      .json({ message: "Could not add message" });
  }
};
