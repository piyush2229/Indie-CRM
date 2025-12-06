// frontend/src/pages/Auth/ChooseProfession.jsx
import { useState } from "react";
import api from "../../lib/axios";
import { getToken } from "../../lib/auth";   // ✔ FIXED IMPORT
import { useAuth } from "../../context/AuthContext";

export default function ChooseProfession() {
  const { login } = useAuth();
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);

  const options = [
    { id: "freelancer", label: "Freelancer" },
    { id: "agency", label: "Agency" },
    { id: "real_estate", label: "Real Estate Agent" },
    { id: "coach", label: "Coach / Trainer" },
  ];

  const saveProfession = async () => {
    if (!profession) return alert("Select a profession first!");

    setLoading(true);

    try {
      const res = await api.patch("/auth/profession", { profession });

      // update local context user
      login(getToken(), res.data.user);

      window.location.href = "/dashboard";
    } catch (err) {
      alert("Failed, try again");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Choose Your Profession</h1>
        <p className="text-slate-400 mb-6">This helps personalize your AI scoring.</p>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setProfession(opt.id)}
              className={`w-full py-3 rounded-lg border ${
                profession === opt.id
                  ? "bg-blue-600 border-blue-500"
                  : "bg-slate-700 border-slate-600 hover:bg-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={saveProfession}
          disabled={loading}
          className="w-full mt-6 py-3 bg-green-600 rounded-lg hover:bg-green-700"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
