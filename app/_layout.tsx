import { AuthBootstrap } from "@/components/AuthBootstrap";
import { brandLogo } from "@/constants/brand";
import { splashArtSlides } from "@/constants/splash";
import { useEffect } from "react";
import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync([...splashArtSlides, brandLogo]);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    void prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FAF7F2" }}>
        <StatusBar style="dark" />
        <AuthBootstrap />
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
