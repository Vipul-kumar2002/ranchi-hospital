import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";

const AITranscriptionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Reading prescription...");
  const [error, setError] = useState(null);

  const capturedImages = location.state?.images || [];
  const patientData = location.state?.patientData || null;

  useEffect(() => {
    if (capturedImages.length === 0) {
      navigate("/");
      return;
    }

    let progressInterval;

    const startTranscription = async () => {
      setProgress(5);
      setStatusMsg("Sending to AI engine...");

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return 88;
          return prev + (prev < 50 ? 4 : 1);
        });
      }, 280);

      try {
        const response = await fetch(
          "http://localhost:8000/api/ai/transcribe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: capturedImages }),
          },
        );

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        clearInterval(progressInterval);
        setProgress(95);
        setStatusMsg("Parsing AI JSON...");

        // ── STEP 1: Strict JSON Parsing ──
        let aiObj = {};
        try {
          let rawText = data.transcription;
          // Strip markdown if AI included it
          if (typeof rawText === "string") {
            const match = rawText.match(/\{[\s\S]*\}/);
            aiObj = JSON.parse(match ? match[0] : rawText);
          } else {
            aiObj = rawText;
          }
        } catch (e) {
          console.error("JSON parse failed:", e);
          throw new Error("AI returned invalid format. Please try again.");
        }

        // ── STEP 2: Map to Clean Structure (No personal defaults) ──
        const safe = (val, fallback = "Not Mentioned") => {
          return val &&
            val !== "" &&
            val !== "null" &&
            val !== "[Not Mentioned]"
            ? val
            : fallback;
        };

        const jsonData = {
          patientId: safe(patientData?.pid || aiObj?.patientId),
          clinicalData: {
            bloodPressure: safe(aiObj?.clinicalData?.bloodPressure),
            bloodGroup: safe(aiObj?.clinicalData?.bloodGroup),
            hemoglobin: safe(aiObj?.clinicalData?.hemoglobin),
            height: safe(patientData?.height),
            weight: safe(patientData?.weight),
            tests: Array.isArray(aiObj?.clinicalData?.tests)
              ? aiObj.clinicalData.tests
              : ["Not Mentioned"],
            instructions: safe(aiObj?.clinicalData?.instructions),
            generalAdvice: safe(aiObj?.clinicalData?.generalAdvice),
            revisit: safe(aiObj?.clinicalData?.revisit),
          },
          medicine: (aiObj?.medicine || []).map((med) => ({
            medicineName: safe(med?.medicineName),
            dosage: safe(med?.dosage),
            instruction: safe(med?.instruction),
          })),
        };

        // ── STEP 3: Generate Downloads ──
        setStatusMsg("Saving records...");
        downloadJson(jsonData, patientData);
        await buildCombinedPDF(capturedImages, patientData, jsonData);

        setProgress(100);
        setStatusMsg("Done! Record saved.");
        setTimeout(() => navigate("/"), 3000);
      } catch (err) {
        clearInterval(progressInterval);
        setError(err.message);
        setProgress(0);
      }
    };

    startTranscription();
    return () => clearInterval(progressInterval);
  }, []);

  // ── JSON DOWNLOADER ──
  const downloadJson = (jsonData, patientData) => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Final_Data_${patientData?.name || "Patient"}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF BUILDER (Images + AI Summary Page) ──
  const buildCombinedPDF = async (images, patientData, jsonData) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const W = 210;
    const H = 297;

    images.forEach((img, i) => {
      if (i > 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, W, H);
    });

    pdf.addPage();
    pdf.setFillColor(8, 18, 35); // Dark Theme for AI page
    pdf.rect(0, 0, W, H, "F");

    // Header
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, W, 22, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("RANCHI CITY HOSPITAL", 14, 14);

    // AI Badge
    pdf.setFillColor(16, 185, 129);
    pdf.roundedRect(155, 6, 42, 10, 5, 5, "F");
    pdf.setFontSize(8);
    pdf.text("AI TRANSCRIPTION", 158, 12.5);

    // Patient Info Block
    pdf.setFillColor(15, 30, 60);
    pdf.roundedRect(10, 28, W - 20, 22, 4, 4, "F");
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(7);
    pdf.text("PATIENT", 16, 36);
    pdf.text("PATIENT ID", 70, 36);
    pdf.text("DATE", 140, 36);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(patientData?.name || "—", 16, 44);
    pdf.text(jsonData.patientId || "—", 70, 44);
    pdf.text(new Date().toLocaleDateString("en-IN"), 140, 44);

    // Section Helper
    const sectionTitle = (label, y) => {
      pdf.setFillColor(37, 99, 235);
      pdf.rect(10, y, 3, 8, "F");
      pdf.setTextColor(147, 197, 253);
      pdf.setFontSize(8);
      pdf.text(label.toUpperCase(), 16, y + 6);
    };

    // Vitals
    sectionTitle("Clinical Vitals", 58);
    const cd = jsonData.clinicalData;
    const drawVital = (label, value, x, y, width) => {
      pdf.setFillColor(15, 30, 60);
      pdf.roundedRect(x, y, width, 12, 2, 2, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(6.5);
      pdf.text(label, x + 4, y + 5);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(String(value), x + 4, y + 11);
    };

    const colW = (W - 24) / 3;
    drawVital("Blood Pressure", cd.bloodPressure, 10, 70, colW);
    drawVital("Blood Group", cd.bloodGroup, 10 + colW + 2, 70, colW);
    drawVital("Haemoglobin", cd.hemoglobin, 10 + (colW + 2) * 2, 70, colW);

    // Medicines
    sectionTitle("Prescribed Medicines", 95);
    if (jsonData.medicine.length === 0) {
      pdf.setTextColor(148, 163, 184);
      pdf.text("No medications detected", 14, 110);
    } else {
      jsonData.medicine.forEach((med, i) => {
        const y = 105 + i * 16;
        pdf.setFillColor(15, 30, 60);
        pdf.roundedRect(10, y, W - 20, 14, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(`${i + 1}. ${med.medicineName}`, 14, y + 9);
        pdf.setTextColor(147, 197, 253);
        pdf.text(med.dosage, 100, y + 9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(med.instruction, 140, y + 9);
      });
    }

    // Advice & Notes
    const notesY = 105 + Math.max(jsonData.medicine.length, 1) * 16 + 10;
    sectionTitle("Clinical Notes", notesY);
    const notes = [
      {
        l: "Tests",
        v: Array.isArray(cd.tests) ? cd.tests.join(", ") : cd.tests,
      },
      { l: "Instructions", v: cd.instructions },
      { l: "General Advice", v: cd.generalAdvice },
      { l: "Revisit", v: cd.revisit },
    ];

    notes.forEach((n, i) => {
      const ny = notesY + 12 + i * 12;
      pdf.setFillColor(15, 30, 60);
      pdf.roundedRect(10, ny, W - 20, 10, 2, 2, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.text(n.l + ":", 14, ny + 6);
      pdf.setTextColor(255, 255, 255);
      pdf.text(String(n.v), 45, ny + 6);
    });

    pdf.save(
      `Medical_Report_${patientData?.name || "Patient"}_${Date.now()}.pdf`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="text-red-400" size={52} />
            <h2 className="text-xl font-black text-white">FAILED</h2>
            <p className="text-slate-400 text-xs">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold"
            >
              Go Back
            </button>
          </div>
        ) : progress < 100 ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg
                className="absolute"
                width="112"
                height="112"
                viewBox="0 0 112 112"
              >
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 * (1 - progress / 100)}
                  transform="rotate(-90 56 56)"
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              <span className="text-2xl font-black text-white">
                {progress}%
              </span>
            </div>
            <h2 className="text-xl font-black text-white uppercase">
              {statusMsg}
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <CheckCircle className="text-emerald-400" size={56} />
            <h2 className="text-xl font-black text-white">COMPLETE!</h2>
            <p className="text-slate-400 text-sm">
              Records saved to your folder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITranscriptionView;
