import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { Worker } from '@/types/worker';

interface WorkerInfoProps {
  worker: Worker;
}

export default function WorkerInfo({ worker }: WorkerInfoProps) {
  return (
    <View style={styles.container}>
      <AppText variant="subtitle">About</AppText>
      <AppText variant="body" style={styles.description}>{worker.description}</AppText>
      <View style={styles.metaRow}>
        <AppText variant="caption" style={styles.label}>Location</AppText>
        <AppText variant="body">{worker.location}</AppText>
      </View>
      <View style={styles.metaRow}>
        <AppText variant="caption" style={styles.label}>Phone</AppText>
        <AppText variant="body">{worker.phone}</AppText>
      </View>
      <View style={styles.metaRow}>
        <AppText variant="caption" style={styles.label}>Availability</AppText>
        <AppText variant="body">{worker.availability}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  description: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: {
    color: colors.textMuted,
  },
});
