import { request } from './api.js';

export async function getServices({ page = 1, limit = 20, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const data = await request(`/services?${params}`);

  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pages: 1 };
  }

  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pages: data?.pages || 1
  };
}
