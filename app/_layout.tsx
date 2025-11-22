import { ENV, printConfig } from '@/config/env';
import { useTokenRefresh } from '@/lib/tokenManager';
import { useAuthStore } from '@/store/authStore';
import { Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import "./global.css";

// Suprimir warnings específicos de SplashScreen
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorString = args.join(' ');
  if (
    errorString.includes('No native splash screen') ||
    errorString.includes('Uncaught (in promise, id:')
  ) {
    return; // Silenciar estos errores específicos
  }
  originalConsoleError(...args); // Mostrar otros errores normalmente
};

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore error if splash screen already hidden
});

// Imprimir configuración en desarrollo
if (__DEV__) {
  printConfig();
}

export default function RootLayout() {
  // Crear una instancia de QueryClient (solo una vez)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ENV.CACHE_STALE_TIME,
        gcTime: ENV.CACHE_GC_TIME,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  }));

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

    const inAppArea = segments[0] === '(tabs)' || segments[0] === '(stack)';

    if (user) {
      if (!inAppArea) {
        router.replace('/(tabs)');
      }
    } else {
      if (inAppArea) {
        router.replace('/login');
      }
    }

    SplashScreen.hideAsync().catch(() => {
      // Ignore error if splash screen already hidden
    });

  }, [fontsLoaded, fontError, user, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(stack)"/>
      </Stack>
    </QueryClientProvider>
  );
}
