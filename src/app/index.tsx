import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';

export default function EntryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="title">Welcome to MyApp</AppText>
        <AppText variant="body" style={styles.subtitle}>
          Find trusted local services and confirmed professionals for your next home need.
        </AppText>

        {/* <Link href="/onboarding" asChild>
          <AppButton title="Get Started" style={styles.button} />
        </Link> */}
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
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 320,
  },
  button: {
    minWidth: 220,
  },
});
