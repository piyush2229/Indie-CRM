// frontend/src/pages/Projects/ProjectsList.jsx
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { Card } from "../../components/ui/card";

export default function ProjectsList() {
  const { data, loading } = useFetch("/projects");

  if (loading) return <p className="p-6 text-slate-300">Loading projects...</p>;

  const projects = data?.projects || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl text-white font-semibold">Projects</h1>

      <div className="space-y-4">
        {projects.length === 0 && (
          <p classnation="text-slate-400">No projects found.</p>
        )}

        {projects.map((p) => (
          <Link key={p._id} to={`/projects/${p._id}`}>
            <Card className="bg-slate-900 border border-slate-700 p-4 rounded-xl hover:bg-slate-800 transition cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {p.title}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Client: {p.client?.name || "Unknown"}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Created: {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-md text-xs ${
                    p.completed
                      ? "bg-green-700/30 text-green-300"
                      : "bg-yellow-600/20 text-yellow-300"
                  }`}
                >
                  {p.completed ? "Completed" : "Active"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
