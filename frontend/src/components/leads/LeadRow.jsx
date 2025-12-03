import React from "react";
import { TR, TD } from "../ui/table";
import Badge from "../ui/badge";
import { Link } from "react-router-dom";

export default function LeadRow({ lead }) {
  return (
    <>
      {/* DESKTOP TABLE ROW (valid HTML) */}
      <TR className="hidden md:table-row text-white hover:bg-slate-700">

        <TD>
          <Link
            to={`/leads/${lead._id}`}
            className="text-blue-400 font-medium hover:underline"
          >
            {lead.name}
          </Link>
        </TD>

        <TD className="text-slate-300">{lead.email}</TD>
        <TD className="text-slate-300">{lead.subject || "-"}</TD>

        <TD>
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
        </TD>

        <TD>
          <Badge variant="primary">{lead.source}</Badge>
        </TD>

        <TD className="text-slate-400">
          {new Date(lead.createdAt).toLocaleDateString()}
        </TD>
      </TR>

      {/* MOBILE CARD (completely separate, outside <table> layout) */}
      <div className="md:hidden p-4 mb-3 bg-slate-800 border border-slate-700 rounded-lg text-white">

        <Link
          to={`/leads/${lead._id}`}
          className="text-lg font-semibold text-blue-400 hover:underline"
        >
          {lead.name}
        </Link>

        <p className="text-xs text-slate-400 break-all mt-1">
          {lead.email}
        </p>

        <p className="text-sm mt-3">
          <strong>Subject:</strong> {lead.subject || "-"}
        </p>

        <div className="flex gap-2 mt-3">
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
          <Badge variant="primary">{lead.source}</Badge>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          {new Date(lead.createdAt).toLocaleDateString()}
        </p>
      </div>
    </>
  );
}
