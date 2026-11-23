import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { advertisements, type Advertisement } from '@/constants/advertisements';
import { colors } from '@/constants/colors';

const INTERNAL_ROUTES = ['/', '/services', '/search'] as const;
type InternalRoute = (typeof INTERNAL_ROUTES)[number];

type AdvertisementDestination =
  | { type: 'internal'; route: InternalRoute }
  | { type: 'external'; url: string };

function isInternalRoute(value: string): value is InternalRoute {
  return (INTERNAL_ROUTES as readonly string[]).includes(value);
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function getDestination(advertisement: Advertisement): AdvertisementDestination | null {
  const value = advertisement.actionUrl.trim();

  switch (advertisement.actionType) {
    case 'website': {
      const url = parseHttpsUrl(value);
      return url ? { type: 'external', url: url.href } : null;
    }
    case 'maps': {
      const url = parseHttpsUrl(value);
      const isGoogleMapsLink =
        url?.hostname === 'maps.app.goo.gl' ||
        (url !== null &&
          ['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) &&
          url.pathname.startsWith('/maps'));
      return url && isGoogleMapsLink
        ? { type: 'external', url: url.href }
        : null;
    }
    case 'whatsapp': {
      const phoneNumber = /^\d{8,15}$/.test(value) ? value : null;
      if (phoneNumber) {
        return { type: 'external', url: `https://wa.me/${phoneNumber}` };
      }

      const url = parseHttpsUrl(value);
      return url && url.hostname === 'wa.me' && /^\/\d{8,15}$/.test(url.pathname)
        ? { type: 'external', url: url.href }
        : null;
    }
    case 'phone': {
      if (!/^\+?[\d\s()-]{7,20}$/.test(value)) {
        return null;
      }
      const phoneNumber = value.replace(/[\s()-]/g, '');
      const digits = phoneNumber.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15
        ? { type: 'external', url: `tel:${phoneNumber}` }
        : null;
    }
    case 'internal':
      return isInternalRoute(value) ? { type: 'internal', route: value } : null;
    default:
      return null;
  }
}

export default function AdvertisementCarousel() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const language = i18n.resolvedLanguage === 'hi' ? 'hi' : 'en';
  const activeAdvertisements = advertisements.filter((advertisement) => advertisement.active);
  const itemWidth = Math.max(0, screenWidth - 32);
  const itemHeight = itemWidth * (2 / 3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const currentIndexRef = useRef(0);
  const isInteractingRef = useRef(false);
  const listRef = useRef<FlatList<Advertisement>>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeAdvertisements.length < 2 || isInteracting) {
      return;
    }

    const timer = setInterval(() => {
      if (isInteractingRef.current) {
        return;
      }
      const nextIndex = (currentIndexRef.current + 1) % activeAdvertisements.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      listRef.current?.scrollToOffset({ offset: nextIndex * itemWidth, animated: true });
    }, 4500);

    return () => clearInterval(timer);
  }, [activeAdvertisements.length, isInteracting, itemWidth]);

  useEffect(
    () => () => {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    },
    [],
  );

  if (activeAdvertisements.length === 0) {
    return null;
  }

  const pauseCarousel = () => {
    isInteractingRef.current = true;
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setIsInteracting(true);
  };

  const resumeCarousel = () => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    isInteractingRef.current = false;
    setIsInteracting(false);
  };

  const resumeCarouselSoon = () => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }
    resumeTimer.current = setTimeout(resumeCarousel, 1000);
  };

  const openAdvertisement = async (advertisement: Advertisement) => {
    const destination = getDestination(advertisement);
    if (!destination) {
      Alert.alert(t('advertisements.unavailableTitle'), t('advertisements.invalidDestination'));
      return;
    }

    if (destination.type === 'internal') {
      router.push(destination.route);
      return;
    }

    try {
      await Linking.openURL(destination.url);
    } catch (cause) {
      if (__DEV__) {
        console.warn('[advertisements] Unable to open advertisement destination', {
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }
      Alert.alert(t('advertisements.unavailableTitle'), t('advertisements.openError'));
    }
  };

  const scrollToIndex = (index: number) => {
    pauseCarousel();
    currentIndexRef.current = index;
    setCurrentIndex(index);
    listRef.current?.scrollToOffset({ offset: index * itemWidth, animated: true });
    resumeTimer.current = setTimeout(resumeCarousel, 1000);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={activeAdvertisements}
        horizontal
        pagingEnabled
        snapToInterval={itemWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('advertisements.imageLabel', {
              business: item.businessName[language],
              title: item.title[language],
              description: item.description[language],
            })}
            onPress={() => void openAdvertisement(item)}
            onPressIn={pauseCarousel}
            onPressOut={resumeCarouselSoon}
            style={[styles.card, { width: itemWidth, height: itemHeight }]}
          >
            <Image
              source={item.image[language]}
              style={styles.image}
              resizeMode="cover"
              accessible={false}
            />
          </Pressable>
        )}
        scrollEventThrottle={100}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, itemWidth));
          if (index >= 0 && index < activeAdvertisements.length) {
            currentIndexRef.current = index;
            setCurrentIndex((current) => (current === index ? current : index));
          }
        }}
        onScrollBeginDrag={pauseCarousel}
        onScrollEndDrag={resumeCarouselSoon}
        onMomentumScrollBegin={pauseCarousel}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, itemWidth));
          const nextIndex = Math.min(index, activeAdvertisements.length - 1);
          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
          resumeCarousel();
        }}
      />
      {activeAdvertisements.length > 1 && (
        <View style={styles.pagination}>
          {activeAdvertisements.map((advertisement, index) => (
            <Pressable
              key={advertisement.id}
              accessibilityRole="button"
              accessibilityLabel={t('advertisements.pageLabel', {
                current: index + 1,
                total: activeAdvertisements.length,
              })}
              accessibilityState={{ selected: currentIndex === index }}
              onPress={() => scrollToIndex(index)}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 18,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 24,
    marginTop: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E4C8A8',
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
});
