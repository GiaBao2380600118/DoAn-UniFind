import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5031/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn Token tự động vào Header nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unifind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

