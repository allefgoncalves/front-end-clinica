import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { request } from './api.js';

const initialUser = browser ? JSON.parse(localStorage.getItem('user') || 'null') : null;
export const user = writable(initialUser);

export async function login(email, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  localStorage.setItem('access_token', result.access_token);
  if (result.refresh_token) localStorage.setItem('refresh_token', result.refresh_token);
  if (result.user) {
    localStorage.setItem('user', JSON.stringify(result.user));
    user.set(result.user);
  }

  const tenantId = decodeTenant(result.access_token);
  if (tenantId) localStorage.setItem('tenant_id', tenantId);
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('user');
  user.set(null);
}

export function isAuthenticated() {
  return browser && Boolean(localStorage.getItem('access_token'));
}

function decodeTenant(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.tenant_id || null;
  } catch {
    return null;
  }
}
