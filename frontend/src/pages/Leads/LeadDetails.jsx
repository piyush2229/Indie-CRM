// frontend/src/pages/Leads/LeadDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Tag, BadgePercent } from "lucide-react";

/**
 * Lead details page + modal to add lead to project / create project
 */

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-900 rounded-xl max-w-xl w-full p-6 shadow-xl">
        <button className="float-right text-sm text-slate-400" onClick={onClose}>Close</button>
        <div className="clear-both" />
        {children}
      </div>
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(`/leads/${id}`);
  const [showFull, setShowFull] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientProjects, setClientProjects] = useState([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);

  if (loading) return <p className="p-6 text-slate-300">Loading...</p>;
  const lead = data?.lead;

  // detect promotions
  const isPromotion = /sale|offer|discount|subscribe|promotion|deal|limited/i.test(
    `${lead.subject} ${lead.body}`
  );

  const previewText = lead.body.length > 250 ? lead.body.slice(0, 250) + "..." : lead.body;

  const handleApprove = async () => {
    try {
      // convert lead to client (creates client if not exists)
      const res = await api.post(`/clients/from-lead/${id}`);
      toast.success("Lead converted to client");
      const client = res.data.client;
      setCurrentClient(client);

      // fetch client's active (not completed) projects
      await fetchClientProjects(client._id);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Conversion failed");
    }
  };

  const fetchClientProjects = async (clientId) => {
    try {
      setLoadingProjects(true);
      const res = await api.get(`/projects?clientId=${clientId}&completed=false`);
      setClientProjects(res.data.projects || []);
    } catch (err) {
      console.error("Could not fetch projects", err);
      setClientProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAddToExisting = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/add-lead`, { leadId: id });
      toast.success("Lead added to project");
      setModalOpen(false);
      // optional: navigate to project details
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not add to project");
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return toast.error("Enter project title");
    try {
      const payload = {
        clientId: currentClient._id,
        title: newProjectTitle,
        description: newProjectDesc,
        initialLeadId: id
      };
      const res = await api.post("/projects", payload);
      toast.success("Project created & lead attached");
      setModalOpen(false);
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not create project");
    }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/leads/${id}/complete`);
      toast.success("Lead marked as completed");
      window.location.reload();
    } catch {
      toast.error("Failed to complete lead");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-white">{lead.name}</CardTitle>
              <p className="text-slate-400">{lead.email}</p>
            </div>

          
          </div>
        </CardHeader>

        <CardContent className="space-y-6 mt-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            <strong className="text-slate-400">Subject:</strong> {lead.subject || "Update (no subject)"}
          </p>

          <div className="bg-slate-800/60 p-4 rounded-lg text-slate-200 leading-relaxed shadow-inner">
            <p className="whitespace-pre-wrap">{showFull ? lead.body : previewText}</p>

            {lead.body.length > 250 && (
              <button
                className="mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                onClick={() => setShowFull(!showFull)}
              >
                {showFull ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          {lead.ai_summary && (
            <div>
              <strong className="text-slate-400">AI Summary:</strong>
              <p className="mt-2 text-slate-300 leading-relaxed">{lead.ai_summary}</p>
            </div>
          )}

          {lead.ai_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lead.ai_tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4 flex-wrap">
            {!lead.convertedToClient && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                Approve & Convert to Client
              </Button>
            )}

            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>

            {!lead.completed ? (
              <Button className="bg-indigo-600" onClick={handleComplete}>Mark as Completed</Button>
            ) : (
              <span className="px-3 py-1 bg-green-700/30 text-green-300 text-sm rounded-md">
                ✔ Completed on {new Date(lead.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal: choose project or create new */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold">Attach lead to project</h3>
        <p className="text-sm text-slate-300 mt-1">Client: {currentClient?.name}</p>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium">Add to existing active project</h4>
            {loadingProjects ? (
              <div className="text-slate-400">Loading projects...</div>
            ) : clientProjects.length === 0 ? (
              <div className="text-slate-400">No active projects found for this client.</div>
            ) : (
              <div className="mt-2 space-y-2">
                {clientProjects.map((p) => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-md">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-slate-400">{p.description}</div>
                    </div>
                    <div>
                      <button className="px-3 py-1 bg-blue-600 rounded-md" onClick={() => handleAddToExisting(p._id)}>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-700" />

          <div>
            <h4 className="font-medium">Or create a new project</h4>
            <input
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project title"
              className="w-full mt-2 p-2 rounded bg-slate-800 text-slate-200"
            />
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full mt-2 p-2 rounded bg-slate-800 text-slate-200"
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button className="px-4 py-2 bg-green-600 rounded-md" onClick={handleCreateProject}>Create & Attach</button>
              <button className="px-4 py-2 bg-slate-700 rounded-md" onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
