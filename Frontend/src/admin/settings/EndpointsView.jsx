import React, { useState, useEffect } from "react";
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  Database,
  Zap,
  Edit3,
  Save,
  Loader2,
  CheckCircle,
  Server,
  Activity, // 🔥 Fixed: Added the missing Activity import
  X,
} from "lucide-react";
import axios from "axios";

// 🏥 CONFIGURATION
const PATIENT_CONFIG = {
  DEFAULT_SOURCE:
    "https://d4c5cce4-b1af-4f81-852b-edd97f9bf7e7.mock.pstmn.io/patients",
  FETCH_URL: "http://localhost:8000/api/admin/settings/hospital-info",
  UPDATE_URL: "http://localhost:8000/api/admin/settings/update-patient-source",
};

const EndpointsView = () => {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(PATIENT_CONFIG.FETCH_URL);
        if (res.data.success && res.data.hospital.patient_source_url) {
          setSourceUrl(res.data.hospital.patient_source_url);
        } else {
          setSourceUrl(PATIENT_CONFIG.DEFAULT_SOURCE);
        }
      } catch (err) {
        console.error("Ranchi Node Load failed:", err);
        setSourceUrl(PATIENT_CONFIG.DEFAULT_SOURCE);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    try {
      setStatus("saving");
      const res = await axios.post(PATIENT_CONFIG.UPDATE_URL, {
        url: sourceUrl,
      });

      if (res.data.success) {
        setStatus("success");
        setIsEditing(false);
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Update failed:", err);
      setStatus("idle");
      alert("Database Sync Failed. Ensure your Node.js server is running.");
    }
  };

  return (
    <div className="p-10 max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-white">
      {/* ── HEADER SECTION ── */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 shadow-lg shadow-blue-500/5">
              <Database size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Data Sources
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium italic">
            Configure where Ranchi City Hospital pulls patient records from.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <Edit3 size={14} /> Edit Data Node
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-white px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={status === "saving"}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {status === "saving" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Confirm Update
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONNECTION CARD ── */}
      <div className="relative group">
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[32px] blur opacity-10 transition duration-1000 ${isEditing ? "opacity-30" : "group-hover:opacity-20"}`}
        ></div>

        <div
          className={`relative bg-[#0d1117] border rounded-[32px] p-10 shadow-2xl overflow-hidden transition-all duration-500 ${isEditing ? "border-blue-500" : "border-white/10"}`}
        >
          <Server className="absolute -right-8 -bottom-8 text-white/[0.02] w-64 h-64 -rotate-12 pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <div className="flex-shrink-0">
              <div
                className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${isEditing ? "bg-blue-600 text-white" : "bg-white/5 text-blue-500"}`}
              >
                <Globe size={40} className={isEditing ? "animate-pulse" : ""} />
              </div>
            </div>

            <div className="flex-grow space-y-5 w-full">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                  Patient API Endpoint
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                  External Data Node • SSL Encrypted
                </p>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    autoFocus
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-black/60 border border-blue-500/50 rounded-2xl p-5 text-blue-400 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="Enter new Patient API URL..."
                  />
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                  <code className="text-blue-400 text-xs font-mono break-all leading-relaxed">
                    {sourceUrl || "Connecting to node..."}
                  </code>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Activity size={12} className="text-blue-500" /> 15ms Latency
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={12} className="text-teal-500" /> Real-time Sync
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Active Mapping:
              </p>
              <p className="text-white text-xs font-medium italic">
                Ranchi City Main Branch Node
              </p>
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase animate-bounce pr-4">
                <CheckCircle size={14} /> Database Synced
              </div>
            )}

            <button
              onClick={() => window.open(sourceUrl, "_blank")}
              className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl border border-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-xl"
            >
              Test Endpoint <ExternalLink size={14} className="text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-8 py-5 bg-blue-500/5 border border-blue-500/10 rounded-[2rem]">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <ShieldCheck size={18} />
        </div>
        <p className="text-slate-500 text-[11px] font-medium leading-relaxed uppercase tracking-wider">
          Restricted access. Ranchi City Hospital data node changes are
          encrypted.
        </p>
      </div>
    </div>
  );
};

export default EndpointsView;
