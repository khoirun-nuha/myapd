import React from 'react';
import { useAuth } from '../context/AuthContext'; // <--- Menggunakan AuthContext untuk sinkronisasi otomatis
import { Menu, Bell } from 'lucide-react';

// Mapping label agar tidak muncul teks mentah dari database (seperti 'admin' atau 'mandor')
const ROLE_DISPLAY_LABELS = {
  admin: 'Administrator',
  mandor: 'Mandor',
  karyawan: 'Karyawan K3',
};

export default function Header({ setIsSidebarOpen }) {
  const { user } = useAuth(); // <--- Mengambil data user yang selalu ter-update dari Context
  const BASE_URL = import.meta.env.VITE_API_URL; // Sesuaikan jika port backend berbeda

  // Memformat username agar huruf pertamanya otomatis kapital (Contoh: 'admin' jadi 'Admin')
  const formattedUsername = user?.username 
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1) 
    : "User";

  // Memformat tampilan role berdasarkan mapping di atas
  const formattedRole = ROLE_DISPLAY_LABELS[user?.role] || user?.role || "Guest";

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm shadow-slate-100/50 transition-all">
      
      {/* Kiri: Tombol Menu Mobile & Title */}
      <div className="flex items-center gap-4">
        {/* Tombol Hamburger (Hanya tampil di Mobile) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl md:hidden transition-all duration-200"
        >
          <Menu size={24} />
        </button>

        {/* Page Title (Sembunyikan di HP layar sangat kecil agar tidak sempit) */}
        <div className="flex flex-col hidden sm:flex">
          <span className="text-base font-bold text-slate-800 tracking-tight">Report Dashboard</span>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Overview</span>
        </div>
      </div>

      {/* Kanan: User Section */}
      <div className="flex items-center gap-5">
        
        {/* Tombol Notifikasi */}
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Garis Pemisah Vertical */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          {/* Teks Nama & Badge Designation */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
              {formattedUsername}
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              {formattedRole}
            </p>
          </div>
          
          {/* Lingkaran Avatar */}
          <div className="relative cursor-pointer hover:ring-4 hover:ring-blue-50 transition-all rounded-full">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30 uppercase overflow-hidden">
              {/* LOGIKA DETEKSI FOTO PROFIL */}
              {user?.foto_profil ? (
                <img 
                  src={`${BASE_URL}${user.foto_profil}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                user?.username?.charAt(0) || "U"
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

      </div>
    </header>
  );
}