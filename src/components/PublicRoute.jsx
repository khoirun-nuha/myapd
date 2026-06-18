import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Import ini

export const PublicRoute = ({ children }) => {
  const { user } = useAuth(); // <-- Ambil user dari Context

  if (user) {
    const roleRedirects = {
      admin: '/k3',
      karyawan: '/karyawan/dashboard',
      mandor: '/mandor', // Sesuaikan dengan rute di app.jsx
    };

    return (
      <Navigate
        to={roleRedirects[user.role] || '/'}
        replace
      />
    );
  }

  return children;
};