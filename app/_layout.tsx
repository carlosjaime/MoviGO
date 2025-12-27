import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, memo } from "react";
import { View, Text, Linking } from "react-native";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens, enableFreeze } from "react-native-screens";

import { tokenCache } from "@/lib/auth";
import {
  configureNotifications,
  registerForPushNotificationsAsync,
} from "@/lib/notifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
enableScreens(true);
enableFreeze(true);

if (!__DEV__) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.debug = noop;
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

LogBox.ignoreLogs(["Clerk:"]);

const ReadyGate = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return null;
};

const RootLayout = memo(function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    configureNotifications();
    registerForPushNotificationsAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-2xl font-JakartaBold text-center">
          Falta configurar Clerk
        </Text>
        <Text className="text-base font-JakartaRegular text-center mt-3">
          Define EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en tu archivo .env.
        </Text>
        <Text
          className="text-base font-JakartaRegular text-center mt-3 text-primary-500"
          onPress={() =>
            Linking.openURL("https://clerk.com/docs/quickstarts/expo")
          }
        >
          Ver guía de Clerk Expo
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <ReadyGate />
          <Stack screenOptions={{ freezeOnBlur: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
});

export default RootLayout;
