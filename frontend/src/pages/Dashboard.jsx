import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import useFetch from "../hooks/useFetch";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { AlertTriangle, Star, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: leads } = useFetch("/leads");
  const [syncing, setSyncing] = useState(false);

  const list = leads?.leads || [];
  const urgent = list.filter((l) => l.urgency === "high").length;

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
    <div className="p-4 md:p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Button onClick={syncEmails} disabled={syncing} className="w-full md:w-auto">
          {syncing ? "Syncing..." : "Sync Gmail"}
        </Button>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

        {/* Priority Leads */}
        <Card className="bg-slate-900/70 border-white/10 rounded-xl shadow-lg p-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-base md:text-lg">Priority Leads</CardTitle>
            <Star size={22} className="text-yellow-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl md:text-4xl font-bold text-yellow-400">
              {priority}
            </p>
            <Link
              to="/leads?priority=true"
              className="text-sm md:text-base text-blue-300 underline block mt-2"
            >
              View Priority →
            </Link>
          </CardContent>
        </Card>

        {/* High Urgency */}
        <Card className="bg-slate-900/70 border-white/10 rounded-xl shadow-lg p-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-base md:text-lg">High Urgency</CardTitle>
            <AlertTriangle size={22} className="text-red-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl md:text-4xl font-bold text-red-500">
              {urgent}
            </p>
            <Link
              to="/leads?high=true"
              className="text-sm md:text-base text-blue-300 underline block mt-2"
            >
              View High Urgency →
            </Link>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-slate-900/70 border-white/10 rounded-xl shadow-lg p-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-base md:text-lg">Completed</CardTitle>
            <CheckCircle size={22} className="text-green-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl md:text-4xl font-bold text-green-400">
              {completed}
            </p>
            <Link
              to="/leads?completed=true"
              className="text-sm md:text-base text-blue-300 underline block mt-2"
            >
              View Completed →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
