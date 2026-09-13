import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '@/components/common/AppText';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import workersData from '@/data/workers.json';
import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

const featureItems = [
  { icon: 'shield-checkmark-outline', label: 'Verified Workers' },
  { icon: 'location-outline', label: 'Trusted & Local' },
  { icon: 'cash-outline', label: 'Affordable Pricing' },
];

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.navBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <AppText variant="subtitle" style={styles.navTitle}>
            Ganpati
          </AppText>

          <Pressable
            accessibilityRole="button"
            style={styles.iconButton}
            onPress={() => {}}
          >
            <Ionicons name="heart-outline" size={21} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.bannerCard}>
          <View style={styles.bannerTextWrap}>
            <AppText variant="title" style={styles.bannerTitle}>
              {service.name}
            </AppText>
            <AppText style={styles.bannerSubtitle}>
              {service.category || 'Cooling Solutions at Your Doorstep'}
            </AppText>
          </View>

          <View style={styles.bannerArtWrap}>
            <Image source={{ uri: service.image }} style={styles.bannerImage} />
          </View>
        </View>

        <View style={styles.featureRow}>
          {featureItems.map((item) => (
            <View key={item.label} style={styles.featurePill}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={14} color={colors.secondary} />
              <AppText style={styles.featureText}>{item.label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            {serviceWorkers.length} Workers Found
          </AppText>

          <Pressable style={styles.filterButton} accessibilityRole="button">
            <Ionicons name="filter-outline" size={15} color={colors.text} />
            <AppText style={styles.filterText}>Sort</AppText>
          </Pressable>
        </View>

        {serviceWorkers.length === 0 ? (
          <EmptyState title="No workers available" message="Please check back later." />
        ) : (
          serviceWorkers.map((worker) => (
            <Pressable
              key={worker.id}
              style={styles.workerCard}
              onPress={() => router.push({ pathname: '/worker/[id]', params: { id: worker.id } })}
            >
              <View style={styles.cardTopRow}>
                <Image source={{ uri: worker.image }} style={styles.avatar} />

                <Pressable
                  accessibilityRole="button"
                  style={styles.favoriteButton}
                  onPress={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.workerMeta}>
                <AppText variant="subtitle" style={styles.workerName}>
                  {worker.name}
                </AppText>
                {/* <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <AppText style={styles.ratingText}>
                    {worker.rating ?? 4.8} ({(worker.rating ? 120 : 96)} reviews)
                  </AppText>
                </View> */}
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={14} color={colors.textMuted} />
                <AppText style={styles.infoText}>5+ years experience</AppText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <AppText style={styles.infoText}>{worker.location}</AppText>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <AppText style={styles.statusText}>Available Today</AppText>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => Linking.openURL(`tel:${worker.phone}`)}
                >
                  <Ionicons name="call-outline" size={16} color={colors.text} />
                  <AppText style={styles.callButtonText}>Call</AppText>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={() =>
                    Linking.openURL(`https://wa.me/${worker.phone.replace(/[^\d]/g, '')}`)
                  }
                >
                  <Ionicons name="logo-whatsapp" size={16} color={colors.surface} />
                  <AppText style={styles.whatsappText}>WhatsApp</AppText>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF0',
  },
  navTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF4FE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bannerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 34,
  },
  bannerSubtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  bannerArtWrap: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(8, 123, 89, 0.08)',
  },
  bannerImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  featureRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 20,
    gap: 10,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  featureText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E7EBF0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  workerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7EBF0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#EEF6F7',
  },
  favoriteButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EBF0',
  },
  workerMeta: {
    marginBottom: 10,
  },
  workerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  statusRow: {
    marginTop: 10,
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: '#1E8E5A',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  callButton: {
    backgroundColor: '#EFF5F2',
    borderColor: '#E3F0EA',
  },
  callButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  whatsappButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  whatsappText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
