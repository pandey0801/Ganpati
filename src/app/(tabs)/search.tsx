import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
// import { SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';


// import { SafeAreaView } from 'react-native-safe-area-context';


import AppHeader from '@/components/common/AppHeader';
import EmptyState from '@/components/common/EmptyState';
import WorkerLoadState from '@/components/workers/WorkerLoadState';
import WorkerCard from '@/components/workers/WorkerCard';
import { colors } from '@/constants/colors';
import { useWorkers } from '@/hooks/useWorkers';
import { translateServiceName } from '@/i18n/serviceNames';
import { filterWorkers } from '@/utils/search';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
      },
      (worker) =>
        worker.service
          ? translateServiceName(worker.service.id, worker.service.name, t)
          : ''),
    [workers, query, selectedServiceId, selectedCategory, selectedAvailability, t],
  );

  return (
    // <SafeAreaView style={styles.safeArea}>
     <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title={t('search.title')} subtitle={t('search.subtitle')} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
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
            message={t('common.checkConnection')}
            onRetry={retry}
          />
        ) : workers.length === 0 ? (
          <WorkerLoadState
            status="empty"
            message={t('workerLoad.empty')}
            onRetry={retry}
          />
        ) : filteredWorkers.length === 0 ? (
          <EmptyState title={t('search.noWorkersTitle')} message={t('search.noWorkersMessage')} />
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
