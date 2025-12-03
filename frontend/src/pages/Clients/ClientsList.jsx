// frontend/src/pages/Clients/ClientsList.jsx
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";

export default function ClientsList() {
  const { data, loading } = useFetch("/clients");

  if (loading) return <p className="p-6 text-slate-300">Loading clients...</p>;

  const clients = data?.clients || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
      </div>

      <div className="grid gap-4">
        {clients.length === 0 && (
          <Card className="p-6">
            <CardContent>
              <p className="text-slate-300">No clients yet — convert leads to clients from a lead details page.</p>
            </CardContent>
          </Card>
        )}

        {clients.map((c) => (
          <Card key={c._id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{c.name}</div>
              <div className="text-sm text-slate-400">{c.email}</div>
              <div className="text-sm text-slate-400 mt-1">{c.company}</div>
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/clients/${c._id}`} className="text-sm px-3 py-2 bg-white text-black rounded-md">
                View
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
