import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Auth Services ──────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// ─── Course Services ─────────────────────────────────────────────────────────
export const courseService = {
  getAll: () => api.get('/courses/'),
  getById: (id) => api.get(`/courses/${id}/`),
  getMyCourses: () => api.get('/courses/my-courses/'),
  getLectureAccess: (courseId, lectureId) => api.get(`/courses/${courseId}/lectures/${lectureId}/access/`),
  // Admin
  adminGetAll: () => api.get('/courses/admin/'),
  adminCreate: (data) => api.post('/courses/admin/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminUpdate: (id, data) => api.patch(`/courses/admin/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminDelete: (id) => api.delete(`/courses/admin/${id}/`),
  adminGetLectures: (courseId) => api.get(`/courses/admin/${courseId}/lectures/`),
  adminCreateLecture: (courseId, data) => api.post(`/courses/admin/${courseId}/lectures/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminUpdateLecture: (courseId, id, data) => api.patch(`/courses/admin/${courseId}/lectures/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminDeleteLecture: (courseId, id) => api.delete(`/courses/admin/${courseId}/lectures/${id}/`),
};

// ─── Payment Services ─────────────────────────────────────────────────────────
export const paymentService = {
  purchase: (courseId, paymentMethod = 'CARD') => api.post('/payments/purchase/', { course_id: courseId, payment_method: paymentMethod }),
  myPurchases: () => api.get('/payments/my-purchases/'),
  checkPurchase: (courseId) => api.get(`/payments/check/${courseId}/`),
  // Admin
  adminGetAll: () => api.get('/payments/admin/purchases/'),
};

// ─── Analytics Services ───────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard/'),
  getUserGrowth: () => api.get('/analytics/user-growth/'),
};

// ─── Admin User Services ──────────────────────────────────────────────────────
export const adminUserService = {
  getAll: () => api.get('/auth/admin/users/'),
  getById: (id) => api.get(`/auth/admin/users/${id}/`),
  update: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/admin/users/${id}/`),
};
