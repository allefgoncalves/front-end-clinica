import { request } from './api.js';

export async function getGoals({ year, month, status, type } = {}) {
  const params = new URLSearchParams({ page: '1', limit: '100' });
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  if (status) params.set('status', status);
  if (type) params.set('type', type);
  const data = await request(`/goals?${params}`);
  return Array.isArray(data) ? data : data?.items || [];
}

export async function getCurrentGoals() {
  const data = await request('/goals/current');
  return Array.isArray(data) ? data : data?.items || [];
}

export async function getGoalsHistory() {
  return request('/goals/history?months=12');
}

export async function createGoal(goal) {
  return request('/goals', { method: 'POST', body: JSON.stringify(goal) });
}

export async function updateGoal(id, goal) {
  return request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(goal) });
}

export async function deleteGoal(id) {
  return request(`/goals/${id}`, { method: 'DELETE' });
}
