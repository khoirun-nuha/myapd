import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Context
import AppLayout from './components/AppLayout';
import { AuthProvider } from './context/AuthContext'; 

// Auth
import LoginPage from './pages/LoginPage';

// Karyawan Mobile
import KaryawanDashboard from './pages/karyawan/KaryawanDashboard';
import KaryawanRiwayat from './pages/karyawan/KaryawanRiwayat';
import KaryawanProfil from './pages/karyawan/KaryawanProfil';

// Admin K3
import ProfilPage from './pages/ProfilPage';
import K3Dashboard from './pages/k3/K3Dashboard';
import K3User from './pages/k3/K3User';
import ApdPage from './pages/k3/ApdPage';
import LaporanPage from './pages/k3/LaporanPage';
import Riwayat from './pages/Riwayat';

// Mandor
import MandorDashboard from './pages/mandor/MandorDashboard';
import MandorUsers from './pages/mandor/MandorUsers';
import MandorApd from './pages/mandor/MandorApd';

// Route Guard
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Redirect Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* --- PERBAIKAN 1: Redirect URL nanggung --- */}
          <Route path="/karyawan" element={<Navigate to="/karyawan/dashboard" replace />} />

          {/* Login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Mobile Karyawan (Tanpa AppLayout) */}
          <Route
            path="/karyawan/dashboard"
            element={
              <ProtectedRoute allowedRoles={['karyawan']}>
                <KaryawanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/karyawan/riwayat"
            element={
              <ProtectedRoute allowedRoles={['karyawan']}>
                <KaryawanRiwayat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/karyawan/profil"
            element={
              <ProtectedRoute allowedRoles={['karyawan']}>
                <KaryawanProfil />
              </ProtectedRoute>
            }
          />

          {/* Route yang memakai Layout (Sidebar/Navbar) */}
          <Route element={<AppLayout />}>

            {/* Admin K3 */}
            <Route 
              path="/k3/profil" 
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProfilPage />
              </ProtectedRoute>
            }/>
            <Route
              path="/k3"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <K3Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/k3/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <K3User />
                </ProtectedRoute>
              }
            />
            <Route
              path="/k3/apd"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ApdPage />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/k3/laporan" 
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LaporanPage />
              </ProtectedRoute>
            }/>

            <Route 
              path="/k3/riwayat" 
              element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Riwayat  />
              </ProtectedRoute>
            }/>

            {/* MANDOR */}
            <Route
              path="/mandor"
              element={
                <ProtectedRoute allowedRoles={['mandor']}>
                  <MandorDashboard  />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/mandor/users"
              element={
                <ProtectedRoute allowedRoles={['mandor']}>
                  <MandorUsers  />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/mandor/profil" 
              element={
              <ProtectedRoute allowedRoles={['mandor']}>
                <ProfilPage />
              </ProtectedRoute>
            }/>

            <Route
              path="/mandor/apd"
              element={
                <ProtectedRoute allowedRoles={['mandor']}>
                  <MandorApd  />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/mandor/riwayat" 
              element={
              <ProtectedRoute allowedRoles={['mandor']}>
                <Riwayat />
              </ProtectedRoute>
            }/>

          </Route>

          {/* --- PERBAIKAN 2: Catch-All Route (Mencegah Halaman Putih) --- */}
          {/* Jika ada URL yang diketik ngawur (misal /karyawannn atau /mandor/xyz), kembalikan ke sistem utama */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;