import { request } from './api.js';

export async function getSales({ page = 1, limit = 100 } = {}) {
  const data = await request(`/sales?page=${page}&limit=${limit}`);
  if (Array.isArray(data)) return data;
  return data?.items || [];
}
