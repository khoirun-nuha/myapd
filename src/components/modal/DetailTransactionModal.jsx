import React from 'react';

export default function DetailTransactionModal({ isOpen, onClose, report }) {
    if (!report) return null; // Jangan render isi jika tidak ada data
    const BASE_URL = import.meta.env.VITE_API_URL || '';

    // Sesuaikan URL ini dengan port backend Express-mu (misal: port 5000)
    // Ini penting karena path di database hanya "/uploads/file.jpg"
    const imageUrl = report.foto ? (report.foto.startsWith('http') ? report.foto : `${BASE_URL}${report.foto}`) : null;

    return (
        <>
            {/* Latar Belakang Hitam */}
            <div
                className={`fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                onClick={onClose}
            ></div>

            {/* Kotak Modal (Bottom Sheet) */}
            <div
                className={`fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
            >
                <div className="bg-white pointer-events-auto border-t border-gray-200 rounded-t-3xl w-full max-w-md p-6 pb-24 shadow-2xl max-h-[90vh] overflow-y-auto">

                    {/* Handle bar kecil di atas modal */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5"></div>

                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-gray-900">Detail Laporan</h2>
                        <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Area Foto */}
                        <div className="w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Bukti APD" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-xs">Foto tidak tersedia</span>
                                </div>
                            )}

                            {/* Floating Status Badge di atas foto */}
                            <div className="absolute top-3 right-3 shadow-sm">
                                {report.status?.toLowerCase() === 'approved' ? (
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide">Disetujui</span>
                                ) : report.status?.toLowerCase() === 'rejected' ? (
                                    <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide">Ditolak</span>
                                ) : (
                                    <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide">Menunggu</span>
                                )}
                            </div>
                        </div>

                        {/* Informasi Utama */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{report.apd?.name || report.apd?.nama_apd || 'Alat Perlindungan'}</h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {new Date(report.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                            </p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Detail Keterangan & Tempat */}
                        <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <div>
                                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Lokasi Kejadian
                                </span>
                                <p className="text-sm text-gray-800 font-medium">{report.tempat || '-'}</p>
                            </div>

                            <div>
                                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Detail Kerusakan
                                </span>
                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{report.keterangan || '-'}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}