import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ phoneNumber }) {
  // Fungsi untuk memformat nomor telepon agar sesuai standar WhatsApp (wa.me)
  const formatWhatsAppNumber = (number) => {
    if (!number) return null;
    
    // Hapus karakter selain angka
    let formatted = number.replace(/\D/g, "");

    // Jika diawali 0, ubah menjadi kode negara 62
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.substring(1);
    }

    return formatted;
  };

  const waNumber = formatWhatsAppNumber(phoneNumber);

  // Jika nomor kosong atau tidak valid, tampilkan tombol non-aktif (disabled)
  if (!waNumber) {
    return (
      <button
        disabled
        title="Nomor WhatsApp tidak tersedia"
        className="flex items-center gap-2 p-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
      >
        <MessageCircle size={18} />
      </button>
    );
  }

  // Jika nomor tersedia, tampilkan tautan ke WhatsApp
  return (
    <a
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Hubungi via WhatsApp"
      className="flex items-center gap-2 p-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
    >
      <MessageCircle size={18} />
    </a>
  );
}