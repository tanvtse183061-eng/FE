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
  validate: (token) => api.post('/auth/validate', { token }),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ==================== USER API ====================
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  getUsersByDealer: (dealerId) => api.get(`/users/dealer/${dealerId}`),
  createUser: (data) => api.post('/users', data),
  createUserFromDTO: (data) => api.post('/users/dto', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  resetPasswordByUsername: (username) => api.post(`/users/username/${username}/reset-password`),
  resetPasswordByEmail: (email) => api.post(`/users/email/${email}/reset-password`),
  bulkResetPassword: (data) => api.post('/users/bulk-reset-password', data),
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
  // Brands
  getBrands: () => api.get('/vehicles/brands'),
  getBrand: (id) => api.get(`/vehicles/brands/${id}`),
  createBrand: (data) => api.post('/vehicles/brands', data),
  updateBrand: (id, data) => api.put(`/vehicles/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/vehicles/brands/${id}`),
  
  // Models
  getModels: () => api.get('/vehicles/models'),
  getModel: (id) => api.get(`/vehicles/models/${id}`),
  getModelsByBrand: (brandId) => api.get(`/vehicles/models/brand/${brandId}`),
  searchModels: (q) => api.get(`/vehicles/models/search?name=${q}`),
  createModel: (data) => api.post('/vehicles/models', data),
  updateModel: (id, data) => api.put(`/vehicles/models/${id}`, data),
  deleteModel: (id) => api.delete(`/vehicles/models/${id}`),
  
  // Variants
  getVariants: () => api.get('/vehicles/variants'),
  getVariant: (id) => api.get(`/vehicles/variants/${id}`),
  getVariantsByModel: (modelId) => api.get(`/vehicles/variants/model/${modelId}`),
  searchVariants: (q) => api.get(`/vehicles/variants/search?name=${q}`),
  createVariant: (data) => api.post('/vehicles/variants', data),
  updateVariant: (id, data) => api.put(`/vehicles/variants/${id}`, data),
  deleteVariant: (id) => api.delete(`/vehicles/variants/${id}`),
  
  // Colors
  getColors: () => api.get('/vehicles/colors'),
  getColor: (id) => api.get(`/vehicles/colors/${id}`),
  searchColors: (q) => api.get(`/vehicles/colors/search?name=${q}`),
  createColor: (data) => api.post('/vehicles/colors', data),
  updateColor: (id, data) => api.put(`/vehicles/colors/${id}`, data),
  deleteColor: (id) => api.delete(`/vehicles/colors/${id}`),
  
  // Full Vehicle Creation
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
  getWarehouse: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  activateWarehouse: (id) => api.put(`/warehouses/${id}/activate`),
  deactivateWarehouse: (id) => api.put(`/warehouses/${id}/deactivate`),
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
// ==================== DEALER API ====================
export const dealerAPI = {
  getAll: () => api.get('/dealers'),
  getDealer: (id) => api.get(`/dealers/${id}`),
  search: (keyword) => api.get(`/dealers/search?keyword=${keyword}`),
  create: (data) => api.post('/dealers', data),
  createFromDTO: (data) => api.post('/dealers/dto', data),
  update: (id, data) => api.put(`/dealers/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealers/${id}/status`, { status }),
  delete: (id) => api.delete(`/dealers/${id}`),
};
// ==================== INVENTORY API ====================
export const inventoryAPI = {
  getInventory: () => api.get('/inventory-management'),
  getInventoryById: (id) => api.get(`/inventory-management/${id}`),
  createInventory: (data) => api.post('/inventory-management', data),
  createFromRequest: (data) => api.post('/inventory-management/create-from-request', data),
  updateInventory: (id, data) => api.put(`/inventory-management/${id}`, data),
  updateFromRequest: (id, data) => api.put(`/inventory-management/${id}/update-from-request`, data),
  updateStatus: (id, status) => api.put(`/inventory-management/${id}/status`, { status }),
  markSold: (id) => api.put(`/inventory-management/${id}/mark-sold`),
  markReserved: (id) => api.put(`/inventory-management/${id}/mark-reserved`),
  deleteInventory: (id) => api.delete(`/inventory-management/${id}`),
  normalizeStatuses: () => api.post('/inventory-management/normalize-statuses'),
  validateStatus: (status) => api.post('/inventory-management/validate-status', { status }),
  
  // Legacy endpoints (keep for backward compatibility)
  getInventoryByVin: (vin) => api.get(`/vehicle-inventory/vin/${vin}`),
  getAllStatuses: () => api.get('/vehicle-inventory/statuses'),
  getStatusSummary: () => api.get('/vehicle-inventory/status-summary'),
  getStatusOptions: () => api.get('/vehicle-inventory/status-options'),
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
  updateInventoryStatus: (id, status) => api.put(`/vehicle-inventory/${id}/status?status=${status}`),
};

// ==================== PROMOTION API ====================
export const promotionAPI = {
  getPromotions: () => api.get('/promotions'),
  getPromotion: (id) => api.get(`/promotions/${id}`),
  getActivePromotions: () => api.get('/promotions/active'),
  createPromotion: (data) => api.post('/promotions', data),
  updatePromotion: (id, data) => api.put(`/promotions/${id}`, data),
  updateStatus: (id, status) => api.put(`/promotions/${id}/status`, { status }),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
};

// ==================== FEEDBACK API ====================
export const feedbackAPI = {
  getFeedbacks: () => api.get('/feedbacks'),
  getFeedback: (id) => api.get(`/feedbacks/${id}`),
  createFeedback: (data) => api.post('/feedbacks', data),
  updateFeedback: (id, data) => api.put(`/feedbacks/${id}`, data),
  updateStatus: (id, status) => api.put(`/feedbacks/${id}/status`, { status }),
  replyFeedback: (id, reply) => api.post(`/feedbacks/${id}/reply`, { reply }),
  deleteFeedback: (id) => api.delete(`/feedbacks/${id}`),
};

// ==================== SALES CONTRACT API ====================
export const salesContractAPI = {
  getContracts: () => api.get('/sales-contracts'),
  getContract: (id) => api.get(`/sales-contracts/${id}`),
  createContract: (data) => api.post('/sales-contracts', data),
  updateContract: (id, data) => api.put(`/sales-contracts/${id}`, data),
  updateStatus: (id, status) => api.put(`/sales-contracts/${id}/status`, { status }),
  signContract: (id) => api.put(`/sales-contracts/${id}/sign`),
  deleteContract: (id) => api.delete(`/sales-contracts/${id}`),
};

// ==================== DEALER TARGET API ====================
export const dealerTargetAPI = {
  getTargets: () => api.get('/dealer-targets'),
  getTarget: (id) => api.get(`/dealer-targets/${id}`),
  getTargetsByDealer: (dealerId) => api.get(`/dealer-targets/dealer/${dealerId}`),
  getTargetsByDealerAndYear: (dealerId, year) => api.get(`/dealer-targets/dealer/${dealerId}/year/${year}`),
  createTarget: (data) => api.post('/dealer-targets', data),
  updateTarget: (id, data) => api.put(`/dealer-targets/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-targets/${id}/status`, { status }),
  updateAchievement: (id, achievement) => api.put(`/dealer-targets/${id}/achievement`, { achievement }),
  deleteTarget: (id) => api.delete(`/dealer-targets/${id}`),
};

// ==================== DEALER CONTRACT API ====================
export const dealerContractAPI = {
  getContracts: () => api.get('/dealer-contracts'),
  getContract: (id) => api.get(`/dealer-contracts/${id}`),
  createContract: (data) => api.post('/dealer-contracts', data),
  updateContract: (id, data) => api.put(`/dealer-contracts/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-contracts/${id}/status`, { status }),
  signContract: (id) => api.put(`/dealer-contracts/${id}/sign`),
  deleteContract: (id) => api.delete(`/dealer-contracts/${id}`),
};

// ==================== PRICING POLICY API ====================
export const pricingPolicyAPI = {
  getPolicies: () => api.get('/pricing-policies'),
  getPolicy: (id) => api.get(`/pricing-policies/${id}`),
  getPoliciesByDealer: (dealerId) => api.get(`/pricing-policies/dealer/${dealerId}`),
  getDealerSpecificPolicies: () => api.get('/pricing-policies/dealer-specific'),
  createPolicy: (data) => api.post('/pricing-policies', data),
  updatePolicy: (id, data) => api.put(`/pricing-policies/${id}`, data),
  updateStatus: (id, status) => api.put(`/pricing-policies/${id}/status`, { status }),
  deletePolicy: (id) => api.delete(`/pricing-policies/${id}`),
};

// ==================== REPORT API ====================
export const reportAPI = {
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getInventoryReport: (params) => api.get('/reports/inventory', { params }),
  getDealerReport: (params) => api.get('/reports/dealer', { params }),
  getCustomerReport: (params) => api.get('/reports/customer', { params }),
  getPaymentReport: (params) => api.get('/reports/payment', { params }),
};

// ==================== IMAGE API ====================
export const imageAPI = {
  upload: (formData) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMultiple: (formData) => api.post('/images/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleBrand: (formData) => api.post('/images/upload/vehicle-brand', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleModel: (formData) => api.post('/images/upload/vehicle-model', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleVariant: (formData) => api.post('/images/upload/vehicle-variant', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleInventory: (formData) => api.post('/images/upload/vehicle-inventory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadColorSwatch: (formData) => api.post('/images/upload/color-swatch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (category, filename) => api.delete(`/images/delete/${category}/${filename}`),
  deleteCategory: (category) => api.delete(`/images/delete-category/${category}`),
  updateImage: (category, filename, formData) => api.put(`/images/update/${category}/${filename}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  renameImage: (category, oldFilename, newFilename) => api.put(`/images/rename/${category}/${oldFilename}`, { newFilename }),
  moveImage: (oldCategory, filename, newCategory) => api.put(`/images/move/${oldCategory}/${filename}`, { newCategory }),
  bulkDelete: (data) => api.post('/images/bulk-delete', data),
  bulkMove: (data) => api.post('/images/bulk-move', data),
};

// ==================== INSTALLMENT PLAN API ====================
export const installmentPlanAPI = {
  getPlans: () => api.get('/installment-plans'),
  getPlan: (id) => api.get(`/installment-plans/${id}`),
  getDealerPlans: () => api.get('/installment-plans/dealer-plans'),
  getPlansByDealer: (dealerId) => api.get(`/installment-plans/dealer/${dealerId}`),
  getPlansByInvoice: (invoiceId) => api.get(`/installment-plans/invoice/${invoiceId}`),
  createPlan: (data) => api.post('/installment-plans', data),
  updatePlan: (id, data) => api.put(`/installment-plans/${id}`, data),
  updateStatus: (id, status) => api.put(`/installment-plans/${id}/status`, { status }),
  deletePlan: (id) => api.delete(`/installment-plans/${id}`),
};

// ==================== INSTALLMENT SCHEDULE API ====================
export const installmentScheduleAPI = {
  getSchedules: () => api.get('/installment-schedules'),
  getSchedule: (id) => api.get(`/installment-schedules/${id}`),
  createSchedule: (data) => api.post('/installment-schedules', data),
  updateSchedule: (id, data) => api.put(`/installment-schedules/${id}`, data),
  updateStatus: (id, status) => api.put(`/installment-schedules/${id}/status`, { status }),
  markPaid: (id) => api.put(`/installment-schedules/${id}/mark-paid`),
  deleteSchedule: (id) => api.delete(`/installment-schedules/${id}`),
};



// ==================== EXPORT DEFAULT ====================
export default api;
