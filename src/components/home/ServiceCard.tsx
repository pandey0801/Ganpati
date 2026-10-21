import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { translateServiceName } from '@/i18n/serviceNames';
import { Service } from '@/types/service';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: service.image }} style={styles.image} />
      <View style={styles.info}>
        <AppText variant="caption" style={styles.icon}>{service.icon}</AppText>
        <AppText variant="subtitle">{translateServiceName(service.id, service.name, t)}</AppText>
        <AppText variant="small" style={styles.descriptionNumberOfLines}>
          {service.description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 120,
  },
  info: {
    padding: 16,
    gap: 6,
  },
  icon: {
    fontSize: 24,
  },
  descriptionNumberOfLines: {
    color: colors.textMuted,
  },
});
