import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { DONATION_ADMIN_WHATSAPP_NUMBER } from '@/constants/businessContact';
import { colors } from '@/constants/colors';

export default function DonationBanner() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleDonate = async () => {
    const phoneNumber = DONATION_ADMIN_WHATSAPP_NUMBER.trim();
    if (!/^\d{8,15}$/.test(phoneNumber)) {
      Alert.alert(t('donation.whatsappUnavailableTitle'), t('donation.whatsappNumberNotConfigured'));
      return;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      t('donation.whatsappMessage'),
    )}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch (cause) {
      if (__DEV__) {
        console.warn('[donation] Unable to open WhatsApp link', {
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }
      Alert.alert(t('donation.whatsappUnavailableTitle'), t('donation.whatsappOpenError'));
    }
  };

  return (
    <LinearGradient
      colors={['#FFF8EC', '#FFE1BC', '#F6A34F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.intro}>
        <View style={styles.copy}>
          <AppText style={styles.title}>{t('donation.heading')}</AppText>
          <AppText style={styles.description}>{t('donation.description')}</AppText>
        </View>
        <View style={styles.illustrationWrap} pointerEvents="none">
          <Image
            source={require('../../../assets/images/ganpati-icon.png')}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel={t('donation.illustration')}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => void handleDonate()}
          style={({ pressed }) => [styles.actionButton, styles.donateButton, pressed && styles.pressed]}
        >
          <Ionicons name="logo-whatsapp" size={17} color={colors.surface} />
          <AppText style={[styles.actionText, styles.donateText]}>{t('donation.donate')}</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/donation-list')}
          style={({ pressed }) => [styles.actionButton, styles.listButton, pressed && styles.pressed]}
        >
          <Ionicons name="people-outline" size={17} color={colors.primaryDark} />
          <AppText style={styles.actionText}>{t('donation.viewList')}</AppText>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    marginTop: 16,
    marginBottom: 2,
    padding: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  intro: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
    zIndex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  description: {
    marginTop: 5,
    color: '#563B2A',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  illustrationWrap: {
    width: 94,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  illustration: {
    width: 86,
    height: 98,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: 13,
  },
  donateButton: {
    backgroundColor: colors.primaryDark,
  },
  listButton: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,10,0.18)',
  },
  actionText: {
    flexShrink: 1,
    color: colors.primaryDark,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  donateText: {
    color: colors.surface,
  },
  pressed: {
    opacity: 0.82,
  },
});
