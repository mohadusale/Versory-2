import { useTokenRefresh } from '@/lib/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from 'react';
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_600SemiBold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const { user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  
  // Activar sistema de refresh automático
  useTokenRefresh();

  useEffect(() => {
    if (fontError) throw fontError;

    if (!fontsLoaded) return;

    const inAppArea = segments[0] === '(tabs)';

    if (user) {
      if (!inAppArea) {
        router.replace('/(tabs)');
      }
    } else {
      if (inAppArea) {
        router.replace('/login');
      }
    }

    SplashScreen.hideAsync();

  }, [fontsLoaded, fontError, user, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
