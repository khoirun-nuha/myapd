import React, { useState, useEffect, useMemo } from 'react';
import { reportService, updateReportStatusAdmin } from '../../services/reportService';
import { alertService } from '../../services/notifService';
import ApprovalModal from '../../components/modal/ApprovalModal';

export default function LaporanPage() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // States Filter & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // States Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // States Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // FIX BUG: Mengunci scroll dan membersihkan sisa z-index saat modal dibuka/tutup
    // Ini menyelesaikan masalah "card hanya bisa diklik sekali"
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Sedikit delay untuk memastikan animasi CSS selesai sebelum report dikosongkan
            setTimeout(() => setSelectedReport(null), 300); 
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    useEffect(() => {
        fetchAllReports();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateFilter]);

    const fetchAllReports = async () => {
        try {
            const res = await reportService.getAllReports();
            setReports(res.data || []);
        } catch (error) {
            alertService.error("Gagal", "Tidak dapat memuat data laporan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleApprove = async (id) => {
        try {
            setIsProcessing(true);
            await updateReportStatusAdmin(id, 'approved');

            alertService.success("Berhasil", "Laporan disetujui, stok APD telah dikurangi.");
            setIsModalOpen(false);
            fetchAllReports();
        } catch (error) {
            alertService.error("Gagal", error.response?.data?.message || "Gagal menyetujui laporan.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredAndSortedReports = useMemo(() => {
        const filtered = reports.filter(report => {
            const q = searchQuery.toLowerCase();
            const matchText =
                (report.user?.username || '').toLowerCase().includes(q) ||
                (report.user?.nid || '').toLowerCase().includes(q) ||
                (report.apd?.name || '').toLowerCase().includes(q);

            let matchDate = true;
            if (dateFilter) {
                const reportDate = new Date(report.waktu).toISOString().split('T')[0];
                matchDate = reportDate === dateFilter;
            }

            return matchText && matchDate;
        });

        return filtered.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.waktu) - new Date(a.waktu);
        });
    }, [reports, searchQuery, dateFilter]);

    const totalPages = Math.ceil(filteredAndSortedReports.length / itemsPerPage);
    const currentReports = filteredAndSortedReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        // Container Full Width menyesuaikan sisa ruang Dashboard Admin
        <div className="w-full h-full p-4 md:p-8 bg-gray-50/30 min-h-screen">
            
            {/* Header Sesuai Screenshot */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Persetujuan Laporan</h1>
                <p className="text-sm text-gray-500 mt-1">Tinjau pengajuan dan atur stok APD.</p>
            </div>

            {/* Area Search & Filter (Full Width) */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Cari karyawan / APD..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-shadow"
                    />
                </div>

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full md:w-56 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                />
            </div>

            {/* List Laporan (Format Card Full Width) */}
            <div className="space-y-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12 text-blue-500 font-medium animate-pulse">Memuat data laporan...</div>
                ) : currentReports.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500">
                        Tidak ada laporan ditemukan.
                    </div>
                ) : (
                    currentReports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => handleCardClick(report)}
                            className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all flex justify-between items-center w-full group"
                        >
                            {/* Kiri: Avatar & Info */}
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {report.user?.username?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 text-base">{report.user?.username || 'Karyawan'}</span>
                                    <span className="font-bold text-blue-600 text-sm mt-0.5">{report.apd?.name || 'Alat Perlindungan'}</span>
                                    <span className="text-gray-400 text-[11px] mt-1 font-medium">
                                        {new Date(report.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Kanan: Badge Status */}
                            <div>
                                {report.status === 'approved' ? (
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider">
                                        DISETUJUI
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider animate-pulse">
                                        PENDING
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Navigasi Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-sm font-bold text-gray-500">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}

            {/* Modal Approval (Hanya dirender saat dibutuhkan untuk mencegah bug klik) */}
            {selectedReport && (
                <ApprovalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    report={selectedReport}
                    onApprove={handleApprove}
                    isProcessing={isProcessing}
                />
            )}
            
        </div>
    );
}