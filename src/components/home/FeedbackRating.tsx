import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import { FEEDBACK_FORM_URL, PLAY_STORE_LISTING_URL } from '@/constants/feedbackRating';

export default function FeedbackRating() {
  const { t } = useTranslation();

  const openExternalUrl = async (
    url: string,
    unavailableTitle: string,
    openError: string,
  ) => {
    try {
      await Linking.openURL(url);
    } catch (cause) {
      if (__DEV__) {
        console.warn('[feedback-rating] Unable to open external link', {
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }
      Alert.alert(unavailableTitle, openError);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headingWrap}>
        <AppText style={styles.heading}>{t('feedbackRating.heading')}</AppText>
        <AppText style={styles.subtitle}>{t('feedbackRating.subtitle')}</AppText>
      </View>

      <View style={styles.cards}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void openExternalUrl(
              FEEDBACK_FORM_URL,
              t('feedbackRating.feedbackUnavailableTitle'),
              t('feedbackRating.feedbackOpenError'),
            )
          }
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={21} color={colors.primaryDark} />
          <AppText style={styles.cardText}>{t('feedbackRating.feedback')}</AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void openExternalUrl(
              PLAY_STORE_LISTING_URL,
              t('feedbackRating.rateUnavailableTitle'),
              t('feedbackRating.rateOpenError'),
            )
          }
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Ionicons name="star-outline" size={21} color={colors.primaryDark} />
          <AppText style={styles.cardText}>{t('feedbackRating.rateApp')}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginTop: 16,
    marginBottom: 4,
  },
  headingWrap: {
    marginBottom: 10,
  },
  heading: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  cards: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    height: 58,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#17212B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardText: {
    flexShrink: 1,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
