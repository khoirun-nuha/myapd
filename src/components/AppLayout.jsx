import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  // State untuk mengontrol sidebar di tampilan mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Overlay gelap & blur untuk Mobile ketika Sidebar Terbuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)} // Klik di luar sidebar untuk menutup
        />
      )}

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}