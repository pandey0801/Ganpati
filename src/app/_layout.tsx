import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { restoreLanguagePreference } from '@/i18n';

export default function RootLayout() {
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    void restoreLanguagePreference()
      .catch((error: unknown) => {
        console.error('Unable to restore language preference:', error);
      })
      .finally(() => setLanguageReady(true));
  }, []);

  return (
    <SafeAreaProvider>
      {languageReady ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          {/* <Stack.Screen name="onboarding" /> */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="service/[id]" />
          <Stack.Screen name="worker/register" />
          <Stack.Screen name="worker/[id]" />
        </Stack>
      ) : (
        <View style={styles.loading} accessibilityRole="progressbar">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
