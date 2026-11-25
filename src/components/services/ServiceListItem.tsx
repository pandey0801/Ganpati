import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import ServiceIcon from '@/components/services/ServiceIcon';
import { colors } from '@/constants/colors';
import { Service } from '@/types/service';
import { localizeService } from '@/utils/serviceLocalization';
import { useTranslation } from 'react-i18next';

interface ServiceListItemProps {
  service: Service;
  onPress?: () => void;
}

export default function ServiceListItem({ service, onPress }: ServiceListItemProps) {
  const { i18n } = useTranslation();
  const localizedService = localizeService(
    service,
    i18n.resolvedLanguage ?? i18n.language,
  );

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.iconWrap}>
        <ServiceIcon icon={service.icon} size={22} textStyle={styles.icon} />
      </View>
      <View style={styles.content}>
        <AppText variant="subtitle">{localizedService.name}</AppText>
        <AppText variant="small" style={styles.description}>
          {localizedService.description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  description: {
    color: colors.textMuted,
    marginTop: 4,
  },
});
