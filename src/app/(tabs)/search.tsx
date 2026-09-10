import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import WorkerCard from '@/components/workers/WorkerCard';
import { colors } from '@/constants/colors';
import workersData from '@/data/workers.json';
import { filterWorkers } from '@/utils/search';
import { Worker } from '@/types/worker';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const workers = workersData as Worker[];

  const filteredWorkers = useMemo(() => filterWorkers(workers, query), [workers, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Search" subtitle="Find workers near you" />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, location, or keyword"
          style={styles.input}
        />

        {filteredWorkers.length === 0 ? (
          <EmptyState title="No workers found" message="Try a different keyword or location." />
        ) : (
          <View>
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </View>
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
