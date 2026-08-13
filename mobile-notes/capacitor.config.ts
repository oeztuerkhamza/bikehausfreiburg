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
      resize: 'none',
      resizeOnFullScreen: false,
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
