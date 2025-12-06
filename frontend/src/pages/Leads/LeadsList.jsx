import { Link, useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { useState } from "react";

export default function LeadsList() {
  // ----------------------------------------
  // HOOKS
  // ----------------------------------------
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const navigate = useNavigate();

  const page = Number(params.get("page")) || 1;
  const limit = 10;

  // filters from URL (read-only)
  const promoFilter = params.get("promo") === "true";
  const completedFilter = params.get("completed") === "true";
  const notCompletedFilter = params.get("notCompleted") === "true";
  const sortDate = params.get("sort") === "date";

  // fetch
  const { data, loading, mutate } = useFetch(
    `/leads?page=${page}&limit=${limit}`
  );

  // dropdown open/close
  const [openFilters, setOpenFilters] = useState(false);

  // ----------------------------------------
  // EARLY LOADING RETURN
  // ----------------------------------------
  if (loading) return <p className="p-6 text-slate-300">Loading leads...</p>;

  let leads = [...(data?.leads || [])];
  const pages = data?.pages || 1;

  // ----------------------------------------
  // APPLY FILTERS
  // ----------------------------------------
  if (promoFilter) leads = leads.filter((l) => l.isPromotion);
  if (completedFilter) leads = leads.filter((l) => l.completed);
  if (notCompletedFilter) leads = leads.filter((l) => !l.completed);
  if (sortDate)
    leads = leads.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------
  const markCompleted = async (id) => {
    try {
      await api.patch(`/leads/${id}/complete`);
      toast.success("Lead marked completed");
      mutate();
    } catch {
      toast.error("Failed to mark complete");
    }
  };

  const togglePromotion = async (id) => {
    try {
      await api.patch(`/leads/${id}/promotion`);
      toast.success("Updated");
      mutate();
    } catch {
      toast.error("Failed");
    }
  };

  // 🗑 Delete ALL promotion leads on CURRENT PAGE
  const deleteAllPromotions = async () => {
    const promoLeads = leads.filter((l) => l.isPromotion);

    if (promoLeads.length === 0) {
      toast.info("No promotion leads on this page.");
      return;
    }

    const ok = window.confirm(
      `Are you sure you want to delete ${promoLeads.length} promo leads on this page?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    try {
      await Promise.all(
        promoLeads.map((lead) => api.delete(`/leads/${lead._id}`))
      );
      toast.success("Promotion leads deleted");
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete some leads");
    }
  };

  // ----------------------------------------
  // FILTER HELPERS
  // ----------------------------------------
  // toggle on/off individual filter in URL
  const setFilter = (key, value) => {
    const current = params.get(key);

    const targetValue =
      typeof value === "boolean" ? String(value) : String(value);

    if (current === targetValue) {
      // toggle OFF
      params.delete(key);
    } else {
      // toggle ON
      params.set(key, targetValue);
    }

    params.set("page", 1);
    navigate(`?${params.toString()}`);
  };

  const clearFilters = () => {
    ["promo", "completed", "notCompleted", "sort"].forEach((f) =>
      params.delete(f)
    );
    navigate(`?page=1`);
  };

  const goToPage = (p) => {
    params.set("page", p);
    navigate(`?${params.toString()}`);
  };

  const anyFilterActive =
    promoFilter || completedFilter || notCompletedFilter || sortDate;

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div className="p-6 relative">
      {/* HEADER + FILTERS + BULK ACTIONS */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-3xl font-semibold text-white">Leads</h1>

        <div className="flex items-center gap-3">
          {/* Delete all promo leads (current page) */}
          <button
            onClick={deleteAllPromotions}
            className="px-4 py-2 bg-red-700 text-white rounded-lg border border-red-500 hover:bg-red-600 text-sm"
          >
            Delete Promo Leads
          </button>

          {/* Filters dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenFilters(!openFilters)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700 text-sm"
            >
              Filters ▾
            </button>

            {openFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {/* Sort by Date */}
                <button
                  onClick={() => setFilter("sort", "date")}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center"
                >
                  <span>Sort by Date</span>
                  {sortDate && (
                    <span className="text-green-400 font-bold">✓</span>
                  )}
                </button>

                {/* Promotion Only */}
                <button
                  onClick={() => setFilter("promo", true)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center"
                >
                  <span>Promotion Only</span>
                  {promoFilter && (
                    <span className="text-green-400 font-bold">✓</span>
                  )}
                </button>

                {/* Completed Only */}
                <button
                  onClick={() => setFilter("completed", true)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center"
                >
                  <span>Completed Only</span>
                  {completedFilter && (
                    <span className="text-green-400 font-bold">✓</span>
                  )}
                </button>

                {/* Not Completed */}
                <button
                  onClick={() => setFilter("notCompleted", true)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 flex justify-between items-center"
                >
                  <span>Not Completed</span>
                  {notCompletedFilter && (
                    <span className="text-green-400 font-bold">✓</span>
                  )}
                </button>

                <hr className="border-slate-700" />

                <button
                  onClick={clearFilters}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 text-sm text-red-400"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {promoFilter && (
          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded-md border border-yellow-600">
            Promotion
          </span>
        )}

        {completedFilter && (
          <span className="px-3 py-1 bg-green-600/20 text-green-300 text-xs rounded-md border border-green-600">
            Completed
          </span>
        )}

        {notCompletedFilter && (
          <span className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-600">
            Not Completed
          </span>
        )}

        {sortDate && (
          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-md border border-purple-600">
            Sorted by Date
          </span>
        )}

        {anyFilterActive && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-red-700/20 text-red-400 text-xs rounded-md border border-red-700"
          >
            Clear All ×
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Score</th>
              <th className="p-3">Actions</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="border-b border-slate-800 hover:bg-slate-800/60 transition"
              >
                {/* NAME + BADGES */}
                <td className="p-3 text-slate-200 flex flex-col gap-1">
                  {lead.name}

                  {lead.isPromotion && (
                    <span className="text-yellow-400 text-xs bg-yellow-700/20 px-2 py-1 rounded">
                      Promotion
                    </span>
                  )}

                  {lead.completed && (
                    <span className="text-green-400 text-xs bg-green-700/20 px-2 py-1 rounded">
                      ✔ Completed
                    </span>
                  )}
                </td>

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

                {/* ACTIONS */}
                <td className="p-3 flex flex-col gap-2">
                  {/* No buttons once promo OR completed */}
                  {!(lead.completed || lead.isPromotion) && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-600 text-xs rounded"
                        onClick={() => markCompleted(lead._id)}
                      >
                        Mark Done
                      </button>

                      <button
                        className="px-2 py-1 bg-yellow-600 text-xs rounded"
                        onClick={() => togglePromotion(lead._id)}
                      >
                        Mark Promo
                      </button>
                    </>
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
                <td colSpan={6} className="p-4 text-center text-slate-400">
                  No leads found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-2 p-4 bg-slate-800 border-t border-slate-700">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-3 py-1 bg-slate-700 disabled:opacity-40 rounded"
          >
            Prev
          </button>

          <span className="text-slate-300 text-sm">
            Page {page} of {pages}
          </span>

          <button
            disabled={page >= pages}
            onClick={() => goToPage(page + 1)}
            className="px-3 py-1 bg-slate-700 disabled:opacity-40 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
