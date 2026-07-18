export const environment = {
  production: false,
  apiUrl: 'http://localhost:5196/api',
  // WhatsApp asistanı (ayrı Node servisi). Yerelde localhost:3000.
  whatsappUrl: 'http://localhost:3000/',
  // Google OAuth 2.0 Web-Client-ID für den KI-E-Mail-Assistenten (Gmail-Login).
  // Kann leer bleiben und stattdessen in der App eingegeben werden (localStorage).
  googleClientId:
    '288460928101-h17vdae2ctjl3l08n50tsnhk8ca5ije5.apps.googleusercontent.com',
};
