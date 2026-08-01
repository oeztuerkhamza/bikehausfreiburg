// Sabit uç noktalar ve zamanlamalar.
export const API_BASE = 'https://api.bikehausfreiburg.com';        // auth + mail (AiEmail/Gmail)
export const WA_BASE  = 'https://admin.bikehausfreiburg.com/wa';   // WhatsApp servisi (/wa/ → whatsapp:3000)

// Yoklama (polling) aralıkları — uygulama ön plandayken çalışır.
export const POLL_WA_MS   = 5000;    // WhatsApp sohbet listesi
export const POLL_MAIL_MS = 45000;   // Gmail gelen kutusu
export const POLL_KA_MS   = 45000;   // Kleinanzeigen sohbetleri (Gmail üzerinden)

// Yerel geliştirme için (tarayıcıda test). Capacitor'da yoksayılır.
export const IS_NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
