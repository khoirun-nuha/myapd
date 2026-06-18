import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/notifService';
import { userService } from '../../services/usersService';
import WhatsAppButton from '../../components/WhatsAppButton';

export default function MandorUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // --- 1. STATE UNTUK PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Jumlah data per halaman (bisa diubah sesuai kebutuhan)

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- 2. RESET KE HALAMAN 1 JIKA USER FILTER/SEARCH DATA ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterRole]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const result = await userService.getUsers();
            setUsers(result.data || []);
        } catch (error) {
            alertService.error('Gagal Memuat Data!', error.message || 'Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };
    console.log(users);

    // --- 3. PROSES FILTER DATA USER ---
    const filteredUsers = users.filter((user) => {
        const username = user.username ? user.username.toLowerCase() : '';
        const nid = user.nid ? user.nid : '';

        const matchesSearch = username.includes(searchQuery.toLowerCase()) || nid.includes(searchQuery);
        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    // --- 4. LOGIKA MATEMATIKA PAGINATION ---
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Data inilah yang akan di-looping di dalam tag <tbody>
    const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-3 max-w-8xl mx-auto min-h-screen">
            {/* Header Halaman */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data NID, Nama lengkap, dan Hak Akses.</p>
                </div>
            </div>

            {/* Baris Filter & Pencarian */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Username atau NID..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">Semua Role</option>
                        <option value="karyawan">Karyawan</option>
                        <option value="admin">Admin</option>
                        <option value="mandor">Mandor</option>
                    </select>
                </div>
            </div>

            {/* Tabel Data Wrapper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-4 font-semibold">NID</th>
                            <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Nomer Telepon</th>
                            <th className="px-6 py-4 font-semibold ">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memuat data user...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedUsers.length > 0 ? (
                            // Gunakan paginatedUsers hasil slice di sini
                            paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nid}</td>
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            user.role === 'mandor' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{(user.no_telp)? user.no_telp : '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className=" p-2 flex ">

                                            <WhatsAppButton phoneNumber={user.no_telp} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                                    Tidak ada data user yang tersedia.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* --- 5. KOMPONEN BAR PAGINATION (TAILWIND ONLY) --- */}
                {!isLoading && totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-sm text-gray-600">
                        <div>
                            Menampilkan <span className="font-semibold text-gray-800">{indexOfFirstItem + 1}</span> sampai{' '}
                            <span className="font-semibold text-gray-800">
                                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
                            </span>{' '}
                            dari <span className="font-semibold text-gray-800">{totalItems}</span> data
                        </div>

                        <div className="flex items-center gap-1.5">
                            {/* Tombol Previous */}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                            >
                                Sebelumnya
                            </button>

                            {/* Looping Angka Halaman */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-9 h-9 border rounded-md font-medium transition-all ${currentPage === pageNumber
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            {/* Tombol Next */}
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
        </div>
    );
};