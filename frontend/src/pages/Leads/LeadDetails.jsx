// frontend/src/pages/Leads/LeadDetails.jsx

import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Tag, BadgePercent } from "lucide-react";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(`/leads/${id}`);
  const [showFull, setShowFull] = useState(false); // <--- FIXED
  const handleComplete = async () => {
  try {
    await api.patch(`/leads/${id}/complete`);
    toast.success("Lead marked as completed");
    window.location.reload();
  } catch {
    toast.error("Failed to complete lead");
  }
};

  if (loading) return <p className="p-6 text-slate-300">Loading...</p>;
  const lead = data?.lead;

  // Detect promotions
  const isPromotion = /sale|offer|discount|subscribe|promotion|deal|limited/i.test(
    `${lead.subject} ${lead.body}`
  );

  const previewText =
    lead.body.length > 250 ? lead.body.slice(0, 250) + "..." : lead.body;

  const handleApprove = async () => {
    try {
      const res = await api.post(`/clients/from-lead/${id}`);
      toast.success("Lead converted to client");

      navigate(`/clients/${res.data.client._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Conversion failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl">
        
        {/* HEADER */}
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-white">{lead.name}</CardTitle>
              <p className="text-slate-400">{lead.email}</p>
            </div>

            {isPromotion && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 
              text-yellow-400 text-xs rounded-md border border-yellow-600/40">
                <BadgePercent size={14} /> Promotion
              </span>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-6 mt-4">

          {/* SUBJECT */}
          <p className="text-slate-300 text-sm leading-relaxed">
            <strong className="text-slate-400">Subject:</strong> {lead.subject}
          </p>

          {/* EMAIL BODY */}
          <div className="bg-slate-800/60 p-4 rounded-lg text-slate-200 leading-relaxed shadow-inner">
            <p className="whitespace-pre-wrap">
              {showFull ? lead.body : previewText}
            </p>

            {lead.body.length > 250 && (
              <button
                className="mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                onClick={() => setShowFull(!showFull)}
              >
                {showFull ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          {/* AI SUMMARY */}
          {lead.ai_summary && (
            <div>
              <strong className="text-slate-400">AI Summary:</strong>
              <p className="mt-2 text-slate-300 leading-relaxed">{lead.ai_summary}</p>
            </div>
          )}

          {/* AI TAGS */}
          {lead.ai_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lead.ai_tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 
                  text-slate-300 text-xs rounded-md"
                >
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          )}

         {/* ACTION BUTTONS */}
        {/* ACTION BUTTONS */}
<div className="flex gap-3 mt-4">

  {/* Show approve button ONLY if not converted */}
  {!lead.convertedToClient ? (
    <Button
      className="bg-green-600 hover:bg-green-700"
      onClick={handleApprove}
    >
      Approve & Convert to Client
    </Button>
  ) : (
    <span className="px-3 py-1 bg-blue-700/30 text-blue-300 text-sm rounded-md">
      Already Added to Client
    </span>
  )}

  <Button variant="outline" onClick={() => window.location.reload()}>
    Refresh
  </Button>
</div>


          {/* COMPLETED BUTTON */}
            <div className="flex gap-3 mt-4">
            {!lead.completed ? (
                <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
                >
                Mark as Completed
                </Button>
            ) : (
                <span className="px-3 py-1 bg-green-700/30 text-green-300 text-sm rounded-md">
                ✔ Completed on {new Date(lead.completed_at).toLocaleDateString()}
                </span>
            )}

            <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
            </Button>
            </div>

        </CardContent>
      </Card>
    </div>
    
  );
}
