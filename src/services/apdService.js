import api from './api';

export const apdService = {
    getApds: async ({ page = 1, limit = 10 } = {}) => {
        try {
            const response = await api.get('/api/apd', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error("Gagal mengambil data APD");
        }
    },

    getApdById: async (id) => {
        try {
            const response = await api.get(`/api/apd/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error("Gagal mengambil detail APD");
        }
    },

    createApd: async (apdData) => {
        try {
            const { name, stock, description } = apdData;

            // Validasi frontend
            if (!name || name.trim() === '') throw new Error("Nama APD wajib diisi");
            if (stock === undefined || stock === '') throw new Error("Stok wajib diisi");
            if (isNaN(Number(stock)) || Number(stock) < 0) throw new Error("Stok harus berupa angka positif");

            const payload = {
                name: name.trim(),
                stock: Number(stock),
                description: description ? description.trim() : undefined,
            };

            const response = await api.post('/api/apd', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateApd: async (id, apdData) => {
        try {
            const { name, stock, description } = apdData;

            // Validasi frontend
            if (name !== undefined && name.trim() === '') throw new Error("Nama APD tidak boleh kosong");
            if (stock !== undefined) {
                if (isNaN(Number(stock)) || Number(stock) < 0) throw new Error("Stok harus berupa angka positif");
            }

            const payload = {};
            if (name !== undefined) payload.name = name.trim();
            if (stock !== undefined) payload.stock = Number(stock);
            if (description !== undefined) payload.description = description.trim();

            const response = await api.put(`/api/apd/${id}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteApd: async (id) => {
        try {
            const response = await api.delete(`/api/apd/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || new Error("Gagal menghapus APD");
        }
    }
};