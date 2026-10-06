import axios from 'axios';

// PEGA A URL DO ARQUIVO .env
// Em desenvolvimento, forçar rota relativa para que o proxy do Vite funcione e evite CORS,
// mesmo que `VITE_API_URL` esteja definido no ambiente local.
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api');

console.info('[api] Using API_URL =', API_URL);

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
    const tenantId = localStorage.getItem('tenant_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token e tratamento de 401/403
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
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
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

    if (error.response?.status === 403) {
      console.warn('Acesso negado (403). Redirecionando para página de não autorizado.');
      if (window.location.pathname !== '/unauthorized') {
        window.location.href = '/unauthorized';
      }
    }

    // Additional explicit HTTP handling to make frontend resilient
    if (error.response?.status === 404) {
      console.warn('Recurso não encontrado (404):', error.config?.url);
    }

    if (error.response?.status === 422) {
      console.warn('Validação inválida (422):', error.response.data);
    }

    if (error.response?.status === 409) {
      console.warn('Conflito (409):', error.response.data);
    }

    if (error.response?.status === 429) {
      console.warn('Limite de requisições atingido (429).');
    }

    return Promise.reject(error);
  }
);

export default api;