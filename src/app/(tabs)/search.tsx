import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';


// import { SafeAreaView } from 'react-native-safe-area-context';


import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import WorkerLoadState from '@/components/workers/WorkerLoadState';
import WorkerCard from '@/components/workers/WorkerCard';
import { colors } from '@/constants/colors';
import { useWorkers } from '@/hooks/useWorkers';
import { filterWorkers } from '@/utils/search';

export default function SearchScreen() {
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { serviceId, category, availability } = useLocalSearchParams<{
    serviceId?: string | string[];
    category?: string | string[];
    availability?: string | string[];
  }>();
  const [query, setQuery] = useState('');
  const { workers, isLoading, error, retry } = useWorkers();
  const selectedServiceId = Array.isArray(serviceId) ? serviceId[0] : serviceId;
  const selectedCategory = Array.isArray(category) ? category[0] : category;
  const selectedAvailability = Array.isArray(availability) ? availability[0] : availability;

  const filteredWorkers = useMemo(
    () =>
      filterWorkers(workers, query, {
        serviceId: selectedServiceId,
        category: selectedCategory,
        availability: selectedAvailability,
      }),
    [workers, query, selectedServiceId, selectedCategory, selectedAvailability],
  );

  return (
    // <SafeAreaView style={styles.safeArea}>
     <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Search" subtitle="Find workers near you" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, location, or keyword"
          style={[styles.input, isInputFocused && styles.inputFocused]}
          selectionColor={colors.primary}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />

        {isLoading ? (
          <WorkerLoadState status="loading" />
        ) : error ? (
          <WorkerLoadState
            status="error"
            message="Please check your connection and try again."
            onRetry={retry}
          />
        ) : workers.length === 0 ? (
          <WorkerLoadState
            status="empty"
            message="There are no workers to display right now."
            onRetry={retry}
          />
        ) : filteredWorkers.length === 0 ? (
          <EmptyState title="No workers found" message="Try a different keyword or location." />
        ) : (
          <View>
            {/* {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))} */}
            {filteredWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onPress={() =>
                  router.push({
                    pathname: '/worker/[id]',
                    params: { id: worker.id },
                  })
                }
              />
            ))}
          </View>
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
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
});
