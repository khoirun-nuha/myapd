import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayload } from '../../services/authService';
// Sesuaikan import service ini dengan struktur folder kamu
import { reportService } from '../../services/reportService'; 
import { apdService } from '../../services/apdService';

export default function MandorDashboard() {
  const navigate = useNavigate();
  const user = getPayload();
  
  // State untuk menyimpan data statistik & laporan
  const [stats, setStats] = useState({
    laporanBaru: 0,
    totalApd: 0,
    laporanSelesai: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Catatan: Ini adalah contoh pemanggilan API. 
      // Sesuaikan fungsi pemanggilannya dengan service yang kamu miliki.
      const [reportsRes, apdRes] = await Promise.all([
        reportService.getAllReports ? reportService.getAllReports() : Promise.resolve({ data: [] }),
        apdService.getApds ? apdService.getApds() : Promise.resolve({ data: [] })
      ]);

      const reports = reportsRes.data || reportsRes || [];
      const apds = apdRes.data || apdRes || [];

      // Hitung statistik sederhana
      const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'menunggu');
      const completedReports = reports.filter(r => r.status === 'selesai' || r.status === 'disetujui');

      setStats({
        laporanBaru: pendingReports.length,
        totalApd: apds.length,
        laporanSelesai: completedReports.length,
      });

      // Ambil 5 laporan terbaru
      setRecentReports(reports.slice(0, 5));
    } catch (error) {
      console.error("Gagal memuat data dashboard mandor", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Halo, {user?.name || 'Mandor'}! 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Pantau kondisi APD pekerja dan laporan terbaru hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/mandor/riwayat')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Lihat Semua Laporan
          </button>
        </div>
      </div>

      {/* ---------------- STATS CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Laporan Baru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-rose-50 text-rose-600 rounded-md">Butuh Tindakan</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? '...' : stats.laporanBaru}</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Laporan APD Rusak</p>
          </div>
        </div>

        {/* Card 2: Total APD Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? '...' : stats.totalApd}</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Total Jenis APD</p>
          </div>
        </div>

        {/* Card 3: Laporan Selesai */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">Bulan Ini</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? '...' : stats.laporanSelesai}</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Laporan Disetujui</p>
          </div>
        </div>
      </div>

      {/* ---------------- KONTEN BAWAH (TABEL & QUICK ACTIONS) ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Tabel Laporan Terbaru (Lebar 2 Kolom di Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-black text-slate-800">Laporan APD Terbaru</h2>
            <button onClick={() => navigate('/mandor/riwayat')} className="text-sm font-bold text-blue-600 hover:text-blue-700">Lihat Detail &rarr;</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-bold">Karyawan</th>
                  <th className="p-4 font-bold">APD Rusak</th>
                  <th className="p-4 font-bold">Lokasi</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Memuat data...</td></tr>
                ) : recentReports.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Belum ada laporan terbaru.</td></tr>
                ) : (
                  recentReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{report.user_name || 'Karyawan'}</td>
                      <td className="p-4 text-slate-600">{report.apd_name || 'APD'}</td>
                      <td className="p-4 text-slate-600">{report.tempat || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                          report.status === 'pending' || report.status === 'menunggu' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {report.status || 'Menunggu'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Quick Actions & Bantuan */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-950 rounded-2xl p-6 shadow-lg relative overflow-hidden">
             {/* Pattern Grid Tipis */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <h2 className="text-base font-black text-white mb-4 relative z-10">Aksi Cepat</h2>
            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => navigate('/mandor/users')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Kelola Karyawan</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Daftar anggota proyek</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>

              <button 
                onClick={() => navigate('/mandor/apd')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Master APD</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Cek ketersediaan APD</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Tugas Mandor
            </h3>
            <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
              Pastikan seluruh laporan APD rusak segera divalidasi. Laporan yang disetujui akan diteruskan ke Admin K3 untuk proses penggantian barang.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}