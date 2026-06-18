import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { getPayload, updateProfile, updatePassword, clearAuthData } from '../../services/authService';
import { alertService } from '../../services/notifService';

export default function KaryawanProfil() {
  const user = getPayload();
  console.log("Data user dari payload:", user);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(user?.fotoProfil || null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || user?.username || '', 
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isEditProfileOpen || isEditPasswordOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isEditProfileOpen, isEditPasswordOpen]);

  const handleLogoutClick = async () => {
    const result = await alertService.confirm(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk masuk.',
      'Ya, Keluar'
    );

    if (result.isConfirmed) {
      clearAuthData();
      alertService.success('Berhasil Keluar', 'Anda telah keluar dari aplikasi.');
      navigate('/login');
    }
  };

  // FUNGSI UNTUK MENGAMANKAN UNGGAH FOTO PROFIL (PROTEKSI FRONTEND)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validasi MIME Type (Tipe Konten Asli File)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.type)) {
      alertService.error('Keamanan Gagal', 'Format file tidak diizinkan! Hanya boleh JPG, JPEG, PNG, atau WEBP.');
      e.target.value = ''; // Reset input file agar hacker tidak bisa mengirim file ini
      return;
    }

    // 2. Validasi Ekstensi File secara Manual (Mencegah manipulasi ekstensi palsu)
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
    if (!allowedExtensions.exec(file.name)) {
      alertService.error('Keamanan Gagal', 'Ekstensi file tidak valid! Sistem menolak file non-gambar.');
      e.target.value = ''; // Reset input file
      return;
    }

    // 3. Validasi Ukuran File Maksimal (2MB)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alertService.error('Validasi Gagal', 'Ukuran foto terlalu besar. Maksimal adalah 2MB.');
      e.target.value = ''; // Reset input file
      return;
    }

    // Jika lolos dari semua barikade keamanan, simpan file ke state
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.nama.trim()) {
      alertService.error('Validasi Gagal', 'Nama Lengkap tidak boleh kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('nama', profileForm.nama);
      
      if (selectedFile) {
        formData.append('fotoProfil', selectedFile); 
      }

      await updateProfile(formData);

      alertService.success('Sukses', 'Profil berhasil diperbarui. Silakan login ulang untuk melihat perubahan penuh.');
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Error saat memperbarui profil:", error);
      alertService.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan sistem saat memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alertService.error('Validasi Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alertService.error('Validasi Gagal', 'Kata sandi minimal 6 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      alertService.success('Sukses', 'Kata sandi berhasil diubah.');
      setIsEditPasswordOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alertService.error('Gagal', error.response?.data?.message || 'Kata sandi lama salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-xs text-gray-500 mt-0.5">Kelola informasi akun dan keamanan Anda.</p>
      </div>

      {/* CARD PROFIL & FOTO */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 text-center mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl z-0"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-50 rounded-full blur-2xl z-0"></div>

        <div className="relative inline-block mb-3">
          <div 
            onClick={() => fileInputRef.current.click()}
            className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 overflow-hidden cursor-pointer group"
            title="Klik untuk ubah foto profil"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{profileForm.nama?.substring(0, 2).toUpperCase() || 'US'}</span>
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg,image/png,image/webp,image/jpg" 
            className="hidden" 
          />
        </div>

        <h3 className="relative z-10 text-lg font-bold text-gray-800">{user?.nama || user?.username || 'Nama Belum Diatur'}</h3>
        <p className="relative z-10 text-sm text-gray-500 mb-1">NID: {user?.nid || '-'}</p>
        
        <span className="relative z-10 text-[10px] text-blue-700 font-bold px-3 py-1 bg-blue-100 border border-blue-200 rounded-full inline-block uppercase tracking-wider">
          {user?.role || 'Karyawan'}
        </span>
      </div>

      {/* MENU AKSI PROFIL */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl mb-6 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Nomor Induk (NID)</span>
            <span className="text-sm text-gray-700 font-medium font-mono">{user?.nid || 'Tidak tersedia'}</span>
          </div>
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>

        <div
          onClick={() => setIsEditProfileOpen(true)}
          className="p-4 flex justify-between items-center hover:bg-blue-50 cursor-pointer active:bg-blue-100 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Ubah Nama Lengkap</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>

        <div
          onClick={() => setIsEditPasswordOpen(true)}
          className="p-4 flex justify-between items-center hover:bg-amber-50 cursor-pointer active:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Ubah Kata Sandi</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>

      {/* Tombol Logout */}
      <button
        onClick={handleLogoutClick}
        className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-xl text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Logout
      </button>

      {/* MODAL 1: EDIT PROFIL */}
      <div
        className={`fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isEditProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsEditProfileOpen(false)}
      ></div>
      <div className={`fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none transition-transform duration-300 ease-out ${isEditProfileOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white pointer-events-auto border-t border-gray-200 rounded-t-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-md font-bold text-gray-900 mb-5">Ubah Data Profil</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">NID (Tidak dapat diubah)</label>
              <input
                type="text" disabled
                value={user?.nid || ''}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
              <input
                type="text" required
                value={profileForm.nama}
                onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 rounded-xl text-sm bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">Batal</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-sm bg-blue-600 text-white font-bold shadow-md disabled:opacity-50 hover:bg-blue-700 transition-colors">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL 2: UBAH KATA SANDI */}
      <div
        className={`fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isEditPasswordOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsEditPasswordOpen(false)}
      ></div>
      <div className={`fixed inset-x-0 bottom-0 z-[70] flex justify-center pointer-events-none transition-transform duration-300 ease-out ${isEditPasswordOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white pointer-events-auto border-t border-gray-200 rounded-t-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-md font-bold text-gray-900 mb-5">Ubah Kata Sandi</h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Kata Sandi Lama</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  required placeholder="Masukkan kata sandi saat ini"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 pr-12 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showOldPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 pr-12 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required placeholder="Ketik ulang kata sandi baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 pr-12 text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditPasswordOpen(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setShowOldPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="flex-1 py-3 rounded-xl text-sm bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-sm bg-amber-500 text-white font-bold shadow-md disabled:opacity-50 hover:bg-amber-600 transition-colors">
                {isSubmitting ? 'Memproses...' : 'Ubah Sandi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}