import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import ServiceIcon from '@/components/services/ServiceIcon';
import { colors } from '@/constants/colors';
import { Service } from '@/types/service';
import { localizeService } from '@/utils/serviceLocalization';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { i18n } = useTranslation();
  const localizedService = localizeService(
    service,
    i18n.resolvedLanguage ?? i18n.language,
  );

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: service.image }} style={styles.image} />
      <View style={styles.info}>
        <ServiceIcon
          icon={service.icon}
          size={24}
          textVariant="caption"
          textStyle={styles.icon}
        />
        <AppText variant="subtitle">{localizedService.name}</AppText>
        <AppText variant="small" style={styles.descriptionNumberOfLines}>
          {localizedService.description}
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
