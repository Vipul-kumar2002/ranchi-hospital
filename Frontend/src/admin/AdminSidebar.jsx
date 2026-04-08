import React, { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Lock,
  Key,
  MessageSquare,
  Share2,
  ChevronDown,
  Stethoscope,
  Menu, // Added for mobile
  X, // Added for mobile
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const AdminSidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Added for responsiveness
  const navigate = useNavigate();

  const settingsLinks = [
    {
      name: "Change Password",
      icon: <Lock size={16} />,
      path: "/admin/settings/password",
    },
    {
      name: "API Key",
      icon: <Key size={16} />,
      path: "/admin/settings/api-key",
    },
    {
      name: "Prompt",
      icon: <MessageSquare size={16} />,
      path: "/admin/settings/prompt",
    },
    {
      name: "End Points",
      icon: <Share2 size={16} />,
      path: "/admin/settings/endpoints",
    },
  ];

  return (
    <>
      {/* 📱 MOBILE HAMBURGER BUTTON (Visible only on small screens) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 🌑 MOBILE OVERLAY (Darkens background when sidebar is open on mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🏛️ MAIN SIDEBAR */}
      <aside
        className={`
        fixed lg:static top-0 left-0 z-[55]
        w-72 h-screen bg-[#020617] border-r border-white/5 flex flex-col text-slate-300
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div
          className="p-8 flex items-center gap-3 border-b border-white/5 cursor-pointer"
          onClick={() => {
            navigate("/");
            setIsMobileOpen(false);
          }}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm tracking-tighter uppercase leading-none">
              Ranchi City
            </h2>
            <p className="text-blue-400 text-[9px] font-bold tracking-widest uppercase mt-1">
              Hospital Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <div className="space-y-1">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold group"
            >
              <div className="flex items-center gap-3">
                <Settings
                  size={18}
                  className="group-hover:rotate-45 transition-transform"
                />{" "}
                Settings
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${isSettingsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSettingsOpen && (
              <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
                {settingsLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.icon} {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => {
              navigate("/");
              setIsMobileOpen(false);
            }}
            className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
