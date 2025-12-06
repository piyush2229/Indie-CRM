// frontend/src/pages/Clients/ClientsList.jsx
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";

export default function ClientsList() {
  const { data, loading, mutate } = useFetch("/clients");

  // 🔍 Search state
  const [search, setSearch] = useState("");

  if (loading) return <p className="p-6 text-slate-300">Loading clients...</p>;

  // All clients
  let clients = data?.clients || [];

  // 🔍 Filter by name/email
  if (search.trim() !== "") {
    const s = search.toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s)
    );
  }

  // ----------------------------------------
  // DELETE CLIENT + LEADS
  // ----------------------------------------
  const deleteClient = async (id, name) => {
    const ok = window.confirm(
      `Are you sure you want to delete client "${name}"?\n\n` +
      "This will permanently delete:\n" +
      "• The client\n" +
      "• All leads associated with this client\n"
    );
    if (!ok) return;

    try {
      await api.delete(`/clients/${id}`);
      toast.success("Client and related leads deleted");
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete client");
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Clients</h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 w-full sm:w-72"
        />
      </div>

      {/* CLIENT LIST */}
      <div className="grid gap-4">
        {clients.length === 0 && (
          <Card className="p-6 bg-slate-900 border border-slate-700">
            <CardContent>
              <p className="text-slate-300">
                {search
                  ? "No clients match your search."
                  : "No clients yet — convert leads to clients from a lead details page."}
              </p>
            </CardContent>
          </Card>
        )}

        {clients.map((c) => (
          <Card
            key={c._id}
            className="p-4 bg-slate-900 border border-slate-700 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-lg text-white">{c.name}</div>
              <div className="text-sm text-slate-400">{c.email}</div>
              <div className="text-sm text-slate-400 mt-1">
                {c.company || "No company"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/clients/${c._id}`}
                className="text-sm px-3 py-2 bg-white text-black rounded-md"
              >
                View
              </Link>

              <button
                onClick={() => deleteClient(c._id, c.name)}
                className="text-sm px-3 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
