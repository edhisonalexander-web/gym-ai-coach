import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymia.app',
  appName: 'Gym AI Coach',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#07090a',
  },
  server: {
    androidScheme: 'https',
    url: 'https://gym-ai-coach.vercel.app',
    cleartext: false,
  },
};

export default config;
