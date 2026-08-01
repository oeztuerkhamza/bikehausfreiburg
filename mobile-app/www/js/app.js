// Uygulama kabuğu: oturum, sekme/görünüm yönlendirmesi, global yoklama + bildirimler.
import { POLL_WA_MS, POLL_MAIL_MS, POLL_KA_MS } from './config.js';
import { loadSession, displayName, isLoggedIn } from './session.js';
import { login, validateSession, logout } from './auth.js';
import { $, toast, initials, autoGrow, setText } from './ui.js';
import * as Notify from './notify.js';
import * as Keyboard from './keyboard.js';
import * as WA from './whatsapp.js';
import * as KA from './kleinanzeigen.js';
import * as Mail from './mail.js';

// ─────────────────────────── Durum ───────────────────────────
let activeTab = 'wa';
let currentView = 'view-wa-list';
let appIsActive = true;
let waTimer = null, mailTimer = null, kaTimer = null;

const isForeground = () => appIsActive && document.visibilityState === 'visible';

// ─────────────────────── Görünüm yönetimi ───────────────────────
const VIEWS = ['view-wa-list', 'view-wa-thread', 'view-ka-list', 'view-ka-thread',
               'view-mail-list', 'view-mail-detail', 'view-menu'];

function showView(id) {
  currentView = id;
  for (const v of VIEWS) $(v).classList.toggle('active', v === id);
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'wa')   { showView('view-wa-list');   WA.activate(); }
  if (tab === 'ka')   { showView('view-ka-list');   KA.activate(); }
  if (tab === 'mail') { showView('view-mail-list'); Mail.activate(); }
  if (tab === 'menu') {
    showView('view-menu');
    renderMenu();
    // Durumları tazeleyip satırları güncelle (başka cihazda değişmiş olabilir).
    Promise.all([Mail.refresh(), KA.refreshAccount()]).then(renderAccountRows).catch(() => {});
  }
}

// ─────────────────────────── Ekranlar ───────────────────────────
function showLogin() {
  $('splash').classList.add('hidden');
  $('app-screen').classList.add('hidden');
  $('login-screen').classList.remove('hidden');
  $('login-error').classList.add('hidden');
  $('password').value = '';
  stopPolling();
}

function showApp() {
  $('splash').classList.add('hidden');
  $('login-screen').classList.add('hidden');
  $('app-screen').classList.remove('hidden');
  switchTab('wa');
  startPolling();
  initNotifications();
}

// ─────────────────────── Global yoklama ───────────────────────
// Sekmeden bağımsız çalışır ki diğer sekmedeyken de bildirim gelsin.
function startPolling() {
  stopPolling();
  WA.poll();
  KA.poll();
  Mail.poll();
  waTimer   = setInterval(() => { if (isForeground()) WA.poll(); },   POLL_WA_MS);
  kaTimer   = setInterval(() => { if (isForeground()) KA.poll(); },   POLL_KA_MS);
  mailTimer = setInterval(() => { if (isForeground()) Mail.poll(); }, POLL_MAIL_MS);
}
function stopPolling() {
  if (waTimer)   { clearInterval(waTimer);   waTimer = null; }
  if (kaTimer)   { clearInterval(kaTimer);   kaTimer = null; }
  if (mailTimer) { clearInterval(mailTimer); mailTimer = null; }
}

// ─────────────────────────── Bildirimler ───────────────────────────
async function initNotifications() {
  if (!Notify.isSupported()) return;
  await Notify.ensurePermission();
  updateNotifState();
  Notify.onTap((extra) => {
    if (extra?.tab === 'wa' && extra.chatId) { switchTab('wa'); WA.openConversation(extra.chatId); }
    else if (extra?.tab === 'ka' && extra.chatId) { switchTab('ka'); KA.openConversation(extra.chatId); }
    else if (extra?.tab === 'mail' && extra.mailId) { switchTab('mail'); Mail.openMessage(extra.mailId); }
  });
}

function updateNotifState() {
  const el = $('menu-notif-state');
  if (!el) return;
  el.textContent = !Notify.isSupported() ? 'desteklenmiyor'
    : Notify.isGranted() ? 'açık ✓' : 'kapalı — dokun';
}

// ─────────────────────────── Menü ───────────────────────────
function renderMenu() {
  setText($('menu-name'), displayName() || 'Kullanıcı');
  setText($('menu-avatar'), initials(displayName() || 'BH'));
  updateNotifState();
  renderAccountRows();
}

// Mail ve Kleinanzeigen ayrı Gmail hesaplarına bağlanabilir; ikisi de buradan
// bağlanır/çıkarılır. Kleinanzeigen kendi hesabı yoksa Mail hesabını kullanır.
function renderAccountRows() {
  const mail = Mail.getStatus();
  setText($('menu-mail-account-state'), mail.connected ? (mail.email || 'bağlı ✓') : 'bağlı değil — dokun');

  const ka = KA.getAccount();
  setText($('menu-ka-account-state'),
    !ka.connected ? 'bağlı değil — dokun'
      : ka.ownAccount ? (ka.email || 'bağlı ✓')
      : `${ka.email || 'Mail hesabı'} (Mail hesabı)`);
}

