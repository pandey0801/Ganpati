import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';

interface ServiceLoadStateProps {
  status: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
}

export default function ServiceLoadState({
  status,
  message,
  onRetry,
}: ServiceLoadStateProps) {
  if (status === 'loading') {
    return (
      <View style={styles.container} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.message}>Loading services...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="subtitle">
        {status === 'error' ? 'Unable to load services' : 'No services available'}
      </AppText>
      {message ? <AppText style={styles.message}>{message}</AppText> : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <AppText style={styles.retryText}>Try again</AppText>
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
