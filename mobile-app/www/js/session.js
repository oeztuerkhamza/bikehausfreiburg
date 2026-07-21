// Oturum durumu: JWT token + kullanıcı bilgisi. Capacitor Preferences'ta kalıcı
// saklanır (yoksa localStorage). Uygulama yeniden açıldığında tekrar login gerekmez.

const Prefs = window.Capacitor?.Plugins?.Preferences || null;

const Store = {
  async get(key) {
    try { if (Prefs) return (await Prefs.get({ key })).value; } catch {}
    return localStorage.getItem(key);
  },
  async set(key, value) {
    try { if (Prefs) { await Prefs.set({ key, value }); return; } } catch {}
    localStorage.setItem(key, value);
  },
  async remove(key) {
    try { if (Prefs) { await Prefs.remove({ key }); return; } } catch {}
    localStorage.removeItem(key);
  },
};

let _token = '';
let _name  = '';

export function token() { return _token; }
export function displayName() { return _name; }
export function isLoggedIn() { return !!_token; }

export async function loadSession() {
  _token = (await Store.get('token')) || '';
  _name  = (await Store.get('displayName')) || '';
  return _token;
}

export async function saveSession({ token, displayName, expiresAt }) {
  _token = token || '';
  _name  = displayName || _name;
  await Store.set('token', _token);
  await Store.set('displayName', _name);
  if (expiresAt) await Store.set('expiresAt', String(expiresAt));
}

export async function clearSession() {
  _token = ''; _name = '';
  await Store.remove('token');
  await Store.remove('displayName');
  await Store.remove('expiresAt');
}

// Küçük anahtar/değer kalıcılığı (görülen mesaj imleri, tercihler vb.)
export const kv = {
  async get(k)      { return Store.get(k); },
  async set(k, v)   { return Store.set(k, v); },
  async remove(k)   { return Store.remove(k); },
};
