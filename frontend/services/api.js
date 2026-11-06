import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      const path = window.location.pathname;
      const onAuthPage = path.startsWith('/login') || path.startsWith('/signup');

      if (code === 'BLOCKED') {
        localStorage.removeItem('token');
        if (!onAuthPage) window.location.href = '/login?blocked=1';
      } else if (status === 401 && !onAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
