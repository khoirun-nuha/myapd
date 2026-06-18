import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPayload, saveAuthData } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inisialisasi langsung dari getPayload() untuk mencegah jeda (race condition)
  const [user, setUser] = useState(() => getPayload());
  
  // TAMBAHAN BARU: State loading untuk mencegah halaman putih / kedip
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Karena kita mengambil data user secara sinkronus dari localStorage (getPayload),
    // kita bisa langsung mematikan status loading setelah render pertama selesai.
    // (Jika ke depannya kamu memanggil API /api/profile di sini, set false-nya setelah API selesai)
    setLoading(false);
  }, []);

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser); 
    saveAuthData(updatedUser); // Hanya menyimpan payload
  };

  return (
    // TAMBAHKAN 'loading' KE DALAM VALUE PROVIDER
    <AuthContext.Provider value={{ user, setUser, updateUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);