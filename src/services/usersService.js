import api from './api';

export const userService = {
    getUsers: async () => {
        try {
            const response = await api.get('/api/users');
            return response.data;
        } catch (error) {
            // Tangkap pesan error spesifik dari backend, atau gunakan pesan default
            const message = error.response?.data?.message || error.message || "Gagal mengambil data user";
            throw new Error(message);
        }
    },
    createUser: async (userData) => {
        try {
            const payload = {
                ...userData,
                role: userData.role ? userData.role.toLowerCase() : 'karyawan'
            };

            const response = await api.post('/api/users', payload);
            return response.data;
        } catch (error) {
            // Tangkap pesan error spesifik dari backend (misal: duplikat NID/No Telp)
            const message = error.response?.data?.message || error.message || "Gagal menambahkan data user";
            throw new Error(message);
        }
    },
    updateUser: async (id, userData) => {
        try {
            const payload = { ...userData };

            if (payload.role) {
                payload.role = payload.role.toLowerCase();
            }

            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }

            const response = await api.put(`/api/users/${id}`, payload);
            return response.data;
        } catch (error) {
            // Tangkap pesan error spesifik dari backend
            const message = error.response?.data?.message || error.message || "Gagal memperbarui data user";
            throw new Error(message);
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Gagal menghapus user";
            throw new Error(message);
        }
    }
};