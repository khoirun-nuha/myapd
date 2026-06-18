import React from 'react';

export default function DetailRiwayatModal({ isOpen, onClose, report }) {
    if (!report) return null;

    const BASE_URL = import.meta.env.VITE_API_URL || '';
    const imageUrl = report.foto ? (report.foto.startsWith('http') ? report.foto : `${BASE_URL}${report.foto}`) : null;

    // Menyiapkan data teks agar aman jika kosong
    const statusLabel = report.status?.toLowerCase() || '';
    const pelaporNama = report.user?.username || report.nama || 'Karyawan';
    const pelaporNid = report.user?.nid || '-';
    const pelaporRole = report.user?.role || 'KARYAWAN';
    const apdName = report.apd?.name || report.apd?.nama_apd || report.nama_apd || 'Alat Perlindungan Diri';
    
    // Inisial untuk Avatar
    const initial = pelaporNama.substring(0, 2).toUpperCase();

    // Format Tanggal
    const tanggalKejadian = report.waktu || report.tanggal 
        ? new Date(report.waktu || report.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : '-';
    const waktuKejadian = report.waktu || report.tanggal 
        ? new Date(report.waktu || report.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
        : '-';

    // FUNGSI FORMAT NOMOR WA
    const formatWhatsAppNumber = (number) => {
        if (!number) return null;
        let formatted = number.toString().replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substring(1);
        }
        return formatted;
    };
    const waNumber = formatWhatsAppNumber(report.user?.no_telp);

    return (
        <>
            {/* Overlay Latar Belakang Gelap */}
            <div
                className={`fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            {/* Kotak Modal Utama */}
            <div
                className={`fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 sm:p-6 transition-all duration-300 ease-out ${
                    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                <div className="bg-white pointer-events-auto rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                    
                    {/* Header Modal */}
                    <div className="flex justify-between items-center p-5 sm:px-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Detail Laporan APD</h2>
                        <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Body Modal (2 Kolom di layar besar) */}
                    <div className="flex flex-col md:flex-row p-5 sm:px-8 sm:py-6 overflow-y-auto gap-8">
                        
                        {/* KOLOM KIRI: FOTO */}
                        <div className="w-full md:w-1/2 flex-shrink-0">
                            <div className="w-full h-64 md:h-full min-h-[350px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Bukti APD" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-sm font-medium">Foto tidak tersedia</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KOLOM KANAN: INFORMASI */}
                        <div className="w-full md:w-1/2 flex flex-col space-y-6">
                            
                            {/* Section Pelapor & Tombol WA */}
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dilaporkan Oleh</h4>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 md:p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base md:text-lg shadow-inner">
                                            {initial}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-bold text-gray-800 text-sm md:text-base capitalize truncate">{pelaporNama}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold text-gray-500 shrink-0">NID: {pelaporNid}</span>
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] md:text-[10px] font-bold uppercase shrink-0">{pelaporRole}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tombol Kontak WhatsApp */}
                                    <div className="shrink-0 ml-2">
                                        {waNumber ? (
                                            <a 
                                                href={`https://wa.me/${waNumber}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                title="Hubungi via WhatsApp"
                                                className="flex items-center justify-center p-2.5 md:p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            </a>
                                        ) : (
                                            <button 
                                                disabled 
                                                title="Nomor telepon tidak tersedia"
                                                className="flex items-center justify-center p-2.5 md:p-3 bg-gray-200 text-gray-400 rounded-full cursor-not-allowed"
                                            >
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section APD */}
                            <div>
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Detail Alat Perlindungan Diri (APD)</h4>
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">{apdName}</h3>
                                    {report.apd?.stok !== undefined && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            Sisa Stok Gudang Tersedia: <span className="ml-2 bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md text-xs">{report.apd?.stok} Unit</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Waktu & Lokasi (Grid 2 Kolom) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-xl p-3">
                                    <h4 className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1.5 mb-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Waktu Kejadian
                                    </h4>
                                    <p className="text-sm font-medium text-gray-800">{tanggalKejadian}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{waktuKejadian} WIB</p>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-3">
                                    <h4 className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1.5 mb-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Lokasi
                                    </h4>
                                    <p className="text-sm font-medium text-gray-800 break-words">{report.tempat || report.area || '-'}</p>
                                </div>
                            </div>

                            {/* Section Keterangan */}
                            <div>
                                <h4 className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Keterangan Kerusakan
                                </h4>
                                <div className="border border-gray-200 rounded-xl p-3 min-h-[80px]">
                                    <p className="text-sm text-gray-800 whitespace-pre-line">{report.keterangan || '-'}</p>
                                </div>
                            </div>

                            {/* Banner Status */}
                            <div className="mt-auto pt-2">
                                {statusLabel === 'selesai' || statusLabel === 'approved' ? (
                                    <div className="bg-emerald-50 text-emerald-600 font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <svg className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        Laporan Telah Disetujui
                                    </div>
                                ) : statusLabel === 'ditolak' || statusLabel === 'rejected' ? (
                                    <div className="bg-rose-50 text-rose-600 font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <svg className="w-5 h-5 bg-rose-500 text-white rounded-full p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                        Laporan Ditolak
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 text-amber-600 font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Laporan Sedang Diproses
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}