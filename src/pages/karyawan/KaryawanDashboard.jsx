import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import { apdService } from '../../services/apdService';
import { reportService } from '../../services/reportService';
import { alertService } from '../../services/notifService';
import { getPayload } from '../../services/authService';

export default function KaryawanDashboard() {
  const [apdList, setApdList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const [formData, setFormData] = useState({ apdId: '', tempat: '', keterangan: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getPayload();

  useEffect(() => {
    if (isModalOpen || isGuideModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen, isGuideModalOpen]);

  // Membersihkan memori preview gambar agar tidak pecah/blank
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    loadApd();
  }, []);

  const loadApd = async () => {
    try {
      const res = await apdService.getApds({ limit: 100 });
      setApdList(res.data || res || []);
    } catch (e) {
      alertService.error('Gagal', 'Gagal memuat daftar APD.');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Validasi Format Gambar
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alertService.error('Format Tidak Sah', 'Foto harus berformat JPG, JPEG, PNG, atau WEBP.');
        e.target.value = ''; // Reset input
        return;
      }

      // 2. Validasi Ukuran (Maks 5MB)
      const maxFileSizeMB = 5;
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        alertService.error('Ukuran Terlalu Besar', `Ukuran foto maksimal adalah ${maxFileSizeMB}MB.`);
        e.target.value = ''; // Reset input
        return;
      }

      // 3. Simpan jika aman
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.apdId) {
      alertService.error('Validasi Gagal', 'Silakan pilih APD terlebih dahulu.');
      return;
    }

    const tempatTrimmed = formData.tempat.trim();
    if (!tempatTrimmed) {
      alertService.error('Validasi Gagal', 'Lokasi/Tempat tidak boleh kosong.');
      return;
    }

    const keteranganTrimmed = formData.keterangan.trim();
    if (!keteranganTrimmed) {
      alertService.error('Validasi Gagal', 'Keterangan tambahan tidak boleh kosong.');
      return;
    }

    if (!photoFile) {
      alertService.error('Validasi Gagal', 'Foto bukti APD rusak wajib diunggah.');
      return;
    }
    
    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append('apdId', Number(formData.apdId));
      submitData.append('tempat', tempatTrimmed); 
      submitData.append('keterangan', keteranganTrimmed);
      submitData.append('waktu', new Date().toISOString()); 
      submitData.append('foto', photoFile);

      await reportService.createReport(submitData);

      alertService.success('Sukses', 'Laporan APD dan foto berhasil dikirim.');

      setIsModalOpen(false);
      setFormData({ apdId: '', tempat: '', keterangan: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      alertService.error('Gagal', err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      {/* ---------------- SISI GELAP (SLATE-950) ---------------- */}
      <div className="bg-slate-950 -mx-4 -mt-4 p-6 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">MyAPD Mobile</span>
            <h1 className="text-2xl font-black text-white truncate max-w-[200px] mt-0.5">{user?.name || 'Karyawan'}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-900/50 border border-blue-500/30">
            {user?.name?.substring(0, 2).toUpperCase() || 'KY'}
          </div>
        </div>
      </div>

      {/* ---------------- SISI PUTIH (KONTEN BAWAH) ---------------- */}
      
      {/* INFO BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-2xl"></div>
        <h3 className="text-sm font-black text-slate-800 mb-1">Utamakan Keselamatan! 👷‍♂️</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">Selalu periksa kelayakan APD Anda sebelum memulai giliran kerja. Laporkan segera jika ada kerusakan.</p>
      </div>

      {/* MENU ACTIONS */}
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Layanan Cepat</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div onClick={() => setIsModalOpen(true)} className="bg-white border border-slate-200 p-4 rounded-2xl cursor-pointer active:scale-95 transition-all shadow-sm hover:border-blue-300">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 border border-amber-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h4 className="text-sm font-bold text-slate-800">Laporkan Rusak</h4>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Ajukan penggantian</span>
        </div>

        <div onClick={() => setIsGuideModalOpen(true)} className="bg-white border border-slate-200 p-4 rounded-2xl cursor-pointer active:scale-95 transition-all shadow-sm hover:border-blue-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253" /></svg>
          </div>
          <h4 className="text-sm font-bold text-slate-800">Panduan K3</h4>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">SOP & Cara Pakai</span>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/40 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
        <span className="text-sm font-bold pr-1">Lapor APD</span>
      </button>

      {/* ===================================================================== */}
      {/* MODAL 1: FORM PENGAJUAN LAPORAN APD */}
      {/* ===================================================================== */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsModalOpen(false)}
      ></div>
      
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none transition-transform duration-300 ease-out
          ${isModalOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-white pointer-events-auto border-t border-slate-200 rounded-t-[2rem] w-full max-w-md p-6 pb-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
          <h2 className="text-lg font-black text-slate-800 mb-5">Ajukan Laporan APD Baru</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PILIH APD */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pilih APD</label>
              <select
                required value={formData.apdId}
                onChange={(e) => setFormData({ ...formData, apdId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all appearance-none"
              >
                <option value="" disabled>-- Pilih APD --</option>
                {apdList.map(apd => (
                  <option key={apd.id} value={apd.id}>{apd.name || apd.nama_apd}</option>
                ))}
              </select>
            </div>

            {/* FOTO BUKTI */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bukti Foto (Wajib)</label>
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <img src={photoPreview} alt="Preview APD" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-2 rounded-full shadow-md backdrop-blur-sm active:scale-95 transition-transform"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs font-semibold text-slate-500">Ketuk untuk Ambil Foto</p>
                  </div>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            {/* LOKASI */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lokasi Kejadian</label>
              <input
                type="text"
                required placeholder="Contoh: Area Produksi Gedung B"
                value={formData.tempat}
                onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* KETERANGAN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Keterangan / Kondisi APD</label>
              <textarea
                required rows="3" placeholder="Jelaskan bagian mana yang rusak..."
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 font-medium placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-3">
              <button type="button" onClick={() => { setIsModalOpen(false); removePhoto(); }} className="flex-1 py-3.5 rounded-xl text-sm bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Batal</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl text-sm bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 hover:bg-blue-700 transition-all">
                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 2: PANDUAN K3 (SOP) */}
      {/* ===================================================================== */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
          ${isGuideModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsGuideModalOpen(false)}
      ></div>

      <div
        className={`fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none transition-transform duration-300 ease-out
          ${isGuideModalOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-white pointer-events-auto border-t border-slate-200 rounded-t-[2rem] w-full max-w-md p-6 pb-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800">Panduan SOP APD</h2>
            <button onClick={() => setIsGuideModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed pb-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1.5 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-white border shadow-sm flex items-center justify-center text-[10px]">1</span> 
                Helm Keselamatan
              </h4>
              <p>Wajib digunakan di area proyek/produksi. Pastikan tali dagu terpasang kencang dan batok helm tidak retak.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1.5 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-white border shadow-sm flex items-center justify-center text-[10px]">2</span> 
                Sepatu Safety
              </h4>
              <p>Gunakan sepatu dengan pelindung besi di ujungnya untuk menghindari risiko tertimpa benda berat atau tertusuk paku.</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <h4 className="font-bold text-rose-800 mb-1.5 text-sm flex items-center gap-2">
                🚨 Prosedur Kerusakan
              </h4>
              <p className="text-rose-700">Jika APD Anda rusak, segera tekan tombol <strong>"Laporkan Rusak"</strong>, foto kerusakannya, dan minta unit baru ke tim K3.</p>
            </div>
          </div>

          <button
            onClick={() => setIsGuideModalOpen(false)}
            className="w-full py-4 mt-2 rounded-xl text-sm bg-slate-900 text-white font-bold hover:bg-black active:scale-[0.98] transition-all"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}