import React, { useState, useEffect } from 'react';
import { ApdModal } from '../../components/modal/AppModal';
import { alertService } from '../../services/notifService';
import { apdService } from '../../services/apdService';
import { getPayload } from '../../services/authService';

export default function ApdPage() {
    const [apds, setApds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentApd, setCurrentApd] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKondisi, setFilterKondisi] = useState('all');

    // Mengambil data user yang sedang login
    const currentUserPayload = getPayload();

    // State Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        fetchApds();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchApds = async () => {
        try {
            setIsLoading(true);
            const result = await apdService.getApds();
            setApds(result.data || []);
        } catch (error) {
            alertService.error('Gagal Memuat Data!', error.message || 'Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setCurrentApd(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (apd) => {
        setCurrentApd(apd);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        alertService.confirmDelete().then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apdService.deleteApd(id);
                    setApds(apds.filter((apd) => apd.id !== id));
                    alertService.success('Terhapus!', 'Data APD berhasil dihapus dari sistem.');
                } catch (error) {
                    alertService.error('Gagal Menghapus!', error.message || 'Terjadi kesalahan pada server.');
                }
            }
        });
    };

    const handleModalSubmit = async (formData) => {
        const cleanedData = {
            name: formData.name.trim(),
            stock: Number(formData.stock),
        };

        if (currentApd) {
            try {
                const result = await apdService.updateApd(currentApd.id, cleanedData);
                setApds(apds.map((a) => (a.id === currentApd.id ? { ...a, ...result.data } : a)));
                alertService.success('Berhasil!', 'Data APD berhasil diperbarui.');
                setIsModalOpen(false);
            } catch (error) {
                alertService.error('Gagal Memperbarui!', error.message || 'Terjadi kesalahan.');
            }
        } else {
            try {
                const result = await apdService.createApd(cleanedData);
                setApds([...apds, result.data]);
                alertService.success('Berhasil!', 'APD baru berhasil ditambahkan.');
                setIsModalOpen(false);
            } catch (error) {
                alertService.error('Gagal Menambahkan!', error.message || 'Terjadi kesalahan.');
            }
        }
    };

    // Filter Data APD (SUDAH DIPERBAIKI)
    const filteredApds = apds.filter((apd) => {
        const nama = apd.name ? apd.name.toLowerCase() : '';

        // Kita tangkap 'kode' atau 'code' dari backend dengan aman
        const kodeApd = apd.kode ? String(apd.kode).toLowerCase() : (apd.code ? String(apd.code).toLowerCase() : '');
        const query = searchQuery.toLowerCase();

        const matchesSearch = nama.includes(query) || kodeApd.includes(query);

        return matchesSearch;
    });

    // Pagination Logic
    const totalItems = filteredApds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedApds = filteredApds.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-3 max-w-8xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen APD</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola inventaris Alat Pelindung Diri.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                    + Tambah APD
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Nama atau Kode APD..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nama APD</th>
                            <th className="px-6 py-4 font-semibold">Stok</th>
                            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memuat data APD...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedApds.length > 0 ? (
                            paginatedApds.map((apd) => (
                                <tr key={apd.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">{apd.name}</td>
                                    <td className="px-6 py-4">{apd.stock}  unit</td>
                                    <td className="px-6 py-4 text-right space-x-1">
                                        <button
                                            onClick={() => handleEditClick(apd)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(apd.id)}
                                            className="p-2 text-red-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-400 font-medium">
                                    Tidak ada data APD yang tersedia.
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
                                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 transition-colors"
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
                                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 transition-colors"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ApdModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                apd={currentApd}
            />
        </div>
    );
};