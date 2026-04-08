import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Save,
  CheckCircle,
  Loader2,
  Copy,
  Wand2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
// ✅ Import the dynamic API URL
import { API_BASE_URL } from "../../config";

const PromptEditor = () => {
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, saving, success, error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // ✅ Uses the dynamic API_BASE_URL
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/settings/hospital-info`,
        );
        if (res.data.success && res.data.hospital.custom_prompt) {
          setPrompt(res.data.hospital.custom_prompt);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, []);

  const handleSave = async () => {
    if (status === "saving") return;

    try {
      setStatus("saving");
      // ✅ Uses the dynamic API_BASE_URL
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/settings/update-prompt`,
        {
          prompt,
        },
      );

      if (res.data.success) {
        setStatus("success");
        setIsEditing(false);
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Save Error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="italic tracking-widest uppercase text-[10px] animate-pulse">
          Accessing Ranchi Node...
        </span>
      </div>
    );

  return (
    <div className="p-10 max-w-6xl space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            AI Master Prompt
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure the core intelligence for prescription extraction.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-bold text-[11px] uppercase tracking-wider"
          >
            <Unlock size={14} className="text-blue-500" /> Unlock Editor
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setStatus("idle");
              }}
              className="text-slate-500 hover:text-white px-4 py-3 font-bold text-[11px] uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider shadow-lg ${
                status === "saving"
                  ? "bg-blue-600/50 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95"
              }`}
            >
              {status === "saving" ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative group transition-all duration-500 ${isEditing ? "scale-[1.01]" : "scale-100"}`}
      >
        <div
          className={`bg-[#0d1117] border rounded-[32px] overflow-hidden transition-all ${
            isEditing
              ? "border-blue-500/50 shadow-2xl shadow-blue-500/10"
              : "border-white/10"
          }`}
        >
          <div className="bg-white/5 border-b border-white/10 p-4 px-8 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Wand2
                size={12}
                className={isEditing ? "text-blue-500" : "text-slate-500"}
              />
              {isEditing ? "Mode: Editing System Rules" : "Mode: Read Only"}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(prompt);
                alert("Copied to clipboard!");
              }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!isEditing}
            spellCheck={false}
            className={`w-full h-[550px] bg-transparent p-10 text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none transition-all ${
              !isEditing ? "opacity-40 cursor-not-allowed" : "opacity-100"
            }`}
            placeholder="No prompt found. Unlock to add instructions..."
          />
        </div>

        {!isEditing && (
          <div className="absolute inset-0 bg-transparent pointer-events-none rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-widest">
              <Lock size={12} className="text-blue-400" /> Click 'Unlock Editor'
              to modify
            </div>
          </div>
        )}
      </div>

      {status === "success" && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex gap-3 items-center text-teal-400 text-[11px] font-bold animate-in slide-in-from-top-2">
          <CheckCircle size={16} /> PostgreSQL Synced: AI rules are now live.
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-center text-red-400 text-[11px] font-bold animate-in slide-in-from-top-2">
          <AlertCircle size={16} /> Sync Failed: Could not connect to the Ranchi
          server.
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
