/**
 * StatusBadge - Badge warna untuk status laporan APD
 * @param {string} status - 'pending' | 'approved' | 'rejected'
 */
const STATUS_MAP = {
  pending: {
    label: 'Menunggu',
    className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-400',
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-400',
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
