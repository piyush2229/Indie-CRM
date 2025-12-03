import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { useState } from "react";
import Button from "../../components/ui/button";

export default function ClientDetails() {
  const { id } = useParams();
  const { data, loading } = useFetch(`/clients/${id}`);
  const [note, setNote] = useState("");
  const [refreshToggle, setRefreshToggle] = useState(false);

  if (loading) return <p className="p-6 text-slate-300">Loading client...</p>;
  const client = data?.client;

  const refreshClient = async () => {
    setRefreshToggle(!refreshToggle); 
    window.location.reload();
  };

  const sendNote = async () => {
    if (!note.trim()) return toast.error("Enter a message");

    try {
      await api.post(`/clients/${id}/reply`, { message: note });
      setNote("");
      toast.success("Email sent & added to history");
      refreshClient();
    } catch (err) {
      console.error(err);
      toast.error("Could not send reply");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 border border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            {client.name}
            {client.history?.length > 1 && (
              <span className="text-yellow-400 text-lg">*</span>
            )}
          </CardTitle>
          <p className="text-slate-400">{client.email}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <strong className="text-slate-400">Company:</strong> {client.company || "—"}
          </div>

          {/* HISTORY */}
          <div className="mt-4">
            <strong className="text-slate-400">History</strong>
            <div className="mt-3 space-y-3">
              {client.history?.map((h, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded-md">
                  <div className="text-sm text-slate-300">{h.message}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {h.type} — {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REPLY BOX */}
          <div>
            <strong className="text-slate-400">Send Reply (Email)</strong>
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
    </div>
  );
}
