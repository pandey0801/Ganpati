import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import WorkerCard from '@/components/workers/WorkerCard';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import workersData from '@/data/workers.json';
import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const services = servicesData as Service[];
  const workers = workersData as Worker[];

  const service = services.find((item) => item.id === id);
  const serviceWorkers = workers.filter((worker) => worker.serviceId === id);

  if (!service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Service not found" message="This service could not be located." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: service.image }} style={styles.image} />
        <AppHeader title={service.name} subtitle={service.category || 'Service'} />

        <View style={styles.section}>
          <AppButton title="Back to services" onPress={() => router.back()} style={styles.button} />
        </View>

        <View style={styles.section}>
          <AppHeader title="Description" subtitle={service.description} />
        </View>

        <View style={styles.section}>
          <AppHeader title="Workers" subtitle={`${serviceWorkers.length} available`} />
          {serviceWorkers.length === 0 ? (
            <EmptyState title="No workers available" message="Please check back later." />
          ) : (
            serviceWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onPress={() => router.push({ pathname: '/worker/[id]', params: { id: worker.id } })}
              />
            ))
          )}
        </View>
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
    height: 180,
    borderRadius: 18,
    marginBottom: 20,
  },
  section: {
    marginTop: 8,
  },
  button: {
    marginBottom: 8,
  },
});
