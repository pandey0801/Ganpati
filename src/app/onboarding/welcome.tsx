import { Link } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppText variant="title">{t('onboarding.welcome')}</AppText>
        <AppText variant="body" style={styles.subtitle}>
          {t('onboarding.explore')}
        </AppText>

        <Link href="/(tabs)/home" asChild>
          <AppButton title={t('onboarding.openHome')} style={styles.button} />
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
