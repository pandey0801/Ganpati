
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { colors } from '@/constants/colors';

// import { supabase } from '../lib/supabase';
import supabase from '../lib/supabase';

export default function SupabaseTestScreen() {
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
        setError(err.message || 'Unable to fetch services');
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
        <Text style={styles.message}>Connecting to Supabase...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Connection or query failed</Text>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      <Text style={styles.success}>✓ Query completed successfully</Text>
      <Text style={styles.count}>
        Services fetched: {services.length}
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.message}>No services found. Check your table data.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.icon ? `${item.icon} ` : ''}
              {item.name}
            </Text>
            <Text style={styles.category}>
              Category: {item.category || 'Not specified'}
            </Text>
            <Text style={styles.description}>
              {item.description || 'No description'}
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
