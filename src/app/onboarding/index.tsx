import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="title">Let’s get started</AppText>
        <AppText variant="body" style={styles.subtitle}>
          Browse home services, compare specialists, and connect with the right help quickly.
        </AppText>

        <Link href="/onboarding/welcome" asChild>
          <AppButton title="Continue" style={styles.button} />
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
