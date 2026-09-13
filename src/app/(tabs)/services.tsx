import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import ServiceListItem from '@/components/services/ServiceListItem';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterServices } from '@/utils/search';
import { Service } from '@/types/service';

export default function ServicesScreen() {
  const router = useRouter();
  const { category, query: searchQuery } = useLocalSearchParams<{ category?: string | string[]; query?: string | string[] }>();
  const [query, setQuery] = useState(Array.isArray(searchQuery) ? searchQuery[0] ?? '' : searchQuery ?? '');
  const services = servicesData as Service[];
  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const filteredServices = useMemo(
    () => filterServices(services, query, selectedCategory),
    [services, query, selectedCategory],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Services" subtitle="Find the support you need" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search services"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {filteredServices.length === 0 ? (
          <EmptyState
            title="No services found"
            message={
              selectedCategory || query.trim()
                ? 'Try another category or search term.'
                : 'Try another search or browse all categories.'
            }
          />
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
    paddingBottom: 0,
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
