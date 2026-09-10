import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import ServiceListItem from '@/components/services/ServiceListItem';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import { filterServices } from '@/utils/search';
import { Service } from '@/types/service';

export default function ServicesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const services = servicesData as Service[];

  const filteredServices = useMemo(() => filterServices(services, query), [services, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Services" subtitle="Find the support you need" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search services"
          style={styles.input}
        />

        {filteredServices.length === 0 ? (
          <EmptyState title="No services found" message="Try another search or browse all categories." />
        ) : (
          filteredServices.map((service) => (
            <ServiceListItem
              key={service.id}
              service={service}
              onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}
            />
          ))
        )}
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
});
