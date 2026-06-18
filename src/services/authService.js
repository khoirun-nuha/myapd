import api from './api';

// HANYA simpan data profil user, token tidak lagi disimpan di sini
export const saveAuthData = (payload) => {
  localStorage.setItem('userPayload', JSON.stringify(payload));
};

// getToken kita biarkan return null agar tidak error jika ada file lama yang masih memanggilnya
export const getToken = () => {
  return null; 
};

export const getPayload = () => {
  const payloadString = localStorage.getItem('userPayload');
  try {
    return payloadString ? JSON.parse(payloadString) : null;
  } catch (error) {
    console.error("Gagal melakukan parse payload dari localStorage", error);
    return null;
  }
};

export const clearAuthData = () => {
  // Hanya menghapus payload user (cookie token akan dihapus otomatis oleh backend saat logout)
  localStorage.removeItem('userPayload');
};

export const updateProfile = async (formData) => {
  // Path disesuaikan dengan app.js backend-mu
  const response = await api.put('/api/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data; 
};

export const updatePassword = async (payload) => {
  // Path disesuaikan dengan app.js backend-mu
  const response = await api.put('/api/password', payload);
  return response.data;
};