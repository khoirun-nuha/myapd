import React, { useState, useEffect } from 'react';
import { UserModal } from '../../components/modal/UserModal';
import { alertService } from '../../services/notifService';
import { userService } from '../../services/usersService';
import WhatsAppButton from '../../components/WhatsAppButton';

export default function K3User() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const handleAddClick = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (Number(id) === 1) {
            alertService.error('Aksi Ditolak!', 'Admin Utama (ID: 1) secara sistem mutlak tidak boleh dihapus.');
            return;
        }

        alertService.confirmDelete().then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await userService.deleteUser(id);
                    setUsers(users.filter((user) => user.id !== id));
                    alertService.success('Terhapus!', 'User telah berhasil dihapus dari sistem.');
                } catch (error) {
                    alertService.error('Gagal Menghapus!', error.message || 'Terjadi kesalahan pada server.');
                }
            }
        });
    };

    const handleModalSubmit = async (formData) => {
        const cleanedData = {
            nid: formData.nid.trim(),
            // Label di UI adalah Nama Lengkap, tapi property API kita tetap gunakan username (sesuaikan jika di DB sudah diubah)
            username: formData.username.trim(), 
            password: formData.password ? formData.password.trim() : '',
            role: formData.role.trim(),
            no_telp: formData.no_telp ? formData.no_telp.trim() : '',
        };

        if (currentUser && Number(currentUser.id) === 1) {
            if (cleanedData.role !== 'admin') {
                alertService.error('Aksi Ditolak!', 'Role untuk Admin Utama tidak boleh diubah menjadi apapun.');
                return;
            }
        }

        if (currentUser) {
            try {
                const result = await userService.updateUser(currentUser.id, cleanedData);
                setUsers(users.map((u) => (u.id === currentUser.id ? { ...u, ...result.data } : u)));
                alertService.success('Berhasil!', 'Data user berhasil diperbarui.');
                setIsModalOpen(false);
            } catch (error) {
                // error.message akan menangkap pesan dari backend jika NID/No Telp duplikat
                alertService.error('Gagal Memperbarui!', error.message || 'Terjadi kesalahan.');
            }
        } else {
            try {
                const result = await userService.createUser(cleanedData);
                setUsers([...users, result.data]);
                alertService.success('Berhasil!', 'User baru berhasil ditambahkan.');
                setIsModalOpen(false);
            } catch (error) {
                // error.message akan menangkap pesan dari backend jika NID/No Telp duplikat
                alertService.error('Gagal Menambahkan!', error.message || 'Terjadi kesalahan.');
            }
        }
    };

    const filteredUsers = users.filter((user) => {
        const fullName = user.username ? user.username.toLowerCase() : '';
        const nid = user.nid ? user.nid : '';
        const noTelp = user.no_telp ? user.no_telp : '';

        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            nid.includes(searchQuery) ||
            noTelp.includes(searchQuery);

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-3 max-w-8xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data NID, Nama Lengkap, No. Telepon, dan Hak Akses.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                    + Tambah User
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama Lengkap, NID, atau No. Telp..."
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-4 font-semibold">NID</th>
                            <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                            <th className="px-6 py-4 font-semibold">No. Telepon</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold ">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memuat data user...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.nid}</td>
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.no_telp || <span className="text-gray-400 italic text-xs">Belum diisi</span>}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            user.role === 'mandor' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-1">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {Number(user.id) === 1 ? (
                                            <span className="p-2 text-gray-400 inline-flex items-center" title="Data dilindungi">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="p-2 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center">
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

                {/* Pagination */}
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
                                        className={`w-9 h-9 border rounded-md font-medium transition-all ${currentPage === pageNumber
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
            
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                user={currentUser}
            />
        </div>
    );
}