import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* 1. Your Sidebar stays fixed on the left */}
      <AdminSidebar />

      {/* 2. The sub-pages (Prompt, API Key, etc.) show up here */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
