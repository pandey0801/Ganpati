import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import ContactButtons from '@/components/workers/ContactButtons';
import WorkerImage from '@/components/workers/WorkerImage';
import WorkerInfo from '@/components/workers/WorkerInfo';
import WorkerLoadState from '@/components/workers/WorkerLoadState';
import { colors } from '@/constants/colors';
import { useWorkers } from '@/hooks/useWorkers';

export default function WorkerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workers, isLoading, error, retry } = useWorkers({ workerId: id });
  const worker = workers.find((item) => item.id === id);

  if (isLoading || error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <WorkerLoadState
          status={isLoading ? 'loading' : 'error'}
          message={error ? 'Please check your connection and try again.' : undefined}
          onRetry={error ? retry : undefined}
        />
      </SafeAreaView>
    );
  }

  if (!worker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <AppText variant="subtitle">Worker not found</AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <WorkerImage uri={worker.image} style={styles.image} />

        <View style={styles.header}>
          <AppText variant="title">{worker.name}</AppText>
          <AppText variant="caption" style={styles.location}>{worker.location}</AppText>
        </View>

        <ContactButtons phone={worker.phone} />
        <WorkerInfo worker={worker} />

        <AppButton title="Back" variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  location: {
    color: colors.textMuted,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
