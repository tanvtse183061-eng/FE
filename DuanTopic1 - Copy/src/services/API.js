import axios from 'axios';

// Lấy base URL từ .env hoặc mặc định localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:8080/api/public';

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const publicApi = axios.create({
  baseURL: PUBLIC_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== INTERCEPTORS ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isValidToken =
      typeof token === 'string' &&
      token !== 'null' &&
      token !== 'undefined' &&
      token.trim() !== '';

    if (isValidToken && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc sai
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validate: () => api.post('/auth/validate'),
  logout: () => api.post('/auth/logout'),
};

// ==================== CUSTOMER API ====================
export const customerAPI = {
  getCustomers: () => api.get('/customers'),
  getCustomer: (id) => api.get(`/customers/${id}`),
  getCustomerByEmail: (email) => api.get(`/customers/email/${email}`),
  getCustomerByPhone: (phone) => api.get(`/customers/phone/${phone}`),
  searchCustomers: (name) => api.get(`/customers/search?name=${name}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// ==================== VEHICLE API ====================
export const vehicleAPI = {
   getBrands: () => api.get("/vehicles/brands"),
  createBrand: (data) => api.post("/vehicles/brands", data),
  updateBrand: (id, data) => api.put(`/vehicles/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/vehicles/brands/${id}`),
//---------------------Models-----------------------------//
   getModels: () => api.get('/vehicles/models'),
  getModel: (id) => api.get(`/vehicles/models/${id}`),
  searchModels: (q) => api.get(`/vehicles/models/search?name=${q}`),
  createModel: (data) => api.post("/vehicles/models", data),
  updateModel: (id, data) => api.put(`/vehicles/models/${id}`, data),
  deleteModel: (id) => api.delete(`/vehicles/models/${id}`),

  getVariants: () => api.get("/vehicles/variants"),
  searchVariants: (q) => api.get(`/vehicles/variants/search?name=${q}`),
  createVariant: (data) => api.post("/vehicles/variants", data),
  updateVariant: (id, data) => api.put(`/vehicles/variants/${id}`, data),
  deleteVariant: (id) => api.delete(`/vehicles/variants/${id}`),

  getColors: () => api.get("/vehicles/colors"),
  searchColors: (q) => api.get(`/vehicles/colors/search?name=${q}`),
  createColor: (data) => api.post("/vehicles/colors", data),
  updateColor: (id, data) => api.put(`/vehicles/colors/${id}`, data),
  deleteColor: (id) => api.delete(`/vehicles/colors/${id}`),
  createFullVehicle: (data) =>
    api.post('/vehicle-creation/create-full-vehicle', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ==================== ORDER API ====================
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// ==================== WAREHOUSE API ====================
export const warehouseAPI = {
  getWarehouses: () => api.get('/warehouses'),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
};

// ==================== PUBLIC API ====================
export const publicVehicleAPI = {
  getBrands: () => api.get('/vehicle/brands'),
  getModels: () => api.get('/vehicle/models'),
  getVariants: () => api.get('/vehicle/variants'),
  getColors: () => api.get('/vehicle/colors'),
  getWarehouses: () => api.get('/warehouses'), 
};
//===================DEALERS============================
export const dealerAPI = {
  getAll: () => api.get("/dealers"),
  search: (keyword) => api.get(`/dealers/search?keyword=${keyword}`),
  create: (data) => api.post("/dealers", data),
  update: (id, data) => api.put(`/dealers/${id}`, data),
  delete: (id) => api.delete(`/dealers/${id}`),
};
//==================VEHICLE-INCENTORY======================//
export const inventoryAPI = {
  getInventory: () => api.get('/vehicle-inventory'),
  getInventoryById: (id) => api.get(`/vehicle-inventory/${id}`),
  getInventoryByVin: (vin) => api.get(`/vehicle-inventory/vin/${vin}`),
  getAllStatuses: () => api.get('/vehicle-inventory/statuses'),
  getStatusSummary: () => api.get('/vehicle-inventory/status-summary'),
  normalizeAllStatuses: () => api.post('/vehicle-inventory/normalize-statuses'),
  getStatusOptions: () => api.get('/vehicle-inventory/status-options'),
  validateStatus: (status) => api.post(`/vehicle-inventory/validate-status?status=${status}`),
  getInventoryByVariant: (variantId) => api.get(`/vehicle-inventory/variant/${variantId}`),
  getInventoryByColor: (colorId) => api.get(`/vehicle-inventory/color/${colorId}`),
  getInventoryByWarehouse: (warehouseId) => api.get(`/vehicle-inventory/warehouse/${warehouseId}`),
  getInventoryByWarehouseLocation: (location) => api.get(`/vehicle-inventory/warehouse-location/${location}`),
  getInventoryByPriceRange: (minPrice, maxPrice) => 
    api.get(`/vehicle-inventory/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  getInventoryByManufacturingDateRange: (startDate, endDate) => 
    api.get(`/vehicle-inventory/manufacturing-date-range?startDate=${startDate}&endDate=${endDate}`),
  getInventoryByArrivalDateRange: (startDate, endDate) => 
    api.get(`/vehicle-inventory/arrival-date-range?startDate=${startDate}&endDate=${endDate}`),
  searchByVin: (vin) => api.get(`/vehicle-inventory/search/vin?vin=${vin}`),
  searchByChassisNumber: (chassisNumber) => api.get(`/vehicle-inventory/search/chassis?chassisNumber=${chassisNumber}`),
  createInventory: (data) => api.post('/vehicle-inventory', data),
  updateInventory: (id, data) => api.put(`/vehicle-inventory/${id}`, data),
  updateInventoryStatus: (id, status) => api.put(`/vehicle-inventory/${id}/status?status=${status}`),
  deleteInventory: (id) => api.delete(`/vehicle-inventory/${id}`),
};
//===========================================================//



// ==================== EXPORT DEFAULT ====================
export default api;
