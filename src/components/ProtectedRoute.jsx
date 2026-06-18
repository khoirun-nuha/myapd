import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  // 1. CEGAH HALAMAN PUTIH / KEDIP: Tunggu sampai data user selesai dicek
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Memuat data...</h2>
      </div>
    );
  }

  // 2. JIKA BELUM LOGIN: Lempar ke halaman login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. JIKA ROLE TIDAK SESUAI: Arahkan ke dashboard masing-masing
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRedirects = {
      admin: '/k3',
      karyawan: '/karyawan/dashboard',
      mandor: '/mandor',
    };
    
    // Jangan redirect jika user kebetulan sudah di tempat yang benar
    const targetRoute = roleRedirects[user.role] || '/login';
    if (location.pathname === targetRoute) {
      return children;
    }

    return <Navigate to={targetRoute} replace />;
  }

  // 4. JIKA SEMUA AMAN: Tampilkan halaman yang diminta
  return children;
};