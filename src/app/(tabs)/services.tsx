import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import ServiceListItem from '@/components/services/ServiceListItem';
import ServiceLoadState from '@/components/services/ServiceLoadState';
import { colors } from '@/constants/colors';
import { useServices } from '@/hooks/useServices';
import { filterServices } from '@/utils/search';

export default function ServicesScreen() {
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { category, query: searchQuery } = useLocalSearchParams<{ category?: string | string[]; query?: string | string[] }>();
  const [query, setQuery] = useState(Array.isArray(searchQuery) ? searchQuery[0] ?? '' : searchQuery ?? '');
  const { services, isLoading, error, retry } = useServices();
  const selectedCategory = Array.isArray(category) ? category[0] : category;

  const filteredServices = useMemo(
    () => filterServices(services, query, selectedCategory),
    [services, query, selectedCategory],
  );

  return (
    // <SafeAreaView style={styles.safeArea}>
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Services" subtitle="Find the support you need" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search services"
          style={[styles.input, isInputFocused && styles.inputFocused]}
          selectionColor={colors.primary}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isLoading ? (
          <ServiceLoadState status="loading" />
        ) : error ? (
          <ServiceLoadState status="error" message={error.message} onRetry={retry} />
        ) : services.length === 0 ? (
          <ServiceLoadState
            status="empty"
            message="There are no services to display right now."
            onRetry={retry}
          />
        ) : filteredServices.length === 0 ? (
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
    {/* </SafeAreaView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    // paddingBottom: 32,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});
