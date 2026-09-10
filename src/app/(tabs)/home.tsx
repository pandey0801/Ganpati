import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import AppHeader from '@/components/common/AppHeader';
import ServiceCard from '@/components/home/ServiceCard';
import WorkerCard from '@/components/home/WorkerCard';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import workersData from '@/data/workers.json';
import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

export default function HomeScreen() {
  const router = useRouter();
  const services = servicesData as Service[];
  const workers = workersData as Worker[];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Home" subtitle="Top services and local experts" />

        <View style={styles.section}>
          <AppHeader title="Popular services" subtitle="Browse all categories" />
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}
            />
          ))}
        </View>

        <View style={styles.section}>
          <AppHeader title="Available workers" subtitle="Quickly connect" />
          {workers.slice(0, 3).map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onPress={() => router.push({ pathname: '/worker/[id]', params: { id: worker.id } })}
            />
          ))}
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
  section: {
    marginTop: 12,
  },
});
