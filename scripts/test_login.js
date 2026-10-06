const BASE = process.env.BASE || 'http://127.0.0.1:8001/api';
const credentials = { email: 'ad@cl.com', password: '159' };

const endpoints = [
  { method: 'GET', path: '/auth/me' },
  { method: 'GET', path: '/tenants/config' },
  { method: 'GET', path: '/dashboard' },
  { method: 'GET', path: '/products?limit=1' },
  { method: 'GET', path: '/services?limit=1' },
  { method: 'GET', path: '/appointments?limit=1' },
  { method: 'GET', path: '/sales?limit=1' },
  { method: 'GET', path: '/admin/users' },
];

(async () => {
  try {
    console.log('POST', `${BASE}/auth/login`);
    const loginResp = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const loginBody = await loginResp.text();
    console.log('=>', loginResp.status, loginResp.statusText);
    console.log('Response:', loginBody.slice(0, 1000));

    if (!loginResp.ok) {
      console.error('Login failed, aborting further checks.');
      process.exit(1);
    }

    let loginJson;
    try { loginJson = JSON.parse(loginBody); } catch (e) { loginJson = null; }
    const token = loginJson?.access_token || loginJson?.token || null;
    if (!token) {
      console.error('No access_token returned; aborting.');
      process.exit(1);
    }

    for (const ep of endpoints) {
      const url = `${BASE}${ep.path}`;
      try {
        console.log('\n', ep.method, url);
        const resp = await fetch(url, {
          method: ep.method,
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const text = await resp.text();
        console.log('=>', resp.status, resp.statusText);
        if (text) console.log('Body snippet:', text.slice(0, 1000));
      } catch (e) {
        console.error('Request error:', e.message);
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
