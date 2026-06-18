import Swal from 'sweetalert2';

export const alertService = {
  // Konfirmasi Hapus
  confirmDelete: (title = 'Apakah Anda yakin?', text = 'Data yang dihapus tidak dapat dikembalikan!') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', // Warna biru utama
      cancelButtonColor: '#d33',    // Warna merah batal
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl', // Menjaga konsistensi kelengkungan border
      }
    });
  },

  // Notifikasi Sukses
  success: (title = 'Berhasil!', text = 'Aksi berhasil dilakukan.') => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      customClass: {
        popup: 'rounded-xl',
      }
    });
  },

  // Notifikasi Gagal/Error (Opsional jika nanti butuh)
  error: (title = 'Gagal!', text = 'Terjadi kesalahan sistem.') => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#3085d6',
      customClass: {
        popup: 'rounded-xl',
      }
    });
  },
  confirm: (title = 'Apakah Anda yakin?', text = 'Pastikan tindakan ini benar!', confirmButtonText = 'Ya, lanjutkan!') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // Warna merah rose untuk aksi krusial seperti logout
      cancelButtonColor: '#94a3b8',  // Warna abu-abu untuk batal
      confirmButtonText,
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl',
      }
    });
  }
};