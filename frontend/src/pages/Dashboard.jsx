import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import useFetch from "../hooks/useFetch";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { Mail, TrendingUp, AlertTriangle, Star, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: leads } = useFetch("/leads");
  const [syncing, setSyncing] = useState(false);

  const list = leads?.leads || [];

  const urgent = list.filter((l) => l.urgency === "high").length;

  // ⭐ Priority = medium OR high OR score >= 60
  const priority = list.filter(
    (l) =>
      l.urgency === "high" ||
      l.urgency === "medium" ||
      l.lead_score >= 60
  ).length;

  const completed = list.filter((l) => l.completed).length;

  const syncEmails = async () => {
    setSyncing(true);
    try {
      const res = await api.post("/gmail/sync");
      toast.success(`Synced ${res.data.queued} emails`);
    } catch {
      toast.error("Sync failed");
    }
    setSyncing(false);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={syncEmails} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync Gmail"}
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">

        {/* Priority Leads */}
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Priority Leads</CardTitle>
            <Star size={22} className="text-yellow-400" />
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-yellow-400">{priority}</p>

            <Link
              to="/leads?priority=true"
              className="text-sm text-blue-300 underline block mt-2"
            >
              View Priority →
            </Link>
          </CardContent>
        </Card>

        {/* High Urgency */}
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>High Urgency</CardTitle>
            <AlertTriangle size={22} className="text-red-400" />
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-red-500">{urgent}</p>

            <Link
              to="/leads?high=true"
              className="text-sm text-blue-300 underline block mt-2"
            >
              View High Urgency →
            </Link>
          </CardContent>
        </Card>

        {/* Completed Leads */}
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Completed</CardTitle>
            <CheckCircle size={22} className="text-green-400" />
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-green-400">{completed}</p>

            <Link
              to="/leads?completed=true"
              className="text-sm text-blue-300 underline block mt-2"
            >
              View Completed →
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
