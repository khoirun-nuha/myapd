import api from './api';

export const getAllReports = async (params = {}) => {
  const response = await api.get('/api/transactions', { params });
  return response.data;
};

export const getMyReports = async (params = {}) => {
  // Gunakan endpoint yang sama. Backend akan otomatis memfilter
  // data sesuai role karyawan dari token JWT yang dikirim
  const response = await api.get('/api/transactions', { params });
  return response.data;
};

export const createReport = async (formDataPayload) => {
  // Axios akan otomatis mengatur header multipart/form-data beserta boundary-nya
  const response = await api.post('/api/transactions', formDataPayload);
  return response.data;
};

// Tambahkan fungsi ini di dalam reportService.js
export const updateReportStatusAdmin = async (id, status) => {
  // payload: { status: 'approved' }
  const response = await api.put(`/api/transactions/${id}/status`, { status });
  return response.data;
};

export const reportService = {
  getAllReports,
  getMyReports,
  createReport,
  updateReportStatusAdmin,
};