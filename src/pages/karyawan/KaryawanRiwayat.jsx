import React, { useState, useEffect, useMemo } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { reportService } from '../../services/reportService';
// Import komponen modal yang baru dibuat (sesuaikan path-nya jika berbeda folder)
import DetailTransactionModal from '../../components/modal/DetailTransactionModal'; 

export default function KaryawanRiwayat() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Fitur Search & Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Mencegah background scroll saat modal detail terbuka
  useEffect(() => {
    if (isModalOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  const fetchMyReports = async () => {
    try {
      const res = await reportService.getMyReports();
      setReports(res.data || res || []);
    } catch (e) {
      console.error("Gagal memuat riwayat:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Menggunakan useMemo agar pencarian lebih optimal performanya
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    
    const query = searchQuery.toLowerCase();
    return reports.filter(report => {
      const apdName = (report.apd?.name || report.apd?.nama_apd || '').toLowerCase();
      const tempat = (report.tempat || '').toLowerCase();
      const keterangan = (report.keterangan || '').toLowerCase();
      
      return apdName.includes(query) || tempat.includes(query) || keterangan.includes(query);
    });
  }, [reports, searchQuery]);

  return (
    <MobileLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Pengajuan</h1>
        <p className="text-xs text-gray-500 mt-0.5">Pantau status laporan kerusakan APD Anda.</p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <input 
          type="text" 
          placeholder="Cari nama APD atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {/* Tombol Clear Search (Silang) */}
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* LIST DATA */}
      <div className="space-y-3 pb-6">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500 text-xs animate-pulse">Memuat data riwayat...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 bg-white rounded-xl text-gray-500 text-sm flex flex-col items-center">
            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {searchQuery ? 'Data tidak ditemukan.' : 'Belum ada riwayat pengajuan.'}
          </div>
        ) : (
          filteredReports.map((report) => (
            // Mengubah DIV menjadi interaktif (Bisa diklik)
            <div 
              key={report.id} 
              onClick={() => handleCardClick(report)}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 cursor-pointer hover:border-blue-300 active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="pr-2">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1">
                    {report.apd?.name || report.apd?.nama_apd || 'Alat Perlindungan'}
                  </h4>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {new Date(report.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="shrink-0">
                  {report.status?.toLowerCase() === 'approved' ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wide">Disetujui</span>
                  ) : report.status?.toLowerCase() === 'rejected' ? (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold uppercase tracking-wide">Ditolak</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wide">Pending</span>
                  )}
                </div>
              </div>

              {/* Preview Keterangan (Dipotong jika kepanjangan) */}
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {report.keterangan || 'Tidak ada detail keterangan.'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Panggil Komponen Modal yang dipisah */}
      <DetailTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReport}
      />

    </MobileLayout>
  );
}