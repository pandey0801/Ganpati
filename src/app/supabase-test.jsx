
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { colors } from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { translateServiceCategory, translateServiceName } from '@/i18n/serviceNames';

// import { supabase } from '../lib/supabase';
import supabase from '../lib/supabase';

export default function SupabaseTestScreen() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, description, category, icon')
          .order('name');

        if (error) {
          throw error;
        }

        setServices(data ?? []);
      } catch (err) {
        console.error('Supabase test failed:', err);
        setError('query-failed');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{t('supabaseTest.connecting')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{t('supabaseTest.connectionError')}</Text>
        <Text style={styles.message}>{t('supabaseTest.unableToFetch')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('supabaseTest.title')}</Text>
      <Text style={styles.success}>{t('supabaseTest.success')}</Text>
      <Text style={styles.count}>
        {t('supabaseTest.servicesFetched', { count: services.length })}
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.message}>{t('supabaseTest.empty')}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.icon ? `${item.icon} ` : ''}
              {translateServiceName(item.id, item.name, t)}
            </Text>
            <Text style={styles.category}>
              {t('supabaseTest.category', {
                category: translateServiceCategory(item.category, t) ?? t('supabaseTest.notSpecified'),
              })}
            </Text>
            <Text style={styles.description}>
              {item.description || t('supabaseTest.noDescription')}
            </Text>
            <Text style={styles.id}>ID: {item.id}</Text>
          </View>
        )}
      />
    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 35,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  success: {
    color: colors.success,
    fontSize: 16,
    marginBottom: 8,
  },
  count: {
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  category: {
    marginTop: 6,
    color: colors.textMuted,
  },
  description: {
    marginTop: 6,
    color: colors.text,
  },
  id: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
});




// import { StyleSheet, Text, View } from 'react-native';

// export default function SupabaseTestScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Supabase Test</Text>
//       <Text>Your test route is working!</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
// });
