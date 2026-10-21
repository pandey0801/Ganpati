import React from 'react';
import { Linking } from 'react-native';
import { StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import { useTranslation } from 'react-i18next';

interface ContactButtonsProps {
  phone: string;
}

export default function ContactButtons({ phone }: ContactButtonsProps) {
  const { t } = useTranslation();
  const phoneNumber = phone.replace(/[^\d+]/g, '');
  const whatsappNumber = phone.replace(/[^\d]/g, '');
  const openContactLink = (url: string) => {
    void Linking.openURL(url).catch((error: unknown) => {
      if (__DEV__) {
        console.error('Unable to open worker contact link:', error);
      }
    });
  };

  return (
    <View style={styles.container}>
      <AppButton
        title={t('contact.call')}
        style={styles.button}
        onPress={() => openContactLink(`tel:${phoneNumber}`)}
      />
      <AppButton
        title={t('contact.message')}
        style={[styles.button, styles.whatsappButton]}
        onPress={() => openContactLink(`https://wa.me/${whatsappNumber}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
  },
  whatsappButton: {
    backgroundColor: '#198754',
  },
});
