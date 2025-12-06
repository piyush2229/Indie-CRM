// backend/src/controllers/client.controller.js
import Client from "../models/Client.js";
import Lead from "../models/Lead.js";
import Project from "../models/Project.js"; // optional delete support

/**
 * Convert lead -> client
 */
export const convertLeadToClient = async (req, res) => {
  try {
    const leadId = req.params.id;
    const userId = req.user._id;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Safe fallbacks
    const safeName =
      lead.name?.trim() ||
      (lead.email ? lead.email.split("@")[0] : null) ||
      "Unknown Client";

    const safeEmail = lead.email || "no-email@unknown";

    // Check if a client for this email already exists
    let client = await Client.findOne({ user: userId, email: safeEmail });

    if (!client) {
      client = new Client({
        user: userId,
        name: safeName,
        email: safeEmail,
        company: "",
        notes: "",
        history: [
          {
            type: "import",
            message: lead.body || lead.snippet || "",
            meta: { fromLeadId: lead._id, subject: lead.subject || "" },
            createdBy: userId,
          },
        ],
      });

      await client.save();
    } else {
      client.history.push({
        type: "import",
        message: lead.body || lead.snippet || "",
        meta: { fromLeadId: lead._id, subject: lead.subject || "" },
        createdBy: userId,
      });
      await client.save();
    }

    // Link lead -> client
    lead.convertedToClient = client._id;
    await lead.save();

    return res.json({ success: true, client });
  } catch (err) {
    console.error("convertLeadToClient error:", err);
    return res.status(500).json({
      message: "Could not convert lead",
      error: err.message,
    });
  }
};

/**
 * List clients
 */
export const listClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    return res.json({ success: true, clients });
  } catch (err) {
    console.error("listClients:", err);
    return res.status(500).json({ message: "Could not list clients" });
  }
};

/**
 * Fetch client
 */
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    return res.json({ success: true, client });
  } catch (err) {
    console.error("getClient:", err);
    return res.status(500).json({ message: "Could not fetch client" });
  }
};

/**
 * Add client history entry
 */
export const addClientHistory = async (req, res) => {
  try {
    const { type = "note", message = "", meta = {} } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    client.history.push({
      type,
      message,
      meta,
      createdBy: req.user._id,
    });

    await client.save();

    return res.json({ success: true, client });
  } catch (err) {
    console.error("addClientHistory:", err);
    return res.status(500).json({ message: "Could not add history" });
  }
};

/**
 * ⭐ DELETE CLIENT + all its leads
 */
export const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: clientId, user: userId });
    if (!client) return res.status(404).json({ message: "Client not found" });

    // 1️⃣ Delete all leads where convertedToClient matches
    await Lead.deleteMany({
      user: userId,
      convertedToClient: clientId,
    });

    // 2️⃣ (Optional) Delete projects of this client
    // const projects = await Project.find({ user: userId, client: clientId });
    // await Project.deleteMany({ user: userId, client: clientId });

    // 3️⃣ Delete the client itself
    await Client.findByIdAndDelete(clientId);

    return res.json({
      success: true,
      message: "Client and all related leads deleted",
    });
  } catch (err) {
    console.error("deleteClient:", err);
    return res.status(500).json({
      message: "Could not delete client",
      error: err.message,
    });
  }
};
