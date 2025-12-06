// frontend/src/pages/Projects/ProjectDetails.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, mutate } = useFetch(`/projects/${id}`);

  const [message, setMessage] = useState("");

  if (loading) return <p className="p-6 text-slate-300">Loading...</p>;

  const project = data?.project;
  const client = project?.client;

  // --------------------------------------
  // MARK COMPLETE
  // --------------------------------------
  const markComplete = async () => {
    try {
      await api.patch(`/projects/${id}/complete`);
      toast.success("Project marked completed");
      mutate();
    } catch {
      toast.error("Could not complete project");
    }
  };

  // --------------------------------------
  // DELETE PROJECT
  // --------------------------------------
  const deleteProject = async () => {
    const ok = window.confirm(
      "Are you sure?\n\nThis will delete:\n• The project\n• All leads\n• The client (if no other projects)\n\nThis cannot be undone."
    );
    if (!ok) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  // --------------------------------------
  // SEND EMAIL (Project → Client)
  // SAME LOGIC AS CLIENT DETAILS (GMAIL)
  // --------------------------------------
  const sendEmail = async () => {
    if (!message.trim()) return toast.error("Enter a message");

    try {
      await api.post(`/projects/${id}/reply`, { message });

      toast.success("Email sent & saved to project history");

      setMessage("");
      mutate(); // refresh messages
    } catch (err) {
      console.error("Email error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="p-6 space-y-6">

      <Card className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white text-xl">{project.title}</CardTitle>
              <p className="text-slate-400">{client?.name}</p>
              <p className="text-slate-500 text-xs mt-1">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!project.completed ? (
                <Button className="bg-green-600" onClick={markComplete}>
                  Mark Complete
                </Button>
              ) : (
                <div className="text-sm text-green-300">
                  ✔ Completed on {new Date(project.completed_at).toLocaleDateString()}
                </div>
              )}

              <Button className="bg-red-600 hover:bg-red-700" onClick={deleteProject}>
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>

          {/* ------------------------------------------------------------- */}
          {/*   PROJECT DESCRIPTION */}
          {/* ------------------------------------------------------------- */}
          <p className="text-slate-300 mb-4">{project.description}</p>

          {/* ------------------------------------------------------------- */}
          {/*   EMAIL SECTION */}
          {/* ------------------------------------------------------------- */}
          <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              Send Email to Client
            </h3>

            <textarea
              className="w-full p-2 bg-slate-700 text-slate-200 rounded"
              rows="4"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <Button className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={sendEmail}>
              Send Email
            </Button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/*   PROJECT EMAIL HISTORY */}
          {/* ------------------------------------------------------------- */}
          <h4 className="text-lg font-semibold text-white mb-3">Email / Messages Activity</h4>

          {project.messages?.length === 0 ? (
            <p className="text-slate-400">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {project.messages.map((m, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded">
                  <p className="text-slate-200 whitespace-pre-wrap">{m.message}</p>
                  {m.meta?.subject && (
                    <p className="text-slate-400 text-sm mt-1">
                      Subject: {m.meta.subject}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/*   LEADS IN THIS PROJECT */}
          {/* ------------------------------------------------------------- */}
          <h4 className="text-lg font-semibold mt-6 mb-3">Leads in this project</h4>

          {project.leads?.length === 0 ? (
            <p className="text-slate-400">No leads attached</p>
          ) : (
            <div className="space-y-3">
              {project.leads.map((l) => (
                <div
                  key={l._id}
                  className="p-3 bg-slate-800 rounded flex justify-between items-start"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{l.name}</div>
                    <div className="text-sm text-slate-400">{l.email}</div>

                    <div className="mt-1 text-xs">
                      {l.completed ? (
                        <span className="px-2 py-1 bg-green-700/30 text-green-300 rounded">
                          ✔ Lead Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Link to={`/leads/${l._id}`} className="text-blue-400">
                      Open
                    </Link>

                    <p className="text-xs text-slate-400">
                      {l.urgency} • Score: {l.lead_score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}
