import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { useState } from "react";
import Button from "../../components/ui/button";
import ReplyModal from "../../components/clients/ReplyModal.jsx";
import { useAuth } from "../../context/AuthContext";

export default function ClientDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, mutate } = useFetch(`/clients/${id}`);

  const [note, setNote] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drafts, setDrafts] = useState({});
  const client = data?.client;

  if (loading) return <p className="p-6 text-slate-300">Loading client...</p>;

  // 🔁 Refresh using SWR-style mutate
  const refreshClient = async () => {
    mutate();
  };

  // -----------------------------------------
  // SEND EMAIL / SAVE REPLY TO HISTORY
  // -----------------------------------------
  const sendNote = async () => {
    if (!note.trim()) return toast.error("Enter a message");

    try {
      await api.post(`/clients/${id}/reply`, { message: note });
      toast.success("Email sent & saved to history");
      setNote("");
      refreshClient();
    } catch (err) {
      console.error(err);
      toast.error("Could not send reply");
    }
  };

  // -----------------------------------------
  // GENERATE AI DRAFTS
  // -----------------------------------------
  const generateDrafts = () => {
    const name = client.name || "there";
    const subject = client.history?.[0]?.meta?.subject || "your project";
    const summary = client.history?.[0]?.message?.slice(0, 120) || "";

    const short = `Hi ${name}, can we do a quick call regarding "${subject}"? — ${user?.name}`;

    const standard = `
Hi ${name},

Thanks for reaching out about "${subject}". ${summary}

I'd love to take this forward. Here's what I suggest:
1. Quick call to finalize scope  
2. I'll share a proposal  
3. We begin immediately  

Best regards,  
${user?.name}
`;

    const expanded = `
Hi ${name},

Really appreciate your message regarding "${subject}". I reviewed everything you shared and here's how we can proceed:

• Clear deliverables  
• Smooth onboarding  
• Predictable timeline  
• Open communication  

If you'd like, I can prepare a proposal immediately.

Warm regards,  
${user?.name}
`;

    setDrafts({ short, standard, expanded });
    setModalOpen(true);
  };

  // -----------------------------------------
  // WHEN USER SELECTS A DRAFT FROM MODAL
  // -----------------------------------------
  const handleDraftSelect = async (text, action) => {
    if (action === "insert") {
      setNote(text);
      setModalOpen(false);
      return;
    }

    if (action === "save") {
      try {
        await api.post(`/clients/${id}/history`, {
          type: "reply",
          message: text
        });
        toast.success("Saved to history");
        setModalOpen(false);
        refreshClient();
      } catch (err) {
        toast.error("Could not save message");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 border border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            {client.name}

            {/* ⭐ If client has more than one history entry → important client */}
            {client.history?.length > 1 && (
              <span className="text-yellow-400 text-lg">*</span>
            )}
          </CardTitle>

          <p className="text-slate-400">{client.email}</p>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* COMPANY */}
          <div>
            <strong className="text-slate-400">Company:</strong>{" "}
            {client.company || "—"}
          </div>

          {/* HISTORY FEED */}
          <div className="mt-4">
            <strong className="text-slate-400">History</strong>

            <div className="mt-3 space-y-3">
              {client.history?.length === 0 && (
                <div className="text-slate-400">No history yet.</div>
              )}

              {client.history?.map((h, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded-md">
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {h.message}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {h.type} — {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REPLY BOX */}
          <div>
            <div className="flex justify-between items-center">
              <strong className="text-slate-400">Send Reply (Email)</strong>

              <Button
                className="bg-purple-600 text-white px-3 py-1 text-sm"
                onClick={generateDrafts}
              >
                Generate AI Draft
              </Button>
            </div>

            <textarea
              rows="4"
              className="w-full mt-2 p-3 rounded bg-slate-800 text-slate-200"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your message…"
            />

            <div className="mt-2 flex gap-2">
              <Button onClick={sendNote} className="bg-blue-600">
                Send Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      <ReplyModal
        open={modalOpen}
        drafts={drafts}
        onClose={() => setModalOpen(false)}
        onSelect={handleDraftSelect}
      />
    </div>
  );
}
