import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { updateProfile, updatePassword } from '../services/authService'; 
import { alertService } from '../services/notifService'; 
import { Camera, Save, KeyRound } from 'lucide-react'; // Tambahan icon

export default function ProfilPage() {
    const { user, updateUserData } = useAuth(); // Ambil dari Context
    const fileInputRef = useRef(null);
    const BASE_URL = import.meta.env.VITE_API_URL; // Sesuaikan jika port backend berbeda

    // State untuk Form Profil
    const [formData, setFormData] = useState({
        username: '',
        no_telp: ''
    });
    
    // State untuk Foto
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // State untuk Form Password
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Set nilai awal form saat komponen dimuat / saat Context `user` tersedia
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                no_telp: user.no_telp || ''
            });
            if (user.foto_profil) {
                setPhotoPreview(`${BASE_URL}${user.foto_profil}`);
            }
        }
    }, [user]);

    // Handle Input Text Profil
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Input Password
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    // Trigger Klik Input File tersembunyi
    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    // Handle saat user memilih gambar
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran (Misal max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alertService.error('Terlalu Besar', 'Ukuran foto maksimal 2MB.');
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file)); // Buat preview lokal sementara
        }
    };

    // SUBMIT: Simpan Info & Foto Profil
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        
        if (!formData.username) {
            return alertService.error('Gagal', 'Nama lengkap tidak boleh kosong!');
        }

        setIsSavingProfile(true);
        try {
            // Siapkan FormData
            const submitData = new FormData();
            submitData.append('username', formData.username);
            if (formData.no_telp) submitData.append('no_telp', formData.no_telp);
            if (photoFile) submitData.append('foto_profil', photoFile);

            // Tembak API
            const response = await updateProfile(submitData);
            
            if (response.success) {
                // Update Context & LocalStorage secara serentak!
                updateUserData(response.data); 
                alertService.success('Berhasil!', 'Informasi profil berhasil diperbarui.');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan profil.';
            alertService.error('Gagal!', errorMsg);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // SUBMIT: Ubah Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
            return alertService.error('Oops', 'Semua kolom password harus diisi.');
        }

        if (passwords.newPassword.length < 6) {
            return alertService.error('Oops', 'Password baru minimal 6 karakter.');
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            return alertService.error('Oops', 'Konfirmasi password tidak cocok dengan password baru.');
        }

        setIsSavingPassword(true);
        try {
            await updatePassword({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });

            alertService.success('Berhasil!', 'Password akun Anda berhasil diubah.');
            // Kosongkan form password setelah berhasil
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal mengubah password.';
            alertService.error('Gagal!', errorMsg);
        } finally {
            setIsSavingPassword(false);
        }
    };

    // Jika user belum termuat dari Context
    if (!user) return <div className="p-8 text-center text-slate-500">Memuat profil...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-slate-50/50 rounded-xl">
            {/* Header Halaman */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Profil Pengguna</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Kolom Kiri: Kartu Profil */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Header Gradien */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative"></div>
                        
                        <div className="px-6 pb-8 relative flex flex-col items-center">
                            
                            {/* Avatar (Clickable untuk upload) */}
                            <div className="relative -top-14 group cursor-pointer" onClick={handlePhotoClick}>
                                <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-blue-600 uppercase">
                                            {user.username.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Overlay Kamera Saat Hover */}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={28} className="text-white" />
                                </div>
                                
                                {/* Input File Hidden */}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            
                            {/* Info User */}
                            <div className="mt-[-2rem] text-center w-full">
                                <h2 className="text-xl font-bold text-slate-800">{user.username}</h2>
                                <p className="text-slate-500 text-sm mt-1 mb-5">Nomor Induk: {user.nid}</p>
                                
                                <div className="flex justify-center">
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                        user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        user.role === 'mandor' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                        Role: {user.role}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-4">*Klik foto untuk mengubah avatar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Form Pengaturan */}
                <div className="md:col-span-2 space-y-6">
                    {/* Form Edit Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Save size={20} className="text-blue-500"/>
                            Informasi Akun
                        </h3>
                        <form onSubmit={handleSaveInfo}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">NID (Read-Only)</label>
                                    <input 
                                        type="text" 
                                        value={user.nid || ''} 
                                        disabled
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Role (Read-Only)</label>
                                    <input 
                                        type="text" 
                                        value={(user.role || '').toUpperCase()} 
                                        disabled
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                                <input 
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">No. Telepon / WhatsApp</label>
                                <input 
                                    type="text" 
                                    name="no_telp"
                                    value={formData.no_telp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSavingProfile}
                                    className={`text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-colors ${
                                        isSavingProfile ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Form Ubah Password */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <KeyRound size={20} className="text-slate-600"/>
                            Ubah Password
                        </h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Lama</label>
                                <input 
                                    type="password"
                                    name="oldPassword"
                                    value={passwords.oldPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Masukkan password lama..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Masukkan password baru..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Ulangi password baru..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSavingPassword}
                                    className={`text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-colors ${
                                        isSavingPassword ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900'
                                    }`}
                                >
                                    {isSavingPassword ? 'Memproses...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}