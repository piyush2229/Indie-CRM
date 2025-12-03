import { Link, useLocation } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

export default function LeadsList() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const isPriority = params.get("priority") === "true";
  const isHigh = params.get("high") === "true";
  const isCompleted = params.get("completed") === "true";

  const { data, loading } = useFetch("/leads");

  if (loading) return <p className="p-6 text-slate-300">Loading leads...</p>;

  let leads = data?.leads || [];

  // ⭐ Apply filters
  if (isPriority) {
    leads = leads.filter(
      (l) =>
        l.urgency === "high" ||
        l.urgency === "medium" ||
        l.lead_score >= 60
    );
  }

  if (isHigh) {
    leads = leads.filter((l) => l.urgency === "high");
  }

  if (isCompleted) {
    leads = leads.filter((l) => l.completed === true);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-white">
        {isPriority
          ? "Priority Leads"
          : isHigh
          ? "High Urgency Leads"
          : isCompleted
          ? "Completed Leads"
          : "Leads"}
      </h1>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Score</th>
              <th className="p-3">Completed</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="border-b border-slate-800 hover:bg-slate-800/60 transition"
              >
                <td className="p-3 text-slate-200">{lead.name}</td>
                <td className="p-3 text-slate-300">{lead.email}</td>

                <td className="p-3 capitalize">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      lead.urgency === "high"
                        ? "bg-red-500/20 text-red-400"
                        : lead.urgency === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {lead.urgency}
                  </span>
                </td>

                <td className="p-3 text-slate-300">{lead.lead_score}</td>

                <td className="p-3">
                  {lead.completed ? (
                    <span className="text-green-400 text-xs">✔ Done</span>
                  ) : (
                    <span className="text-slate-500 text-xs">Pending</span>
                  )}
                </td>

                <td className="p-3 text-right">
                  <Link
                    to={`/leads/${lead._id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-slate-400"
                  colSpan={6}
                >
                  No leads found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
