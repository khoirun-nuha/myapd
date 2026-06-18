import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayload } from '../../services/authService';
import { apdService } from '../../services/apdService'; // Sesuaikan path-nya
import { reportService } from '../../services/reportService'; // Sesuaikan path-nya
import { userService } from '../../services/usersService'; // Sesuaikan path-nya
import { 
  AlertCircle, 
  FileCheck, 
  Package, 
  Clock, 
  ShieldAlert, 
  Users, 
  ArrowRight,
  Activity
} from 'lucide-react';

export default function K3Dashboard() {
  const user = getPayload();
  const navigate = useNavigate();

  // State untuk menyimpan data dinamis
  const [dashboardData, setDashboardData] = useState({
    pendingReports: 0,
    completedReports: 0,
    totalApdStock: 0,
    totalKaryawan: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data dari backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch semua data secara bersamaan (Parallel)
        // Set limit yang besar agar semua data terambil untuk kalkulasi
        const [reportsRes, apdRes, usersRes] = await Promise.all([
          reportService.getAllReports({ limit: 100 }), 
          apdService.getApds({ limit: 100 }), 
          userService.getUsers()
        ]);

        // Standarisasi bentuk response (mengantisipasi jika dibungkus '.data' atau '.data.data')
        const reports = Array.isArray(reportsRes.data) ? reportsRes.data : (Array.isArray(reportsRes) ? reportsRes : []);
        const apds = Array.isArray(apdRes.data) ? apdRes.data : (Array.isArray(apdRes) ? apdRes : []);
        const users = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes) ? usersRes : []);

        // 1. Kalkulasi Laporan
        const pending = reports.filter(r => r.status === 'pending').length;
        // Asumsi status selesai adalah 'approved' atau 'selesai' di backend
        const completed = reports.filter(r => r.status === 'approved' || r.status === 'selesai').length;

        // 2. Kalkulasi APD
        const totalApd = apds.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
        const lowStocks = apds.filter(item => Number(item.stock) > 0 && Number(item.stock) <= 5); // Stok 5 ke bawah dianggap tipis

        // 3. Kalkulasi User (Khusus Karyawan)
        const totalKaryawan = users.filter(u => u.role === 'karyawan').length;

        // 4. Aktivitas Terakhir (Ambil 3 laporan terbaru)
        // Asumsi backend memiliki field 'created_at'
        const sortedReports = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

        setDashboardData({
          pendingReports: pending,
          completedReports: completed,
          totalApdStock: totalApd,
          totalKaryawan: totalKaryawan,
        });
        setRecentActivities(sortedReports);
        setLowStockItems(lowStocks);

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format tanggal untuk aktivitas terakhir
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Baru saja';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  // Konfigurasi Stats UI
  const stats = [
    { 
      title: 'Menunggu Validasi', 
      value: dashboardData.pendingReports, 
      desc: 'Laporan perlu ditinjau',
      icon: <Clock size={24} />, 
      color: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-300'
    },
    { 
      title: 'Laporan Selesai', 
      value: dashboardData.completedReports, 
      desc: 'Total laporan divalidasi',
      icon: <FileCheck size={24} />, 
      color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'hover:border-emerald-300'
    },
    { 
      title: 'Total Stok APD', 
      value: dashboardData.totalApdStock.toLocaleString('id-ID'), 
      desc: 'Semua item tersedia',
      icon: <Package size={24} />, 
      color: 'text-blue-600', bg: 'bg-blue-100', border: 'hover:border-blue-300'
    },
    { 
      title: 'Total Karyawan', 
      value: dashboardData.totalKaryawan, 
      desc: 'Aktif di sistem',
      icon: <Users size={24} />, 
      color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'hover:border-indigo-300'
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500 font-medium">Memuat Dashboard K3...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50 animate-fade-in">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={20} className="text-rose-600" />
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">Portal Keselamatan Kerja</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Halo, {user?.name || user?.username || 'Admin'}! 👋</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Pantau seluruh aktivitas pelaporan dan ketersediaan APD hari ini.</p>
        </div>
        <button
        onClick={() => { navigate('/k3/riwayat'); }}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
          <Activity size={18} />
          Unduh Rekap Bulanan
        </button>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 ${stat.border}`}>
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
              <p className="text-sm font-bold text-slate-600 mt-1">{stat.title}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN CONTENT SPLIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: Aktivitas Terakhir */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-lg text-slate-800">Laporan Terakhir</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Lihat Semua</button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start md:items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all group cursor-pointer">
                  <div className={`p-3 rounded-xl shrink-0 ${activity.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {activity.status === 'pending' ? <Clock size={20} /> : <FileCheck size={20} />}
                  </div>
                  <div className="flex-1">
                    {/* Sesuaikan "activity.apd_name" dengan response asli dari backend-mu */}
                    <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                      Pelaporan APD: {activity.apd_name || activity.apd?.name || 'Item APD'}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Status: <span className="text-slate-700 font-bold uppercase">{activity.status}</span>
                    </p>
                  </div>
                  <div className="hidden md:block text-right shrink-0">
                    <p className="text-xs font-medium text-slate-400">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 font-medium text-sm">Belum ada aktivitas laporan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Aksi Cepat & Peringatan */}
        <div className="space-y-6">
          
          {/* Banner Peringatan Stok (Hanya muncul jika ada stok tipis) */}
          {lowStockItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex gap-4 items-start animate-fade-in">
              <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                <ShieldAlert size={24} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 mb-1">Peringatan Stok Tipis</h3>
                <p className="text-xs text-rose-700/80 leading-relaxed font-medium">
                  Ada {lowStockItems.length} jenis APD yang hampir habis: <br/>
                  {lowStockItems.map((item, i) => (
                    <span key={item.id || i}>
                      <strong>{item.name}</strong> (Sisa: {item.stock}){i < lowStockItems.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  . Segera lakukan restock.
                </p>
              </div>
            </div>
          )}

          {/* Panel Gelap Aksi Cepat */}
          <div className="bg-slate-950 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <h2 className="text-base font-black text-white mb-5 relative z-10">Aksi Cepat Admin</h2>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:border-blue-500/50 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Validasi Laporan</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {dashboardData.pendingReports > 0 ? `Ada ${dashboardData.pendingReports} laporan tertunda` : 'Semua laporan sudah divalidasi'}
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Kelola Stok APD</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Update barang masuk/keluar</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
              onClick={()=>{navigate("k3/users")}}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 hover:border-purple-500/50 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Data Pengguna</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Kelola akses Mandor & Karyawan</span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}