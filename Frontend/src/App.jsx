import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import HomePage from "./components/Home";
import PrescriptionCanvas from "./components/PrescriptionCanvas";
import AITranscriptionView from "./components/AITranscriptionView";
import AdminLayout from "./admin/AdminLayout";

// Settings Components
import ApiKeySettings from "./admin/settings/ApiKey";
import PromptEditor from "./admin/settings/PromptEditor";

// ✅ FIXED: Pointing to the actual UI file where the code is
import EndpointsView from "./admin/settings/EndpointsView";

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prescribe" element={<PrescriptionCanvas />} />
          <Route path="/transcribe" element={<AITranscriptionView />} />

          {/* 🛠️ Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <h1 className="text-white text-3xl font-black uppercase">
                  Hospital Overview
                </h1>
              }
            />

            <Route
              path="settings/password"
              element={
                <h1 className="text-white text-xl uppercase">
                  Change Password
                </h1>
              }
            />

            {/* 🔑 API Key Config */}
            <Route path="settings/api-key" element={<ApiKeySettings />} />

            {/* 📝 AI System Prompt */}
            <Route path="settings/prompt" element={<PromptEditor />} />

            {/* 🌐 Server Endpoints (Patient Source) */}
            <Route path="settings/endpoints" element={<EndpointsView />} />
          </Route>

          {/* 🚫 404 */}
          <Route
            path="*"
            element={
              <div className="h-screen flex items-center justify-center text-white bg-[#02040a]">
                404 - Node Not Found
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
