import React, { useState, useEffect } from 'react';
import { alertService } from '../services/notifService';
import { reportService } from '../services/reportService'; 
import DetailRiwayatModal from '../components/modal/DetailRiwayatModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // PERBAIKAN 1: Import eksplisit autoTable untuk Vite
import { useAuth } from '../context/AuthContext'; // PERBAIKAN: Import Context Auth

export default function Riwayat() {
    const { user } = useAuth(); // PERBAIKAN: Ambil data user dari Context
    
    const [riwayat, setRiwayat] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // --- STATE UNTUK PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // FUNGSI UNTUK MEMBUKA MODAL
    const handleOpenDetail = (item) => {
        setSelectedReport(item);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchRiwayat();
    }, []);

    // RESET KE HALAMAN 1 JIKA USER FILTER/SEARCH DATA
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    // FETCH DATA DARI API (BACKEND)
    const fetchRiwayat = async () => {
        setIsLoading(true);
        try {
            const response = await reportService.getAllReports();
            const dataDariServer = response.data || response || [];
            setRiwayat(dataDariServer);
        } catch (error) {
            console.error("Gagal mengambil riwayat pelaporan:", error);
            alertService.error('Error', 'Gagal memuat data riwayat pelaporan dari server.');
            setRiwayat([]); 
        } finally {
            setIsLoading(false);
        }
    };

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState(''); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- HANDLER UNTUK MEMBUKA MODAL EXPORT ---
    const handleExportClick = (type) => {
        setExportType(type); 
        setStartDate('');    
        setEndDate('');
        setIsExportModalOpen(true);
    };

    // --- FUNGSI EKSEKUSI EXPORT ---
    const executeExport = () => {
        // 1. Validasi Input
        if (!startDate || !endDate) {
            return alertService.error("Peringatan", "Harap isi rentang tanggal mulai dan akhir!");
        }
        if (new Date(startDate) > new Date(endDate)) {
            return alertService.error("Peringatan", "Tanggal mulai tidak boleh lebih dari tanggal akhir!");
        }

        // 2. Filter Data Berdasarkan Rentang Tanggal
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);

        const dataToExport = riwayat.filter(item => {
            const dateStr = item.waktu || item.createdAt;
            if (!dateStr) return false;
            const itemTime = new Date(dateStr).getTime();
            return itemTime >= start && itemTime <= end;
        });

        if (dataToExport.length === 0) {
            return alertService.error("Kosong", "Tidak ada data riwayat pada rentang tanggal tersebut.");
        }

        // 3. Mapping/Format data mentah JSON menjadi format rapi
        const formattedData = dataToExport.map((item, index) => {
            const dateStr = item.waktu || item.createdAt;
            return {
                "No": index + 1,
                "Tanggal": dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
                "Waktu": dateStr ? new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-',
                "NID": item.user?.nid || '-',
                "Nama Karyawan": item.user?.username || '-',
                "Nama APD": item.apd?.name || '-',
                "Lokasi": item.tempat || '-',
                "Keterangan": item.keterangan || '-',
                "Status": (item.status || '').toUpperCase()
            };
        });

        // 4. Proses Export Sesuai Tipe
        try {
            if (exportType === 'print') {
                let printContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="text-align: center;">Laporan Riwayat Pelaporan APD</h2>
                    <p style="text-align: center; color: #555;">Periode: ${startDate} s.d ${endDate}</p>
                    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; text-align: left;">
                        <thead style="background-color: #f3f4f6;">
                            <tr>
                                <th style="padding: 8px;">No</th>
                                <th style="padding: 8px;">Tanggal & Waktu</th>
                                <th style="padding: 8px;">NID</th>
                                <th style="padding: 8px;">Nama Karyawan</th>
                                <th style="padding: 8px;">Nama APD</th>
                                <th style="padding: 8px;">Lokasi</th>
                                <th style="padding: 8px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                formattedData.forEach(item => {
                    printContent += `
                    <tr>
                        <td style="padding: 8px;">${item.No}</td>
                        <td style="padding: 8px;">${item.Tanggal}<br/>${item.Waktu}</td>
                        <td style="padding: 8px;">${item.NID}</td>
                        <td style="padding: 8px;">${item["Nama Karyawan"]}</td>
                        <td style="padding: 8px;">${item["Nama APD"]}</td>
                        <td style="padding: 8px;">${item.Lokasi}</td>
                        <td style="padding: 8px;">${item.Status}</td>
                    </tr>
                    `;
                });

                printContent += `</tbody></table></div>`;

                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                <html>
                    <head><title>Cetak Laporan APD</title></head>
                    <body>${printContent}</body>
                </html>
                `);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }

            else if (exportType === 'pdf') {
                const doc = new jsPDF();

                doc.setFontSize(14);
                doc.text("Laporan Riwayat Pelaporan APD", 14, 15);
                doc.setFontSize(10);
                doc.text(`Periode: ${startDate} s.d ${endDate}`, 14, 22);

                const tableColumns = ["No", "Tanggal", "Nama Karyawan", "Nama APD", "Lokasi", "Status"];
                const tableRows = formattedData.map(item => [
                    item.No,
                    `${item.Tanggal} ${item.Waktu}`,
                    item["Nama Karyawan"],
                    item["Nama APD"],
                    item.Lokasi,
                    item.Status
                ]);

                autoTable(doc, {
                    head: [tableColumns],
                    body: tableRows,
                    startY: 28, 
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [41, 128, 185] } 
                });

                doc.save(`Laporan_APD_${startDate}_to_${endDate}.pdf`);
                alertService.success('Berhasil', 'File PDF berhasil diunduh.');
            }

            else if (exportType === 'excel') {
                const worksheet = XLSX.utils.json_to_sheet(formattedData);
                const workbook = XLSX.utils.book_new();

                worksheet['!cols'] = [
                    { wch: 5 },  // No
                    { wch: 20 }, // Tanggal
                    { wch: 15 }, // Waktu
                    { wch: 15 }, // NID
                    { wch: 25 }, // Nama Karyawan
                    { wch: 20 }, // Nama APD
                    { wch: 25 }, // Lokasi
                    { wch: 35 }, // Keterangan
                    { wch: 15 }  // Status
                ];

                XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Laporan");
                XLSX.writeFile(workbook, `Laporan_APD_${startDate}_to_${endDate}.xlsx`);
                alertService.success('Berhasil', 'File Excel berhasil diunduh.');
            }

            setIsExportModalOpen(false);

        } catch (error) {
            console.error("Error saat proses export:", error);
            alertService.error("Gagal", "Terjadi kesalahan saat memproses file export.");
        }
    };

    // PROSES FILTER DATA RIWAYAT
    const filteredRiwayat = riwayat.filter((item) => {
        const nama = (item?.nama || item?.user?.username || '').toLowerCase();
        const tempat = (item?.tempat || '').toLowerCase();
        const status = (item?.status || '').toLowerCase();

        const matchesSearch =
            nama.includes(searchQuery.toLowerCase()) ||
            tempat.includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || status === filterStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // LOGIKA MATEMATIKA PAGINATION
    const totalItems = filteredRiwayat.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const paginatedRiwayat = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);

    const formatTanggal = (tglStr) => {
        if (!tglStr) return '-';
        try {
            const date = new Date(tglStr);
            if (isNaN(date.getTime())) return tglStr;
            return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return tglStr;
        }
    };

    return (
        <div className="p-3 max-w-8xl mx-auto min-h-screen">
            {/* Header Halaman */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Riwayat Pelaporan</h1>
                    <p className="text-gray-500 text-sm mt-1">Pantau rekam jejak, cetak dokumen, dan status pelaporan APD masuk.</p>
                </div>

                {/* TOMBOL AKSI EXPORT - HANYA MUNCUL UNTUK ADMIN */}
                {user?.role === 'admin' && (
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => handleExportClick('print')}
                            className="flex-1 md:flex-none bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>

                        <button
                            onClick={() => handleExportClick('pdf')}
                            className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                        </button>

                        <button
                            onClick={() => handleExportClick('excel')}
                            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel
                        </button>
                    </div>
                )}
            </div>

            {/* Baris Filter & Pencarian */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama Karyawan atau Area..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="selesai">Selesai</option>
                        <option value="diproses">Diproses</option>
                        <option value="ditolak">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Tabel Data Wrapper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">Nama Karyawan</th>
                                <th className="px-6 py-4 font-semibold">Area / Lokasi</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Memuat riwayat pelaporan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRiwayat.length > 0 ? (
                                paginatedRiwayat.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{formatTanggal(item.tanggal || item.createdAt)}</td>
                                        <td className="px-6 py-4">{item.nama || item.user?.username || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.tempat || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${(item.status || '').toLowerCase() === 'approved' || (item.status || '').toLowerCase() === 'selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                (item.status || '').toLowerCase() === 'pending' || (item.status || '').toLowerCase() === 'diproses' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {item.status || 'Tidak Diketahui'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenDetail(item)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center" title="Lihat Detail">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                                        Tidak ada riwayat pelaporan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* KOMPONEN BAR PAGINATION */}
                {!isLoading && totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-sm text-gray-600">
                        <div>
                            Menampilkan <span className="font-semibold text-gray-800">{indexOfFirstItem + 1}</span> sampai{' '}
                            <span className="font-semibold text-gray-800">
                                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
                            </span>{' '}
                            dari <span className="font-semibold text-gray-800">{totalItems}</span> data
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                            >
                                Sebelumnya
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-9 h-9 border rounded-md font-medium transition-all flex-shrink-0 ${currentPage === pageNumber
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL FILTER TANGGAL EXPORT */}
            {isExportModalOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[80] bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsExportModalOpen(false)}
                    ></div>

                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 pointer-events-auto flex flex-col gap-5">

                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Pilih Rentang Waktu Export
                                </h2>
                                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p>Format yang akan di-export adalah <strong>{exportType.toUpperCase()}</strong>. Pastikan data pada rentang tanggal tersebut tersedia.</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeExport}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                                >
                                    Proses {exportType.toUpperCase()}
                                </button>
                            </div>

                        </div>
                    </div>
                </>
            )}
            <DetailRiwayatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                report={selectedReport}
            />
        </div>
    );
}