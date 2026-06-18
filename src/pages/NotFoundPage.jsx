// import { useNavigate } from 'react-router-dom';
// // import { isAuthenticated, getCurrentUser } from '../services/authService';

// const NotFoundPage = () => {
//   const navigate = useNavigate();
//   const user = getCurrentUser();

//   const handleBack = () => {
//     if (isAuthenticated() && user?.role) {
//       const roleRedirects = {
//         k3: '/k3',
//         karyawan: '/dashboard/karyawan',
//         mandor: '/dashboard/mandor',
//       };
//       navigate(roleRedirects[user.role]);
//     } else {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center px-4">
//       <div className="text-center">
//         <div className="text-9xl font-black text-white/10 leading-none select-none">404</div>
//         <div className="text-5xl -mt-8 mb-4">🪖</div>
//         <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
//         <p className="text-blue-300/70 text-sm mb-8">
//           Halaman yang Anda cari tidak ada atau telah dipindahkan.
//         </p>
//         <button
//           onClick={handleBack}
//           className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
//         >
//           Kembali ke Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NotFoundPage;
