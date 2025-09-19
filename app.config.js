export default {
  expo: {
    name: "VapApp",
    slug: "vapapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.vapapp.mobile",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.vapapp.mobile",
      versionCode: 1
    },
    web: {
      favicon: "./src/assets/images/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-status-bar"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      }
    }
  }
};