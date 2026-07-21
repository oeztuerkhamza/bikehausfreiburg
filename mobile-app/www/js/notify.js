// Yerel bildirimler (@capacitor/local-notifications). Uygulama ön/arka planda
// socket yerine yoklama (polling) ile yeni mesajları saptar ve bildirim yayar.
const LN = window.Capacitor?.Plugins?.LocalNotifications || null;

let granted = false;
let idSeq = 1;

export function isSupported() { return !!LN; }
export function isGranted() { return granted; }

export async function ensurePermission() {
  if (!LN) return false;
  try {
    let s = await LN.checkPermissions();
    if (s.display !== 'granted') s = await LN.requestPermissions();
    granted = s.display === 'granted';
  } catch { granted = false; }
  return granted;
}

// Bildirim gönder. tag ile aynı sohbetin bildirimleri gruplanabilir.
export async function notify(title, body, extra = {}) {
  if (!LN || !granted) return;
  try {
    await LN.schedule({
      notifications: [{
        id: (idSeq = (idSeq % 100000) + 1),
        title,
        body: (body || '').slice(0, 180),
        smallIcon: 'ic_stat_notify',
        iconColor: '#00a884',
        extra,
        schedule: { at: new Date(Date.now() + 200) },
      }],
    });
  } catch (e) {
    // sessizce geç — bildirim kritik değil
  }
}

// Bildirime dokununca bir olay yayınla (app.js dinler, ilgili sekmeye gider).
export function onTap(handler) {
  if (!LN) return;
  try {
    LN.addListener('localNotificationActionPerformed', (ev) => {
      handler(ev?.notification?.extra || {});
    });
  } catch {}
}
