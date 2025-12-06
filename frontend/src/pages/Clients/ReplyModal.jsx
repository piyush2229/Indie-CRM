import { useState } from "react";
import Button from "../ui/button";

export default function ReplyModal({ open, onClose, drafts, onSelect }) {
  if (!open) return null;

  const [active, setActive] = useState("standard");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-xl shadow-xl">
        
        <h2 className="text-xl text-white font-semibold mb-4">AI Reply Suggestions</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["short", "standard", "expanded"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3 py-1 rounded-md text-sm
                ${active === tab ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Draft Preview */}
        <div className="bg-slate-800 p-4 rounded-lg h-60 overflow-y-auto shadow-inner text-slate-200 whitespace-pre-wrap">
          {drafts[active]}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>

          <div className="flex gap-2">
            <Button
              onClick={() => onSelect(drafts[active], "insert")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Insert into Editor
            </Button>

            <Button
              onClick={() => onSelect(drafts[active], "save")}
              className="bg-green-600 hover:bg-green-700"
            >
              Save to History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
