import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE,
  // withCredentials: true, // enable if your backend uses cookie-based auth
});

// Attach Bearer token if present in localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore errors reading storage in some environments
  }
  return config;
});

// Lấy tất cả mẫu xe (models)
export const getCars = (params) => api.get('/products/models', { params }).then((r) => r.data);
export const getCar = (id) => api.get(`/cars/${id}`).then((r) => r.data);
// Nếu backend có API so sánh, thay đổi endpoint cho đúng. Nếu chưa có, tạm thời trả về các model đã chọn.
export const compareCars = async (idsArray) => {
  // Lấy chi tiết từng model để so sánh
  const promises = idsArray.map(id => api.get(`/products/models/${id}`).then(r => r.data));
  return Promise.all(promises);
};

export default api;
