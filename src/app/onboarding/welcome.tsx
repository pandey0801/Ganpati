import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="title">Welcome aboard</AppText>
        <AppText variant="body" style={styles.subtitle}>
          Explore top-rated local professionals and book the right support without leaving the app.
        </AppText>

        <Link href="/(tabs)/home" asChild>
          <AppButton title="Open Home" style={styles.button} />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  subtitle: {
    color: colors.textMuted,
  },
  button: {
    marginTop: 12,
  },
});
