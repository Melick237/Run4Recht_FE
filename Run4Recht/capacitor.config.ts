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
      smallIcon: 'ic_notification',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    }
  }
};

export default config;
