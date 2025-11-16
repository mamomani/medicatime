import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { setupNotificationListener } from '@/utils/notifications';
import { LanguageProvider } from '@/contexts/LanguageContext';
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    const subscription = setupNotificationListener();

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    mobileAds()
      .initialize()
      .catch((error) => {
        console.warn('Failed to initialize mobile ads SDK', error);
      });
  }, []);

  return (
    <LanguageProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="edit-log" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </LanguageProvider>
  );
}
