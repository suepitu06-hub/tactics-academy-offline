import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.basicfootballtacticsedu.app",
  appName: "Basic Football Tactics Edu",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
};

export default config;
