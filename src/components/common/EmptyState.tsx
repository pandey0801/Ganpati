import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle">{title}</AppText>
      {message ? <AppText variant="caption" style={styles.message}>{message}</AppText> : null}
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
  },
});
