// backend/src/controllers/client.controller.js
import Client from "../models/Client.js";
import Lead from "../models/Lead.js";

/**
 * Convert lead -> client (creates client and attaches lead body as history)
 */
export const convertLeadToClient = async (req, res) => {
  try {
    const leadId = req.params.id;
    const userId = req.user._id;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // fallback safe name + email
    const safeName =
      lead.name?.trim() ||
      (lead.email ? lead.email.split("@")[0] : null) ||
      "Unknown Client";

    const safeEmail = lead.email || "no-email@unknown";

    // check if client already exists
    let client = await Client.findOne({ user: userId, email: lead.email });

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
            createdBy: userId
          }
        ]
      });

      await client.save();
    } else {
      client.history.push({
        type: "import",
        message: lead.body || lead.snippet || "",
        meta: { fromLeadId: lead._id, subject: lead.subject || "" },
        createdBy: userId
      });

      await client.save();
    }

    // link lead → client
    lead.convertedToClient = client._id;
    await lead.save();

    return res.json({ success: true, client });

  } catch (err) {
    console.error("convertLeadToClient error:", err);
    return res.status(500).json({
      message: "Could not convert lead",
      error: err.message
    });
  }
};

/**
 * List clients for authenticated user
 */
export const listClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, clients });
  } catch (err) {
    console.error("listClients:", err);
    return res.status(500).json({ message: "Could not list clients" });
  }
};

/**
 * Get single client & history
 */
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
    if (!client) return res.status(404).json({ message: "Client not found" });
    return res.json({ success: true, client });
  } catch (err) {
    console.error("getClient:", err);
    return res.status(500).json({ message: "Could not fetch client" });
  }
};

/**
 * Add history entry (note or reply)
 * body: { type, message, meta }
 */
export const addClientHistory = async (req, res) => {
  try {
    const { type = "note", message = "", meta = {} } = req.body;
    const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
    if (!client) return res.status(404).json({ message: "Client not found" });

    client.history.push({
      type,
      message,
      meta,
      createdBy: req.user._id
    });
    await client.save();
    return res.json({ success: true, client });
  } catch (err) {
    console.error("addClientHistory:", err);
    return res.status(500).json({ message: "Could not add history" });
  }
};
