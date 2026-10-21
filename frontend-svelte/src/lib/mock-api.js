import seed from './mock-data.json';

const STORAGE_KEY = 'prover-mock-database';

function database() {
  if (typeof localStorage === 'undefined') return structuredClone(seed);
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const initial = structuredClone(seed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function save(data) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function jsonBody(options) {
  try { return options?.body ? JSON.parse(options.body) : {}; } catch { return {}; }
}

function responseError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  error.data = { detail: message };
  throw error;
}

function paginated(items, url) {
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 20);
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const filtered = search ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search)) : items;
  const start = (page - 1) * limit;
  return { items: filtered.slice(start, start + limit), total: filtered.length, page, pages: Math.max(1, Math.ceil(filtered.length / limit)), limit };
}

export function mockRequest(path, options = {}) {
  const url = new URL(path, 'http://mock.local');
  const method = (options.method || 'GET').toUpperCase();
  const body = jsonBody(options);
  const data = database();

  if (url.pathname === '/auth/login' && method === 'POST') {
    const account = data.users.find((item) => item.email === body.email && item.password === body.password);
    if (!account) responseError('E-mail ou senha inválidos', 401);
    const payload = btoa(JSON.stringify({ sub: account.id, tenant_id: account.tenant_id }));
    const publicUser = { ...account };
    delete publicUser.password;
    return Promise.resolve({ access_token: `mock.${payload}.token`, refresh_token: 'mock-refresh-token', user: publicUser, token_type: 'bearer' });
  }

  if (url.pathname === '/auth/me') return Promise.resolve(publicUser(data.users[0]));
  if (url.pathname === '/auth/logout' || url.pathname === '/auth/refresh') return Promise.resolve({ message: 'ok' });
  if (url.pathname === '/tenants/config') return Promise.resolve({ tenant: { id: 'tenant-prover', name: 'Prover Clínica', slug: 'prover' }, branding: { logo: null, primary_color: '#b97e42', secondary_color: '#25221f' }, permissions: ['*'] });
  if (url.pathname === '/dashboard' || url.pathname === '/dashboard/stats') return Promise.resolve(dashboard(data));
  if (url.pathname === '/cart/admin/snapshots') return Promise.resolve(paginated(data.carts, url));
  if (url.pathname.match(/^\/cart\/admin\/snapshots\/[^/]+\/discount$/) && method === 'POST') {
    const cartId = url.pathname.split('/')[4];
    const cart = data.carts.find((item) => item.id === cartId);
    if (!cart) responseError('Carrinho não encontrado', 404);
    const discount = Number(body.discount_percent || 0);
    const originalTotal = cart.total;
    const discountAmount = originalTotal * (discount / 100);
    const result = { discount_percent: discount, original_total: originalTotal, discount_amount: discountAmount, discounted_total: originalTotal - discountAmount };
    cart.metadata = { ...cart.metadata, ...result };
    save(data);
    return Promise.resolve(result);
  }
  if (url.pathname.endsWith('/categories/list')) {
    const collectionName = url.pathname.split('/')[1];
    return Promise.resolve([...new Set((data[collectionName] || []).map((item) => item.category).filter(Boolean))]);
  }

  const collection = collectionFor(url.pathname);
  if (!collection) responseError(`Rota fake não implementada: ${method} ${path}`, 404);

  const values = data[collection.name] || [];
  if (method === 'GET') {
    if (collection.id) return Promise.resolve(values.find((item) => item.id === collection.id) || responseError('Registro não encontrado', 404));
    return Promise.resolve(paginated(values, url));
  }

  if (method === 'POST') {
    const item = { id: `${collection.name.slice(0, -1)}-${Date.now()}`, ...body, active: body.active ?? true };
    values.unshift(item);
    save(data);
    return Promise.resolve(item);
  }

  if (method === 'PUT' || method === 'PATCH') {
    const index = values.findIndex((item) => item.id === collection.id);
    if (index < 0) responseError('Registro não encontrado', 404);
    values[index] = { ...values[index], ...body };
    save(data);
    return Promise.resolve(values[index]);
  }

  if (method === 'DELETE') {
    data[collection.name] = values.filter((item) => item.id !== collection.id);
    save(data);
    return Promise.resolve({ message: 'Registro removido' });
  }

  responseError(`Método fake não implementado: ${method}`, 405);
}

function publicUser(account) {
  if (!account) responseError('Usuário não encontrado', 404);
  const user = { ...account };
  delete user.password;
  return user;
}

function collectionFor(pathname) {
  const match = pathname.match(/^\/(services|products|appointments|sales|promotions|goals)(?:\/([^/]+))?/);
  if (match) return { name: match[1], id: match[2] };
  const cartMatch = pathname.match(/^\/cart\/admin\/all(?:\/([^/]+))?/);
  if (cartMatch) return { name: 'carts', id: cartMatch[1] };
  return null;
}

function dashboard(data) {
  return {
    kpis: {
      sales_today: { count: data.sales.length, revenue: data.sales.reduce((total, sale) => total + sale.total, 0) },
      appointments_today: data.appointments.length,
      low_stock_count: data.products.filter((item) => item.stock <= 8).length,
      expiring_soon_count: 1,
      monthly_revenue: 15840
    },
    charts: {
      sales_by_day: [{ date: '2026-10-19', count: 4, revenue: 580 }, { date: '2026-10-20', count: 6, revenue: 920 }, { date: '2026-10-21', count: data.sales.length, revenue: 1250 }],
      sales_by_status: { pending: 1, paid: 1, separated: 0, delivered: 0, cancelled: 0 },
      top_products: data.products.slice(0, 3).map((item, index) => ({ id: item.id, name: item.name, quantity: 12 - index * 3, revenue: item.price * (12 - index * 3) })),
      top_services: data.services.slice(0, 3).map((item, index) => ({ id: item.id, name: item.name, quantity: 20 - index * 4, revenue: item.price * (20 - index * 4) }))
    },
    lists: {
      upcoming_appointments: data.appointments.slice(0, 4).map((item) => ({ id: item.id, time: item.scheduled_date.slice(11, 16), client: item.client_name, service: item.service_name, status: item.status })),
      abandoned_carts: data.carts.filter((item) => item.status === 'abandoned').map((item) => ({ client: item.client_name, items: item.items.length, total: item.total, cart_id: item.id })),
      low_stock_products: data.products.filter((item) => item.stock <= 8).map((item) => ({ id: item.id, name: item.name, stock: item.stock, min_stock: 10 })),
      expiring_products: []
    },
    promotions: { starting_soon: [], ending_soon: data.promotions, ending_today: [] },
    alerts: []
  };
}
