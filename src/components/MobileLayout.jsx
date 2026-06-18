import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased flex flex-col justify-between selection:bg-blue-200">
      
      {/* Konten Utama Aplikasi */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-6 pb-28 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation Bar - Tema Putih Bersih */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          
          <button 
            onClick={() => navigate('/karyawan/dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${isActive('/karyawan/dashboard') ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide">Beranda</span>
          </button>

          <button 
            onClick={() => navigate('/karyawan/riwayat')}
            className={`flex flex-col items-center gap-1 transition-all ${isActive('/karyawan/riwayat') ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide">Riwayat</span>
          </button>

          <button 
            onClick={() => navigate('/karyawan/profil')}
            className={`flex flex-col items-center gap-1 transition-all ${isActive('/karyawan/profil') ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-medium tracking-wide">Profil</span>
          </button>

        </div>
      </div>
    </div>
  );
}