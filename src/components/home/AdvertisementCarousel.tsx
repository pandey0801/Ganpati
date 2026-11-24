import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors } from '@/constants/colors';
import { getAdvertisements } from '@/services/adsService';
import { Advertisement } from '@/types/advertisement';

function getValidClickUrl(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.hostname &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

export default function AdvertisementCarousel() {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = Math.max(0, screenWidth - 32);
  const itemHeight = itemWidth * (2 / 3);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [failedImageIds, setFailedImageIds] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const currentIndexRef = useRef(0);
  const isInteractingRef = useRef(false);
  const listRef = useRef<FlatList<Advertisement>>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleAdvertisements = advertisements.filter(
    (advertisement) => !failedImageIds.has(advertisement.id),
  );

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      setIsLoading(true);
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      setFailedImageIds(new Set());

      void getAdvertisements()
        .then((fetchedAdvertisements) => {
          if (isFocused) {
            setAdvertisements(fetchedAdvertisements);
          }
        })
        .catch((cause: unknown) => {
          if (__DEV__) {
            console.error('[ads] Unable to load advertisements from Supabase', cause);
          }
          if (isFocused) {
            setAdvertisements([]);
          }
        })
        .finally(() => {
          if (isFocused) {
            setIsLoading(false);
          }
        });

      return () => {
        isFocused = false;
      };
    }, []),
  );

  useEffect(() => {
    if (visibleAdvertisements.length === 0 || currentIndex >= visibleAdvertisements.length) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [currentIndex, visibleAdvertisements.length]);

  useEffect(() => {
    if (visibleAdvertisements.length < 2 || isInteracting) {
      return;
    }

    const timer = setInterval(() => {
      if (isInteractingRef.current) {
        return;
      }
      const nextIndex = (currentIndexRef.current + 1) % visibleAdvertisements.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      listRef.current?.scrollToOffset({ offset: nextIndex * itemWidth, animated: true });
    }, 4500);

    return () => clearInterval(timer);
  }, [visibleAdvertisements.length, isInteracting, itemWidth]);

  useEffect(
    () => () => {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    },
    [],
  );

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
    const url = getValidClickUrl(advertisement.clickUrl);
    if (!url) {
      Alert.alert(t('advertisements.unavailableTitle'), t('advertisements.invalidDestination'));
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (cause) {
      if (__DEV__) {
        console.warn('[ads] Unable to open advertisement destination', {
          advertisementId: advertisement.id,
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (visibleAdvertisements.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={visibleAdvertisements}
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
            accessibilityLabel={`${item.title}. ${item.description}`}
            onPress={() => void openAdvertisement(item)}
            onPressIn={pauseCarousel}
            onPressOut={resumeCarouselSoon}
            style={[styles.card, { width: itemWidth, height: itemHeight }]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              accessible={false}
              onError={() => {
                if (__DEV__) {
                  console.warn('[ads] Unable to load advertisement image', {
                    advertisementId: item.id,
                  });
                }
                setFailedImageIds((current) => new Set(current).add(item.id));
              }}
            />
          </Pressable>
        )}
        scrollEventThrottle={100}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, itemWidth));
          if (index >= 0 && index < visibleAdvertisements.length) {
            currentIndexRef.current = index;
            setCurrentIndex((current) => (current === index ? current : index));
          }
        }}
        onScrollBeginDrag={pauseCarousel}
        onScrollEndDrag={resumeCarouselSoon}
        onMomentumScrollBegin={pauseCarousel}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, itemWidth));
          const nextIndex = Math.min(index, visibleAdvertisements.length - 1);
          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
          resumeCarousel();
        }}
      />
      {visibleAdvertisements.length > 1 && (
        <View style={styles.pagination}>
          {visibleAdvertisements.map((advertisement, index) => (
            <Pressable
              key={advertisement.id}
              accessibilityRole="button"
              accessibilityLabel={t('advertisements.pageLabel', {
                current: index + 1,
                total: visibleAdvertisements.length,
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
    minHeight: 24,
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
