import { request } from './api.js';

export async function getProducts({ page = 1, limit = 20, search = '', active, category = '', lowStock = false } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (active !== undefined) params.set('active', String(active));
  if (category) params.set('category', category);
  if (lowStock) params.set('low_stock', 'true');

  const data = await request(`/products?${params}`);
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, pages: 1 };
  return { items: data?.items || [], total: data?.total || 0, page: data?.page || 1, pages: data?.pages || 1 };
}

export async function createProduct(product) {
  return request('/products', { method: 'POST', body: JSON.stringify(product) });
}

export async function updateProduct(id, product) {
  return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
}

export async function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' });
}

export async function getProductCategories() {
  const data = await request('/products/categories/list');
  return Array.isArray(data) ? data : data?.categories || [];
}
