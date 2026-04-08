import React, { useState } from "react";
import { Key, Save, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const ApiKeySettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle, saving, success, error

  const handleSave = async () => {
    if (!apiKey.startsWith("AIza")) {
      alert("Please enter a valid Gemini API Key (starts with AIza)");
      return;
    }

    try {
      setStatus("saving");
      // 🔥 Points to your running Port 8000
      const response = await axios.post("http://localhost:8000/api/admin/settings/api-key", { 
        apiKey 
      });

      if (response.data.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
    }
  };

  return (
    <div className="p-10 max-w-2xl space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Gemini API Key</h1>
        <p className="text-slate-500 text-sm mt-1">Configuring AI credentials for Ranchi City Hospital node.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
            Google AI Studio Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your AIzaSy... key here"
            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-white font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
            status === "success" ? "bg-teal-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {status === "saving" ? "WRITING TO POSTGRES..." : status === "success" ? <>SAVED TO DATABASE <CheckCircle size={18}/></> : <>SAVE CONFIGURATION <Save size={18} /></>}
        </button>
      </div>

      {status === "error" && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-center text-red-400 text-xs">
          <AlertCircle size={16} /> Error connecting to the database. Is the server running?
        </div>
      )}
    </div>
  );
};

export default ApiKeySettings;