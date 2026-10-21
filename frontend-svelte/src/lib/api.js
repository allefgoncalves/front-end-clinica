import { mockRequest } from './mock-api.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const MOCK_API = import.meta.env.VITE_MOCK_API !== 'false';

export async function request(path, options = {}) {
  if (MOCK_API) return mockRequest(path, options);

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  const tenantId = typeof localStorage !== 'undefined' ? localStorage.getItem('tenant_id') : null;
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (tenantId) headers.set('X-Tenant-ID', tenantId);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function apiUrl() {
  return API_URL;
}

export function isMockApi() {
  return MOCK_API;
}
