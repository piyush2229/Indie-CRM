import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import Badge from "../ui/badge";
import Button from "../ui/button";

export default function LeadDetailsCard({ lead, onGenerateReply }) {
  return (
    <Card className="p-6 bg-slate-800 border border-slate-700 rounded-xl text-white">

      <CardHeader>
        <CardTitle className="text-2xl">{lead.name}</CardTitle>
        <CardDescription className="text-slate-300">
          {lead.email}
        </CardDescription>

        <div className="flex gap-2 flex-wrap mt-2">
          <Badge variant="primary">{lead.source}</Badge>
          <Badge
            variant={
              lead.urgency === "high"
                ? "danger"
                : lead.urgency === "medium"
                ? "warning"
                : "default"
            }
          >
            {lead.urgency}
          </Badge>
        </div>
      </CardHeader>

      <div className="space-y-5 mt-4">

        <div>
          <h4 className="font-semibold mb-1">Subject</h4>
          <p className="text-slate-300">{lead.subject}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Message</h4>
          <p className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-slate-300 whitespace-pre-line">
            {lead.body}
          </p>
        </div>

        {lead.ai_summary && (
          <div>
            <h4 className="font-semibold mb-1">AI Summary</h4>
            <p className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-slate-300">
              {lead.ai_summary}
            </p>
          </div>
        )}

        {lead.ai_tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {lead.ai_tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button className="mt-6 w-full" onClick={onGenerateReply}>
        Generate Smart Reply
      </Button>
    </Card>
  );
}
