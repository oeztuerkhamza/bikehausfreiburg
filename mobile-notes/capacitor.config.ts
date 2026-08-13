import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bikehausfreiburg.notizen',
  appName: 'BikeHaus Notlar',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0b141a',
  },
  plugins: {
    // Native HTTP → CORS'u atlar (api.bikehausfreiburg.com başka origin).
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      // WebView klavye açılınca küçülsün. Ekranlar position:fixed/inset:0
      // olduğu için alanlar klavyenin üstünde kalır. ('none' seçilirse
      // klavye yüksekliğini elle hesaplayan bir katman gerekir.)
      resize: 'native',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#202c33',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#00a884',
    },
  },
};

export default config;
