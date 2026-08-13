// Giriş / oturum doğrulama. Ana API'nin JWT'sini kullanır (admin panelle aynı).
import { API_BASE } from './config.js';
import { http } from './http.js';
import { saveSession, clearSession, token } from './session.js';

export async function login(username, password) {
  const data = await http.post(`${API_BASE}/api/auth/login`, { username, password }, { auth: false });
  await saveSession({
    token: data.token,
    displayName: data.displayName || username,
    expiresAt: data.expiresAt,
  });
  return data;
}

// Kayıtlı token hâlâ geçerli mi? (/me). Geçerliyse tekrar login istemeyiz.
export async function validateSession() {
  if (!token()) return false;
  try {
    await http.get(`${API_BASE}/api/auth/me`);
    return true;
  } catch {
    return false;
  }
}

export async function logout() {
  await clearSession();
}
