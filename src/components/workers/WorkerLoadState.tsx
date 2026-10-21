import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

interface WorkerLoadStateProps {
  status: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
}

export default function WorkerLoadState({
  status,
  message,
  onRetry,
}: WorkerLoadStateProps) {
  const { t } = useTranslation();

  if (status === 'loading') {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.message}>{t('workerLoad.loading')}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="subtitle">
        {status === 'error' ? t('workerLoad.error') : t('workerLoad.empty')}
      </AppText>
      {message ? <AppText style={styles.message}>{message}</AppText> : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <AppText style={styles.retryText}>{t('common.tryAgain')}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
  },
  retryButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.text,
    fontWeight: '700',
  },
});