// ─────────────────────────── Olaylar ───────────────────────────
function bindEvents() {
  // Login
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn');
    const err = $('login-error');
    const u = $('username').value.trim();
    const p = $('password').value;
    if (!u || !p) return;

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Giriş yapılıyor…';
    btn.querySelector('.btn-loader').classList.remove('hidden');
    err.classList.add('hidden');
    try {
      await login(u, p);
      showApp();
    } catch (ex) {
      err.textContent = ex.message || 'Giriş başarısız.';
      err.classList.remove('hidden');
      $('password').value = '';
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Giriş Yap';
      btn.querySelector('.btn-loader').classList.add('hidden');
    }
  });

  // Sekmeler
  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  // Geri butonları
  document.querySelectorAll('[data-back]').forEach((b) => {
    b.addEventListener('click', () => goBack());
  });

  // Menü aksiyonları
  $('menu-logout').addEventListener('click', async () => {
    if (!confirm('Çıkış yapmak istediğine emin misin?')) return;
    await logout();
    showLogin();
  });
  $('menu-notif').addEventListener('click', async () => {
    await Notify.ensurePermission();
    updateNotifState();
    if (Notify.isGranted()) toast('Bildirimler açık');
    else toast('İzin verilmedi — telefon ayarlarından açabilirsin', 3600);
  });
  $('menu-mail-account').addEventListener('click', async () => {
    const mail = Mail.getStatus();
    if (mail.connected) {
      if (!confirm(`Mail hesabını (${mail.email}) çıkarmak istiyor musun?`)) return;
      await Mail.disconnect();
    } else {
      await Mail.connect();
    }
    renderAccountRows();
  });
  $('menu-ka-account').addEventListener('click', async () => {
    const ka = KA.getAccount();
    if (ka.ownAccount) {
      if (!confirm(`Kleinanzeigen hesabını (${ka.email}) çıkarmak istiyor musun?`)) return;
      await KA.disconnectAccount();
    } else {
      await KA.connectAccount();
    }
    renderAccountRows();
  });
  $('menu-wa-logout').addEventListener('click', () => {
    if (confirm('WhatsApp numarasını çıkarmak istiyor musun? Sohbetler temizlenir ve yeni QR gerekir.')) {
      WA.logoutNumber();
    }
  });

  // Token süresi dolduysa
  window.addEventListener('unauthorized', async () => {
    await logout();
    showLogin();
    toast('Oturum sona erdi, tekrar giriş yap');
  });

  // Android donanım geri tuşu
  const CapApp = window.Capacitor?.Plugins?.App;
  if (CapApp) {
    CapApp.addListener('backButton', () => {
      if (!goBack()) CapApp.exitApp();
    });
    CapApp.addListener('appStateChange', ({ isActive }) => {
      appIsActive = isActive;
      if (isActive && isLoggedIn()) { WA.poll(); KA.poll(); Mail.poll(); }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (isForeground() && isLoggedIn()) { WA.poll(); KA.poll(); }
  });
}

// Geri navigasyonu. true → içeride bir adım geri gidildi.
function goBack() {
  if (currentView === 'view-wa-thread')   { showView('view-wa-list');   return true; }
  if (currentView === 'view-ka-thread')   { showView('view-ka-list');   return true; }
  if (currentView === 'view-mail-detail') { showView('view-mail-list'); return true; }
  if (activeTab !== 'wa') { switchTab('wa'); return true; }
  return false;
}

// Klavye açılınca sohbetin son mesajları da klavyenin üstünde kalsın.
function initKeyboard() {
  Keyboard.init();
  Keyboard.onChange((open) => {
    if (!open) return;
    const box = currentView === 'view-wa-thread' ? $('wa-messages')
              : currentView === 'view-ka-thread' ? $('ka-messages')
              : null;
    if (!box) return;
    // Yükseklik değişimi uygulandıktan sonra en alta kaydır.
    requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
  });
}

// ─────────────────────────── Başlangıç ───────────────────────────
(async function boot() {
  bindEvents();
  initKeyboard();

  WA.mount({ isForeground, showThread: () => showView('view-wa-thread') });
  KA.mount({ isForeground, showThread: () => showView('view-ka-thread') });
  Mail.mount({ isForeground, showDetail: () => showView('view-mail-detail') });

  autoGrow($('wa-instruction'));
  autoGrow($('ka-instruction'));

  // Durum çubuğu rengi
  try { await window.Capacitor?.Plugins?.StatusBar?.setBackgroundColor({ color: '#202c33' }); } catch {}

  $('splash').style.display = 'block';
  await loadSession();

  if (isLoggedIn() && await validateSession()) {
    showApp();               // kayıtlı token geçerli → tekrar login yok
  } else {
    showLogin();
  }
})();
