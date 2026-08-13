// Ortak HTTP katmanı. CapacitorHttp etkinken fetch native'e yönlenir → CORS yok.
// Token her isteğe Authorization: Bearer olarak eklenir. 401 → 'unauthorized' olayı.
import { token } from './session.js';

export class HttpError extends Error {
  constructor(status, message, data) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request(url, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const t = token();
    if (t) h.Authorization = `Bearer ${t}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: h,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new HttpError(0, 'Ağ hatası — bağlantıyı kontrol et', null);
  }

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('unauthorized'));
    throw new HttpError(401, 'Oturum sona erdi', null);
  }

  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Hata (${res.status})`;
    throw new HttpError(res.status, msg, data);
  }
  return data;
}

export const http = {
  get:  (url, opts)       => request(url, { ...opts, method: 'GET' }),
  post: (url, body, opts) => request(url, { ...opts, method: 'POST', body }),
  put:  (url, body, opts) => request(url, { ...opts, method: 'PUT', body }),
  del:  (url, opts)       => request(url, { ...opts, method: 'DELETE' }),
};
