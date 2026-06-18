import React, { useState, useEffect } from 'react';

export const UserModal = ({ isOpen, onClose, onSubmit, user }) => {
    // Tambahkan no_telp ke dalam state awal form
    const [formData, setFormData] = useState({ nid: '', username: '', password: '', role: 'karyawan', no_telp: '' });
    const [errors, setErrors] = useState({}); // State untuk menyimpan error validasi

    useEffect(() => {
        if (user) {
            // Memastikan data lama no_telp ikut dimuat saat mode Edit
            setFormData({ ...user, password: '', no_telp: user.no_telp || '' });
        } else {
            setFormData({ nid: '', username: '', password: '', role: 'karyawan', no_telp: '' });
        }
        setErrors({}); // Reset error setiap kali modal dibuka/ganti mode
    }, [user, isOpen]);

    // Fungsi Validasi Form
    const validateForm = () => {
        const newErrors = {};
        const isSpecialUser = user && user.id === 1;

        // 1. Validasi NID
        const nidValue = formData.nid ? String(formData.nid).trim() : '';
        if (!nidValue) {
            newErrors.nid = 'NID wajib diisi';
        } else if (!isSpecialUser && !/^\d+$/.test(nidValue)) {
            newErrors.nid = 'NID harus berupa angka';
        }

        // 2. Validasi Nama Lengkap (Username)
        const usernameValue = formData.username ? String(formData.username).trim() : '';
        if (!usernameValue) {
            newErrors.username = 'Nama Lengkap wajib diisi';
        } else if (usernameValue.length < 4) {
            newErrors.username = 'Nama Lengkap minimal harus 4 karakter';
        }

        // 3. Validasi Password
        const passwordValue = formData.password ? String(formData.password).trim() : '';
        if (!user && !passwordValue) {
            newErrors.password = 'Password wajib diisi';
        } else if (passwordValue && passwordValue.length < 6) {
            newErrors.password = 'Password minimal harus 6 karakter';
        }

        // 4. Validasi No. Telepon
        const noTelpValue = formData.no_telp ? String(formData.no_telp).trim() : '';
        if (!noTelpValue) {
            newErrors.no_telp = 'No. Telepon wajib diisi';
        } else if (!/^\d+$/.test(noTelpValue)) {
            newErrors.no_telp = 'No. Telepon harus berupa angka';
        } else if (noTelpValue.length < 10) {
            newErrors.no_telp = 'No. Telepon minimal harus 10 digit';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div
                className={`relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
                    }`}
            >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {user ? 'Edit Data User' : 'Tambah User Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* NID */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">NID</label>
                        <input
                            type="text"
                            placeholder="Masukkan NID"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.nid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-300 focus:border-blue-500'
                                }`}
                            value={formData.nid}
                            // replace(/\D/g, '') akan langsung menghapus huruf jika user mencoba mengetiknya
                            onChange={(e) => setFormData({ ...formData, nid: e.target.value.replace(/\D/g, '') })}
                        />
                        {errors.nid && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.nid}</p>}
                    </div>

                    {/* Nama Lengkap (menggunakan field username) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.username ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-300 focus:border-blue-500'
                                }`}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        {errors.username && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.username}</p>}
                    </div>

                    {/* No. Telepon */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon</label>
                        <input
                            type="text"
                            placeholder="Masukkan No. Telepon (contoh: 0812345678)"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.no_telp ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-300 focus:border-blue-500'
                                }`}
                            value={formData.no_telp}
                            // replace(/\D/g, '') memaksa input hanya menerima angka
                            onChange={(e) => setFormData({ ...formData, no_telp: e.target.value.replace(/\D/g, '') })}
                        />
                        {errors.no_telp && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.no_telp}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {user ? 'Password (Kosongkan jika tidak diganti)' : 'Password'}
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-300 focus:border-blue-500'
                                }`}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password}</p>}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                        <div className="relative">
                            <select
                                disabled={user && user.id === 1}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="karyawan">Karyawan</option>
                                <option value="admin">Admin</option>
                                <option value="mandor">Mandor</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {user && user.id === 1 && (
                            <p className="text-amber-600 text-xs mt-1 font-medium flex items-center gap-1">
                                ⚠️ Role untuk Utama Admin tidak dapat diubah.
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {user ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};