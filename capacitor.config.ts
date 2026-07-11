import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.basicfootballtacticsedu.app",
  appName: "Basic Football Tactics Edu",
  webDir: "www",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: "#0b3d2e",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0b3d2e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b3d2e",
    },
  },
};

export default config;
