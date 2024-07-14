import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Run4Recht',
  webDir: 'www',
  server: {
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'logo',
      iconColor: '#1e612b',
      sound: 'beep.wav',
    }
  }
};

export default config;
