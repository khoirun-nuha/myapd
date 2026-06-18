import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Menggunakan AuthContext
import { getToken, clearAuthData } from '../services/authService';
import api from '../services/api';
import { alertService } from '../services/notifService';
import {
  LayoutDashboard, Users, ShieldAlert, FileText, LogOut, Home, X, History, UserCircle
} from 'lucide-react';

const MENU_BY_ROLE = {
  admin: [
    { name: 'Dashboard', path: '/k3', icon: <LayoutDashboard size={18} /> },
    { name: 'Data User', path: '/k3/users', icon: <Users size={18} /> },
    { name: 'Stok APD', path: '/k3/apd', icon: <ShieldAlert size={18} /> },
    { name: 'Laporan', path: '/k3/laporan', icon: <FileText size={18} /> },
    { name: 'Riwayat Pelaporan', path: '/k3/riwayat', icon: <History size={18} /> },
    { name: 'Profil', path: '/k3/profil', icon: <UserCircle size={18} /> },
  ],
  mandor: [
    { name: 'Dashboard', path: '/mandor', icon: <Home size={18} /> },
    { name: 'Data User', path: '/mandor/users', icon: <Users size={18} /> },
    { name: 'Stok APD', path: '/mandor/apd', icon: <ShieldAlert size={18} /> },
    { name: 'Riwayat Pelaporan', path: '/mandor/riwayat', icon: <History size={18} /> },
    { name: 'Profil', path: '/mandor/profil', icon: <UserCircle size={18} /> },
  ],
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth(); // <--- Mengambil role user yang aman dan up-to-date dari Context
  
  const role = user?.role;
  const menus = MENU_BY_ROLE[role] || [{ name: 'Dashboard', path: '/', icon: <Home size={18} /> }];
  
  const handleLogout = async () => {
  const result = await alertService.confirm(
    'Konfirmasi Logout',
    'Apakah Anda yakin ingin keluar dari aplikasi?',
    'Ya, Logout'
  );

  if (result.isConfirmed) {
    try {
      // Selalu panggil backend logout
      await api.post('/api/logout');

      alertService.success(
        "Berhasil!",
        "Logout berhasil. Sampai jumpa lagi!"
      );
    } catch (error) {
      console.error("Logout error:", error);

      alertService.error(
        "Gagal!",
        "Gagal terhubung ke server saat logout."
      );
    } finally {
      clearAuthData();
      navigate('/login');
    }
  }
};

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-400 flex flex-col h-screen border-r border-slate-800/60 shadow-xl
      transform transition-transform duration-300 ease-out
      md:relative md:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      
      {/* Brand/Logo Section */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
            <span className="text-white font-black text-base tracking-wider">M</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-white">My<span className="text-blue-500">Apd</span></span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">K3 Management</span>
          </div>
        </div>

        {/* Close Button (Mobile Only) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu Navigasi</div>
        
        {menus.map((menu) => (
          <React.Fragment key={menu.path}>
            {/* Garis Pemisah (hr) sebelum Dashboard dan Profil */}
            {(menu.name === 'Dashboard' || menu.name === 'Profil') && (
              <div className="my-3 border-t border-slate-800/80 mx-2"></div>
            )}
            
            <NavLink
              to={menu.path}
              end
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Bar indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-md"></div>
                  )}
                  
                  <span className={`transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {menu.icon}
                  </span>
                  <span>{menu.name}</span>
                </>
              )}
            </NavLink>
          </React.Fragment>
        ))}
      </nav>

      {/* Footer / Logout Button */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
        <button 
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut size={18} className="text-slate-600 group-hover:text-rose-400" />
          <span>Keluar Akun</span>
        </button>
      </div>

    </aside>
  );
}