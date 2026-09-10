import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import AppText from '@/components/common/AppText';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
      {subtitle ? <AppText variant="caption" style={styles.subtitle}>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 6,
  },
});
