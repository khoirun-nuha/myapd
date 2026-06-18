import React, { useState, useEffect } from 'react';

export const ApdModal = ({ isOpen, onClose, onSubmit, apd }) => {
    const [formData, setFormData] = useState({ name: '', stock: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (apd) {
            setFormData(apd);
        } else {
            setFormData({ name: '', stock: '' });
        }
        setErrors({});
    }, [apd, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Nama APD wajib diisi';
        
        if (formData.stock === '' || formData.stock === null) {
            newErrors.stock = 'stock wajib diisi';
        } else if (isNaN(formData.stock) || Number(formData.stock) < 0) {
            newErrors.stock = 'stock harus berupa angka positif';
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
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {apd ? 'Edit Data APD' : 'Tambah APD Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama APD</label>
                        <input
                            type="text"
                            placeholder="Contoh: Helm Proyek"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.name ? 'border-rose-500' : 'border-gray-300'}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">stock (Unit)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.stock ? 'border-rose-500' : 'border-gray-300'}`}
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                        {errors.stock && <p className="text-rose-500 text-xs mt-1">{errors.stock}</p>}
                    </div>

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
                            {apd ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};