import React from 'react';

export default function ApprovalModal({ isOpen, onClose, report, onApprove, isProcessing }) {
    if (!report) return null;

    const BASE_URL = import.meta.env.VITE_API_URL || '';
    const imageUrl = report.foto ? (report.foto.startsWith('http') ? report.foto : `${BASE_URL}${report.foto}`) : null;
    const isApproved = report.status === 'approved';

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
            {/* Latar Belakang Hitam */}
            <div
                className={`fixed inset-0 z-[60] bg-gray-900/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Kontainer Utama Modal */}
            <div className={`fixed inset-0 z-[70] flex justify-center items-end md:items-center p-0 md:p-6 pointer-events-none transition-all duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                <div className={`bg-white pointer-events-auto w-full max-w-lg md:max-w-4xl lg:max-w-5xl border border-gray-200 rounded-t-3xl md:rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-y-0 md:scale-100' : 'translate-y-full md:translate-y-0 md:scale-95'}`}>

                    {/* Handle bar kecil hanya tampil di versi Mobile */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5 md:hidden shrink-0"></div>

                    {/* Header Modal (Judul & Tombol Close) */}
                    <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 pb-4">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Detail Laporan APD</h2>
                        <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto pr-1 custom-scrollbar">

                        {/* KOLOM KIRI: FOTO */}
                        <div className="w-full md:w-1/2 flex flex-col shrink-0">
                            <div className="w-full h-64 md:h-full min-h-[300px] md:min-h-[450px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex items-center justify-center p-2">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Bukti Kerusakan" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-sm font-medium">Foto tidak tersedia</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KOLOM KANAN: DETAIL INFORMASI */}
                        <div className="w-full md:w-1/2 flex flex-col space-y-6">

                            {/* Profil Pengirim Laporan & Tombol Hubungi */}
                            <div>
                                <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dilaporkan Oleh</h4>
                                <div className="flex justify-between items-center p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base md:text-lg shadow-inner">
                                            {report.user?.username?.substring(0, 2).toUpperCase() || 'US'}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm md:text-base font-bold text-gray-900 truncate">{report.user?.username || 'Nama Karyawan'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] md:text-xs text-gray-500 font-mono bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm shrink-0">NID: {report.user?.nid || '-'}</span>
                                                <span className="text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide shrink-0">{report.user?.role || 'Karyawan'}</span>
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

                            {/* Informasi APD & Stok */}
                            <div>
                                <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detail Alat Perlindungan Diri (APD)</h4>
                                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">{report.apd?.name || 'APD Tidak Diketahui'}</h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs md:text-sm text-gray-500 font-medium">Sisa Stok Gudang Tersedia:</span>
                                        <span className={`px-2.5 py-0.5 rounded-md text-xs md:text-sm font-bold ${report.apd?.stock > 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                            {report.apd?.stock} Unit
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Kejadian */}
                            <div className="grid grid-cols-2 gap-4 bg-blue-50/40 p-5 rounded-2xl border border-blue-100">
                                <div>
                                    <span className="text-[10px] md:text-xs text-blue-600 font-bold uppercase block mb-1.5 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Waktu Kejadian
                                    </span>
                                    <p className="text-xs md:text-sm text-gray-800 font-medium bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                                        {new Date(report.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} <br />
                                        <span className="text-gray-500 font-normal">{new Date(report.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] md:text-xs text-blue-600 font-bold uppercase block mb-1.5 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Lokasi
                                    </span>
                                    <p className="text-xs md:text-sm text-gray-800 font-medium bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                                        {report.tempat}
                                    </p>
                                </div>
                                <div className="col-span-2 mt-1">
                                    <span className="text-[10px] md:text-xs text-blue-600 font-bold uppercase block mb-1.5 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Keterangan Kerusakan
                                    </span>
                                    <p className="text-xs md:text-sm text-gray-800 font-medium leading-relaxed bg-white p-3.5 rounded-lg border border-blue-100 shadow-sm">
                                        {report.keterangan}
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                {isApproved ? (
                                    <div className="w-full py-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm md:text-base text-center flex items-center justify-center gap-2 border border-emerald-200">
                                        <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        Laporan Telah Disetujui
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onApprove(report.id)}
                                        disabled={isProcessing || report.apd?.stock < 1}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl text-sm md:text-base transition-all flex justify-center items-center gap-3 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Memproses Persetujuan...
                                            </>
                                        ) : report.apd?.stock < 1 ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                Persetujuan Gagal: Stok APD Habis
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Setujui Laporan & Kurangi Stok
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}