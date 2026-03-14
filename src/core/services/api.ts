import axios from 'axios';

// PEGA A URL DO ARQUIVO .env
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_URL, 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.url}`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // IMPORTANTE: Usar a mesma baseURL
          const response = await axios.post(
            `${API_URL}/auth/refresh`,  // ← USA A VARIÁVEL
            { refresh_token: refreshToken }
          );
          
          if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;