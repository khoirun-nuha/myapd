import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, LockKeyhole, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { saveAuthData } from '../services/authService';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT USEAUTH DI SINI

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // <-- 2. PANGGIL SETUSER DARI CONTEXT
  
  const [formData, setFormData] = useState({ nid: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Filter khusus NID: Hanya izinkan angka (0-9)
    if (name === 'nid') {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nid.trim() || !formData.password.trim()) {
      setError('NID dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/login', {
        nid: formData.nid,
        password: formData.password
      });
      
      const data = response.data.data;
      
      saveAuthData(data.user); // Simpan ke localStorage untuk backup
      setUser(data.user); // <-- 3. UPDATE CONTEXT AGAR ROUTE LANGSUNG MERESPONS

      const roleRedirects = {
        admin: '/k3',
        karyawan: '/karyawan/dashboard',
        mandor: '/mandor',
      };

      navigate(roleRedirects[data.user.role] || '/login', { replace: true });

    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Akses ditolak. NID atau Password salah.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // KONSEP SPLIT: KIRI WARNA SIDEBAR (GELAP) + KANAN WARNA DASHBOARD (PUTIH)
    <div className="min-h-screen flex font-sans antialiased">
      
      {/* ---------------- SISI KIRI: VISUAL & BRANDING (WARNA GELAP SIDEBAR - SLATE-950) ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        
        {/* Pattern grid tipis khas Sidebar */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content Centered */}
        <div className="z-10 text-center flex flex-col items-center max-w-lg">
          {/* Logo Brand */}
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/50 mb-6 text-white flex items-center justify-center">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Sistem <span className="text-blue-500">K3 Terpadu</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Portal resmi pelaporan, pemantauan, dan manajemen Alat Pelindung Diri untuk mewujudkan lingkungan kerja Zero Accident.
          </p>

          {/* Kotak Info bergaya Gelap */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 text-left w-full shadow-inner">
             <div className='bg-slate-800 p-2.5 rounded-xl text-blue-400 border border-slate-700/50 shrink-0'>
               <ShieldCheck size={20}/>
             </div>
             <p className='text-sm text-slate-400 font-medium leading-relaxed'>
               Portal ini terintegrasi dengan data pegawai. Pastikan kredensial Anda aman dan tidak dibagikan kepada siapa pun.
             </p>
          </div>
        </div>
      </div>

      {/* ---------------- SISI KANAN: FORM LOGIN (WARNA PUTIH DASHBOARD) ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
        
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Form */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Logo Mobile (Hanya muncul kalau dibuka di HP) */}
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 bg-slate-950 rounded-2xl shadow-lg mb-5 text-white">
               <ShieldCheck size={28}/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Masuk Akun</h2>
            <p className="text-slate-500 text-sm mt-2">Silakan masukkan NID dan Password Anda.</p>
          </div>

          {/* Error Alert Terang */}
          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl shadow-sm animate-[fadeIn_0.3s_ease]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong className='block font-bold text-rose-800 mb-0.5'>Gagal Masuk</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* NID Field */}
            <div className="space-y-2">
              <label htmlFor="nid" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Nomor Induk (NID)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  id="nid"
                  name="nid"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="Masukkan NID Anda"
                  value={formData.nid}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <LockKeyhole size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* TEKS INFO LUPA PASSWORD DI BAWAH INPUT */}
              <p className="text-[11px] text-slate-500 text-right mt-1.5">
                Lupa password? <span className="font-semibold text-slate-700">Hubungi Admin</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20
                         transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                         focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2
                         flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 text-white" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          {/* Footer Area Form */}
          <div className="pt-6 text-center">
             <p className="text-slate-400 text-[11px] tracking-wide">
               &copy; {new Date().getFullYear()} <span className='font-semibold text-slate-500'>My APD</span> &mdash; V1.0 Internal System
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;