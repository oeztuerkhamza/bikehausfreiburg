import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bikehausfreiburg.assistant',
  appName: 'BikeHaus Asistan',
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
    // Native HTTP → CORS'u atlar. Farklı origin'lere (api. / admin.) sorunsuz istek.
    CapacitorHttp: {
      enabled: true,
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
