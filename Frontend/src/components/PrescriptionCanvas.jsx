import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Eraser,
  Pen,
  Trash2,
  Plus,
  FileDown,
  Sparkles,
  Type,
  X,
  ChevronDown,
  Stethoscope,
  User,
  MapPin,
  Hash,
  Calendar,
  Loader2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
// ✅ Step 1: Import the dynamic API URL
import { API_BASE_URL } from "../config";

const PrescriptionCanvas = () => {
  const navigate = useNavigate();

  // --- UI & CANVAS STATES ---
  const [pages, setPages] = useState([{ id: Date.now(), strokes: [] }]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [patientName, setPatientName] = useState("");
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- PATIENT DATA STATES ---
  const [allPatients, setAllPatients] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const canvasRefs = useRef([]);
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 800;
  const HEADER_HEIGHT = 140;

  // --- 🏥 UPDATED: DYNAMIC INITIAL FETCH ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // ✅ Step 2: Use API_BASE_URL instead of localhost:8000
        const settingsRes = await fetch(
          `${API_BASE_URL}/api/admin/settings/hospital-info`,
        );
        const settingsData = await settingsRes.json();

        const activeUrl =
          settingsData.hospital?.patient_source_url ||
          "https://d4c5cce4-b1af-4f81-852b-edd97f9bf7e7.mock.pstmn.io/patients";

        const response = await fetch(activeUrl);
        const data = await response.json();

        if (Array.isArray(data)) {
          setAllPatients(data);
          const savedIndex = localStorage.getItem("lastPatientIndex");
          const nextIndex = savedIndex
            ? (parseInt(savedIndex) + 1) % data.length
            : 0;
          setCurrentIndex(nextIndex);
          setPatientData(data[nextIndex]);
        }
      } catch (err) {
        console.error("Ranchi Node Connection Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- SEARCH BY PID ---
  const handleSearch = (e) => {
    const query = e.target.value.toUpperCase();
    setSearchQuery(query);
    const foundIndex = allPatients.findIndex(
      (p) => p.pid.toUpperCase() === query,
    );
    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
      setPatientData(allPatients[foundIndex]);
      localStorage.setItem("lastPatientIndex", foundIndex - 1);
      setPages([{ id: Date.now(), strokes: [] }]);
      setPatientName("");
      setTimeout(() => setSearchQuery(""), 2000);
    }
  };

  // --- AUTOMATED FLOW ---
  const handleAutomatedFlow = async () => {
    if (!patientData) return;
    setIsProcessingAI(true);

    try {
      const allImages = canvasRefs.current
        .filter(Boolean)
        .map((canvas, index) => {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = CANVAS_WIDTH;
          tempCanvas.height = CANVAS_HEIGHT;
          const ctx = tempCanvas.getContext("2d");

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(0, HEADER_HEIGHT);
          ctx.lineTo(CANVAS_WIDTH, HEADER_HEIGHT);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(CANVAS_WIDTH / 2, 0);
          ctx.lineTo(CANVAS_WIDTH / 2, HEADER_HEIGHT);
          ctx.stroke();

          ctx.fillStyle = "#000000";
          ctx.font = "bold 20px Arial";
          ctx.fillText("RANCHI CITY", 20, 40);
          ctx.fillText("HOSPITAL", 20, 65);

          ctx.font = "bold 12px Arial";
          ctx.fillText(`PATIENT: ${patientData.name}`, 20, 110);
          ctx.font = "10px Arial";
          ctx.fillText(`PAGE NO. ${index + 1} OF ${pages.length}`, 20, 130);

          ctx.font = "bold 11px Arial";
          ctx.fillText("BP :", 320, 45);
          ctx.fillText("BLOOD GROUP :", 320, 85);
          ctx.fillText("HB :", 320, 125);

          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 0.5;
          const lineStart = 350;
          [45, 85, 125].forEach((yPos) => {
            ctx.beginPath();
            ctx.moveTo(lineStart + (yPos === 85 ? 65 : 0), yPos + 2);
            ctx.lineTo(CANVAS_WIDTH - 20, yPos + 2);
            ctx.stroke();
          });

          ctx.drawImage(canvas, 0, 0);

          return tempCanvas.toDataURL("image/jpeg", 0.8);
        });

      localStorage.setItem("lastPatientIndex", currentIndex);
      navigate("/transcribe", {
        state: {
          images: allImages,
          patientData: patientData,
          autoProcess: true,
        },
      });
    } catch (error) {
      console.error("Automation Failure:", error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // --- CANVAS ENGINE ---
  const processPoint = (e, isNewStroke, pageIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (y < 0 || y > CANVAS_HEIGHT) return;

    setPages((prev) => {
      const newPages = [...prev];
      const targetPage = newPages[pageIndex];
      if (isNewStroke) {
        targetPage.strokes.push({
          type: isEraser ? "eraser" : "pen",
          points: [{ x, y }],
        });
      } else if (targetPage.strokes.length > 0) {
        targetPage.strokes[targetPage.strokes.length - 1].points.push({ x, y });
      }
      return newPages;
    });
  };

  const renderAll = useCallback(() => {
    pages.forEach((page, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "#eff6ff";
      ctx.lineWidth = 1;
      for (let y = HEADER_HEIGHT + 40; y < CANVAS_HEIGHT; y += 35) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      page.strokes.forEach((stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.type === "eraser" ? "#ffffff" : "#1e293b";
        ctx.lineWidth = stroke.type === "eraser" ? 25 : 2.5;
        stroke.points.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
        );
        ctx.stroke();
      });
    });
  }, [pages]);

  useEffect(() => {
    renderAll();
  }, [renderAll]);

  const addPage = () => {
    setPages((prev) => {
      const lastPage = prev[prev.length - 1];
      const vitalStrokes = lastPage.strokes.filter((stroke) =>
        stroke.points.some(
          (p) => p.y <= HEADER_HEIGHT && p.x >= CANVAS_WIDTH / 2,
        ),
      );

      const newPage = {
        id: Date.now(),
        strokes: JSON.parse(JSON.stringify(vitalStrokes)),
      };

      return [...prev, newPage];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 overflow-x-hidden">
      {/* ── HEADER TOOLBAR ── */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm px-6 py-3 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <Stethoscope size={16} className="text-white" />
          </div>
          <p className="text-xs font-black text-blue-600 uppercase">
            Ranchi Hospital
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search PID..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold w-40 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsEraser(false)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${!isEraser ? "bg-white shadow text-blue-600" : "text-slate-400"}`}
            >
              <Pen size={14} />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isEraser ? "bg-white shadow text-rose-500" : "text-slate-400"}`}
            >
              <Eraser size={14} />
            </button>
          </div>
          <button
            onClick={addPage}
            className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={14} /> Add Page
          </button>
        </div>

        <button
          onClick={handleAutomatedFlow}
          disabled={isProcessingAI}
          className="bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2"
        >
          {isProcessingAI ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Sparkles size={14} />
          )}{" "}
          AI Flow
        </button>
      </header>

      {/* ── PATIENT BANNER ── */}
      <div className="pt-28 px-4 w-full flex justify-center">
        {patientData ? (
          <motion.div
            key={patientData.pid}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[600px] bg-white border border-slate-200 shadow-lg rounded-[2rem] p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">
                  PID: {patientData.pid}
                </p>
                <h2 className="text-xl font-black text-slate-800 uppercase leading-none">
                  {patientData.name}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Age/Gender
              </p>
              <p className="text-sm font-black text-slate-700">
                {patientData.age}y / {patientData.gender}
              </p>
            </div>
          </motion.div>
        ) : (
          <Loader2 className="animate-spin text-blue-600 mt-10" />
        )}
      </div>

      {/* ── MAIN A4 CANVAS ── */}
      <main className="pt-8 pb-32 flex flex-col items-center px-4 gap-12">
        {pages.map((page, index) => (
          <div key={page.id} className="flex flex-col items-center w-full">
            <div className="flex items-center justify-between w-full mb-3 px-1 max-w-[600px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                A4 Digital Prescription Pad
              </span>
              <button
                onClick={() =>
                  setPages((p) => {
                    const n = [...p];
                    n[index].strokes = [];
                    return n;
                  })
                }
                className="text-[10px] font-black text-rose-400 uppercase hover:underline"
              >
                Clear Page {index + 1}
              </button>
            </div>

            <div
              className="relative bg-white shadow-2xl border-2 border-slate-200 overflow-hidden"
              style={{
                width: "min(600px, 95vw)",
                aspectRatio: "600 / 800",
                touchAction: "none",
              }}
              onPointerDown={(e) => {
                setIsDrawing(true);
                processPoint(e, true, index);
              }}
              onPointerMove={(e) => {
                if (isDrawing) processPoint(e, false, index);
              }}
              onPointerUp={() => setIsDrawing(false)}
            >
              <div
                className="absolute top-0 left-0 w-full flex border-b-4 border-slate-900 z-20 pointer-events-none"
                style={{ height: HEADER_HEIGHT }}
              >
                <div className="w-1/2 p-6 border-r-2 border-slate-100 flex flex-col justify-between bg-white pointer-events-auto">
                  <div>
                    <h1 className="font-black text-xl uppercase text-slate-900 leading-tight tracking-tighter">
                      Ranchi City
                      <br />
                      Hospital
                    </h1>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase">
                      Patient:{" "}
                      <span className="text-slate-500">
                        {patientData?.name}
                      </span>
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Page No. {index + 1} of {pages.length}
                    </p>
                  </div>
                </div>

                <div className="w-1/2 bg-slate-50/50 p-6 flex flex-col justify-center gap-6 pointer-events-none">
                  <div className="flex items-end gap-2 w-full">
                    <span className="text-[11px] font-black text-slate-800 uppercase whitespace-nowrap">
                      BP :
                    </span>
                    <div className="flex-1 border-b border-slate-400 h-px mb-1"></div>
                  </div>

                  <div className="flex items-end gap-2 w-full">
                    <span className="text-[11px] font-black text-slate-800 uppercase whitespace-nowrap">
                      Blood Group :
                    </span>
                    <div className="flex-1 border-b border-slate-400 h-px mb-1"></div>
                  </div>

                  <div className="flex items-end gap-2 w-full">
                    <span className="text-[11px] font-black text-slate-800 uppercase whitespace-nowrap">
                      HB :
                    </span>
                    <div className="flex-1 border-b border-slate-400 h-px mb-1"></div>
                  </div>
                </div>
              </div>

              <canvas
                ref={(el) => (canvasRefs.current[index] = el)}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="relative z-10 block w-full h-full bg-transparent"
                style={{ cursor: isEraser ? "cell" : "crosshair" }}
              />
            </div>
          </div>
        ))}
      </main>

      {/* ── FLOATING SUBMIT BUTTON ── */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAutomatedFlow}
          disabled={isProcessingAI}
          className="bg-green-600 text-white shadow-2xl px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 border-4 border-white disabled:bg-slate-400"
        >
          {isProcessingAI ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {isProcessingAI ? "Processing..." : "Save, AI & Next"}
        </motion.button>
      </div>
    </div>
  );
};

export default PrescriptionCanvas;
