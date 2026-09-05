import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ibompowerhub.app',
  appName: 'Ibom PowerHub',
  webDir: 'public',
  android: {
    allowMixedContent: true
  }
};

export default config;
