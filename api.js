const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function setToken(t) {
  if (t) localStorage.setItem('mh_token', t);
  else localStorage.removeItem('mh_token');
}

export function mediaUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  return BASE + p;
}

async function req(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const t = localStorage.getItem('mh_token') || '';
  if (t) headers.Authorization = `Bearer ${t}`;
  
  const res = await fetch(BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const e = new Error(data.error || 'خطأ في الاتصال');
    e.status = res.status;
    throw e;
  }
  return data;
}

export const api = {
  products: () => req('/api/products'),
  productsAll: () => req('/api/products/all'),
  createProduct: (b) => req('/api/products', { method: 'POST', body: JSON.stringify(b) }),
  updateProduct: (id, b) => req(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  deleteProduct: (id) => req(`/api/products/${id}`, { method: 'DELETE' }),
  upload: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return req('/api/upload', { method: 'POST', body: fd });
  },
  createOrder: (b) => req('/api/orders', { method: 'POST', body: JSON.stringify(b) }),
  orders: () => req('/api/orders'),
  setOrderStatus: (id, s) =>
    req(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: s }),
    }),
  login: (u, p) =>
    req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p }),
    }),
  me: () => req('/api/auth/me'),
};
