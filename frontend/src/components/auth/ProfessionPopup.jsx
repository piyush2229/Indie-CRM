import { useState } from "react";
import api from "../../lib/axios";

export default function ProfessionPopup({ user, refresh }) {
  const [profession, setProfession] = useState("");

  if (!user.mustSelectProfession) return null;

  const submit = async () => {
    if (!profession) return alert("Select a profession");

    await api.patch("/users/profession", { profession });
    refresh(); // re-fetch user data
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-96 border border-slate-700">
        <h2 className="text-xl text-white mb-4">Select your profession</h2>

        <select
          className="w-full bg-slate-800 p-2 rounded text-white"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="freelancer">Freelancer</option>
          <option value="agency">Agency</option>
          <option value="real_estate">Real Estate</option>
          <option value="coach">Coach</option>
        </select>

        <button
          onClick={submit}
          className="w-full mt-4 bg-blue-600 py-2 rounded text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
