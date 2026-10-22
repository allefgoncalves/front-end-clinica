import { request } from './api.js';

export async function getAppointments({ search = '', status = '' } = {}) {
  const params = new URLSearchParams({ page: '1', limit: '100' });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const data = await request(`/appointments?${params}`);
  return Array.isArray(data) ? data : data?.items || [];
}

export async function getClients() {
  const data = await request('/clients?page=1&limit=100');
  return Array.isArray(data) ? data : data?.items || [];
}

export async function getActiveServices() {
  const data = await request('/services?page=1&limit=100&active=true');
  const services = Array.isArray(data) ? data : data?.items || [];
  return services.filter((service) => service.active !== false);
}

export async function createAppointment(appointment) {
  return request('/appointments', { method: 'POST', body: JSON.stringify(appointment) });
}

export async function updateAppointment(id, appointment) {
  return request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(appointment) });
}

export async function cancelAppointment(id) {
  return request(`/appointments/${id}/cancel`, { method: 'POST' });
}
