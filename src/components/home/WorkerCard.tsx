import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { Worker } from '@/types/worker';

interface WorkerCardProps {
  worker: Worker;
  onPress?: () => void;
}

export default function WorkerCard({ worker, onPress }: WorkerCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: worker.image }} style={styles.image} />
      <View style={styles.content}>
        <AppText variant="subtitle">{worker.name}</AppText>
        <AppText variant="caption" style={styles.meta}>{worker.location}</AppText>
        <AppText variant="small" style={styles.availability}>
          {worker.availability}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  availability: {
    color: colors.success,
    marginTop: 6,
  },
});
