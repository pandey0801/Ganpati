import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';


import AppText from '@/components/common/AppText';
import ServiceLoadState from '@/components/services/ServiceLoadState';
import { BUSINESS_WHATSAPP_NUMBER } from '@/constants/businessContact';
import { colors } from '@/constants/colors';
import { useServices } from '@/hooks/useServices';
import { setAppLanguage } from '@/i18n';
import { translateServiceCategory, translateServiceName } from '@/i18n/serviceNames';
import { Service } from '@/types/service';

const cardBorder = colors.border;

interface CategoryPresentation {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  order: number;
}

interface HomeCategory {
  id: string;
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji: string;
  tint: string;
  order: number;
}

const categoryPresentationByServiceId: Record<string, CategoryPresentation> = {
  'ac-repair': { id: 'ac-repair', name: 'AC Repair', icon: 'snow-outline', tint: '#EAF3FF', order: 0 },
  electrical: { id: 'electrical', name: 'Electrician', icon: 'flash-outline', tint: '#FFF8D8', order: 1 },
  plumbing: { id: 'plumbing', name: 'Plumber', icon: 'water-outline', tint: '#EAF6F3', order: 2 },
  painter: { id: 'painting', name: 'Painter', icon: 'brush-outline', tint: '#FDECF4', order: 3 },
  cctv: { id: 'cctv', name: 'CCTV', icon: 'videocam-outline', tint: '#EEF7FF', order: 4 },
  carpenter: { id: 'carpenter', name: 'Carpenter', icon: 'construct-outline', tint: '#F6F4FF', order: 5 },
  driver: { id: 'driver', name: 'Driver', icon: 'car-outline', tint: '#EEF8F2', order: 6 },
  cleaning: { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline', tint: '#EEF7FF', order: 7 },
  'home-appliance': { id: 'home-appliance', name: 'Home Appliance', icon: 'tv-outline', tint: '#F5F1FF', order: 8 },
  gardening: { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', tint: '#EAF9F2', order: 9 },
  'beauty-salon': { id: 'beauty-salon', name: 'Beauty & Salon', icon: 'sparkles-outline', tint: '#FFF1F7', order: 10 },
};

const categoryToServiceId: Record<string, string> = {
  'ac-repair': 'ac-repair',
  electrical: 'electrical',
  plumbing: 'plumbing',
  painting: 'painter',
  cctv: 'cctv',
  carpenter: 'carpenter',
  driver: 'driver',
  cleaning: 'cleaning',
  'home-appliance': 'home-appliance',
  gardening: 'gardening',
  'beauty-salon': 'beauty-salon',
};

const moreCategory = {
  id: 'more',
  name: 'More',
  icon: 'ellipsis-horizontal' as keyof typeof Ionicons.glyphMap,
  tint: '#F3F4F6',
};

function getHomeCategories(
  services: Service[],
  t: ReturnType<typeof useTranslation>['t'],
): HomeCategory[] {
  return services
    .map((service, index) => {
      const presentation = categoryPresentationByServiceId[service.id];

      return {
        id: presentation?.id ?? service.id,
        name: translateServiceName(service.id, presentation?.name ?? service.name, t),
        icon: presentation?.icon,
        emoji: service.icon,
        tint: presentation?.tint ?? '#F3F4F6',
        order: presentation?.order ?? Object.keys(categoryPresentationByServiceId).length + index,
      };
    })
    .sort((first, second) => first.order - second.order || first.name.localeCompare(second.name));
}



export default function HomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { services, isLoading, error, retry } = useServices();
  const screenWidth = Dimensions.get('window').width;
  const gridItemWidth = (screenWidth - 32 - 3 * 10) / 4;
  const homeCategories = useMemo(() => getHomeCategories(services, t), [services, t]);
  const popularCategories = homeCategories.filter((category) =>
    ['ac-repair', 'electrical', 'plumbing', 'painting'].includes(category.id),
  );
  const allCategories = [
    ...homeCategories,
    { ...moreCategory, name: t('home.more'), emoji: '', order: Number.MAX_SAFE_INTEGER },
  ];

  const navigateToServices = (categoryId?: string, query?: string) => {
    if (!categoryId && !query) {
      router.push('/services');
      return;
    }

    router.push({
      pathname: '/services',
      params: {
        ...(categoryId && categoryId !== 'more' ? { category: categoryId } : {}),
        ...(query && query.trim() ? { query: query.trim() } : {}),
      },
    });
  };

  const navigateToServiceDetail = (categoryId?: string) => {
    if (!categoryId || categoryId === 'more') {
      router.push('/services');
      return;
    }

    const serviceId = categoryToServiceId[categoryId] ?? categoryId;
    router.push({ pathname: '/service/[id]', params: { id: serviceId } });
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchText.trim();
    navigateToServices(undefined, trimmedQuery);
  };

  const handleLanguageToggle = () => {
    const nextLanguage = i18n.language === 'hi' ? 'en' : 'hi';
    void setAppLanguage(nextLanguage).catch((cause: unknown) => {
      console.error('Unable to save language preference:', cause);
      Alert.alert(t('language.saveErrorTitle'), t('language.saveErrorMessage'));
    });
  };

  const handleWhatsAppRegistration = async () => {
    const phoneNumber = BUSINESS_WHATSAPP_NUMBER.trim();
    if (!/^\d{8,15}$/.test(phoneNumber)) {
      Alert.alert(t('home.whatsappUnavailableTitle'), t('home.whatsappNumberNotConfigured'));
      return;
    }

    const message = [
      'Hello Ganpati Suvidha Team,',
      '',
      'I want to list my service on Ganpati Suvidha. Please guide me through the registration process.',
      // '',
      // 'My details are:',
      // 'Name:',
      // 'Mobile Number:',
      // 'Service Category:',
      // 'City / Locality:',
      // 'Short Description of Service:',
      // '',
      // 'Please guide me through the registration process.',
      '',
      'Thank you.',
    ].join('\n');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    const webWhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch (cause) {
      if (__DEV__) {
        console.warn('[home] Unable to open WhatsApp link', {
          errorType: cause instanceof Error ? cause.name : typeof cause,
        });
      }

      try {
        await Linking.openURL(webWhatsAppUrl);
      } catch (fallbackCause) {
        if (__DEV__) {
          console.warn('[home] Unable to open WhatsApp Web link', {
            errorType: fallbackCause instanceof Error ? fallbackCause.name : typeof fallbackCause,
          });
        }
        Alert.alert(t('home.whatsappUnavailableTitle'), t('home.whatsappOpenError'));
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.headerTextWrap}>
        <AppText style={styles.brandName}>Ganpati</AppText>
        <View style={styles.locationRow}>
          <AppText style={styles.locationText}>📍 {t('home.location')}</AppText>
          <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
        </View>
      </View>

      <View style={styles.headerActions}>
        <Pressable
          style={styles.languageButton}
          accessibilityRole="button"
          accessibilityLabel={t(i18n.language === 'hi' ? 'language.switchToEnglish' : 'language.switchToHindi')}
          hitSlop={4}
          onPress={handleLanguageToggle}
        >
          <AppText style={styles.languageButtonText}>
            {t(i18n.language === 'hi' ? 'language.english' : 'language.hindi')}
          </AppText>
        </Pressable>
        <Pressable
          style={styles.notificationButton}
          accessibilityRole="button"
          accessibilityLabel={t('home.notification')}
          onPress={() => {}}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );

  const searchResults = useMemo(() => {
  const query = searchText.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return services
    .filter((service) => {
      const name = service.name?.toLowerCase() ?? '';
      const description = service.description?.toLowerCase() ?? '';
      const category = service.category?.toLowerCase() ?? '';
      const id = service.id?.toLowerCase() ?? '';
      const localizedName = translateServiceName(service.id, service.name, t).toLowerCase();
      const localizedCategory = translateServiceCategory(service.category, t)?.toLowerCase() ?? '';

      return (
        name.includes(query) ||
        localizedName.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        localizedCategory.includes(query) ||
        id.includes(query)
      );
    })
    .slice(0, 8)
    .map((service) => ({
      id: service.id,
      title: translateServiceName(service.id, service.name, t),
      subtitle: translateServiceCategory(service.category, t) ?? t('common.service'),
      route: {
        pathname: '/service/[id]' as const,
        params: { id: service.id },
      },
    }));
  }, [searchText, services, t]);

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.stateScreenContent}>
          {renderHeader()}
          <ServiceLoadState status="loading" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.stateScreenContent}>
          {renderHeader()}
          <ServiceLoadState status="error" message={t('common.checkConnection')} onRetry={retry} />
        </View>
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.stateScreenContent}>
          {renderHeader()}
          <ServiceLoadState
            status="empty"
            message={t('services.noneAvailable')}
            onRetry={retry}
          />
        </View>
      </View>
    );
  }

  return (
    // <SafeAreaView style={styles.safeArea}>
      <View style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderHeader()}

        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          {/* <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor="#8C939C"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            onPressIn={() => {
              if (!searchText.trim()) {
                setSearchText('');
              }
            }}
          /> */}

           <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#8C939C"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              blurOnSubmit={false}
              selectionColor={colors.primary}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={handleSearchSubmit}
            />
        </View>

        {searchText.trim() !== '' && (
          <View style={styles.searchResults}>
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <Pressable
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => {
                    setSearchText('');
                    router.push(result.route);
                  }}
                >
                  <View style={styles.searchResultIcon}>
                    <Ionicons name="construct-outline" size={18} color={colors.primary} />
                  </View>

                  <View style={styles.searchResultText}>
                    <AppText style={styles.searchResultTitle}>{result.title}</AppText>
                    <AppText style={styles.searchResultCategory}>{result.subtitle}</AppText>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              ))
            ) : (
              <View style={styles.noSearchResult}>
                <AppText style={styles.noSearchResultText}>{t('home.noServicesFound')}</AppText>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{t('home.popularCategories')}</AppText>
          <Pressable onPress={() => navigateToServices()}>
            <AppText style={styles.seeAll}>{t('home.seeAll')}</AppText>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          bounces={false}
        >
          {popularCategories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.popularCard}
              onPress={() => navigateToServiceDetail(category.id)}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: category.tint }]}>
                {category.icon ? (
                  <Ionicons name={category.icon} size={20} color={colors.primary} />
                ) : (
                  <AppText style={styles.categoryEmoji}>{category.emoji}</AppText>
                )}
              </View>
              <AppText style={styles.categoryLabel}>{category.name}</AppText>
            </Pressable>
          ))}
        </ScrollView>
{/* 
        <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <AppText style={styles.bannerTitle}>{t('home.bannerTitle')}</AppText>

              <AppText style={styles.bannerSubtitle}>{t('home.bannerSubtitle')}</AppText>

              <Pressable
                style={styles.bannerAction}
                onPress={() => navigateToServices()}
              >
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.bannerImageWrapper}>
              <Image
                source={require('../../../assets/images/man1.png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View> */}

        <View style={styles.bannerWrapper}>
          <LinearGradient
            // start={{ x: 0, y: 0 }}
            // end={{ x: 1, y: 0 }}
            // style={styles.banner}
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }} // Starts at the far left
            end={{ x: 1, y: 0 }}   // Ends at the far right
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <AppText style={styles.bannerTitle}>{t('home.bannerTitle')}</AppText>

              <AppText style={styles.bannerSubtitle}>{t('home.bannerSubtitle')}</AppText>

              <Pressable
                style={styles.bannerAction}
                onPress={() => navigateToServices()}
              >
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.bannerImageWrapper}>
              <Image
                source={require('../../../assets/images/man1.png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.sectionHeaderTopSpacing}>
          <AppText style={styles.sectionTitle}>{t('home.allCategories')}</AppText>
        </View>

        <View style={styles.gridContainer}>
          {allCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.gridItem, { width: gridItemWidth }]}
              onPress={() => navigateToServiceDetail(category.id)}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: category.tint }]}>
                {category.icon ? (
                  <Ionicons name={category.icon} size={17} color={colors.primary} />
                ) : (
                  <AppText style={styles.categoryEmoji}>{category.emoji}</AppText>
                )}
              </View>
              <AppText style={styles.gridLabel}>{category.name}</AppText>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.otherServicesButton} onPress={() => navigateToServices()}>
          <View style={styles.otherServicesLeft}>
            <Ionicons name="grid-outline" size={18} color={colors.text} />
            <AppText style={styles.otherServicesText}>{t('home.otherServices')}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.whatsappBanner}>
          <View style={styles.promoContent}>
            <View style={styles.whatsappIcon}>
              <Ionicons name="logo-whatsapp" size={23} color="#198754" />
            </View>
            <View style={styles.promoTextWrap}>
              <AppText style={styles.promoTitle}>{t('home.whatsappTitle')}</AppText>
              <AppText style={styles.promoText}>{t('home.whatsappSubtitle')}</AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleWhatsAppRegistration()}
                style={styles.whatsappButton}
              >
                <Ionicons name="logo-whatsapp" size={17} color={colors.surface} />
                <AppText style={styles.whatsappButtonText}>
                  {t('home.whatsappContinue')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('home.listBusiness')}. ${t('home.registerWorker')}`}
          style={styles.promoBanner}
          onPress={() => router.push('/worker/register')}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoIcon}>
              <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.promoTextWrap}>
              <AppText style={styles.promoTitle}>{t('home.listBusiness')}</AppText>
              <AppText style={styles.promoText}>
                {t('home.listBusinessSubtitle')}
              </AppText>
              <View style={styles.promoButton}>
                <AppText style={styles.promoButtonText}>{t('home.registerWorker')}</AppText>
                <Ionicons name="arrow-forward" size={16} color={colors.text} />
              </View>
            </View>
          </View>
        </Pressable> */}

        {/* <Pressable
  onPress={() => router.push('/supabase-test')}
  style={{
    backgroundColor: colors.primary,
    padding: 14,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  }}
>
  <AppText style={{ color: colors.text, fontWeight: 'bold' }}>
  {t('home.testSupabase')}
  </AppText>
</Pressable> */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateScreenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginRight: 4,
  },
  notificationButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: cardBorder,
    shadowColor: '#1F2937',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  languageButton: {
    minHeight: 44,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: 14,
    shadowColor: '#17212B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchBarFocused: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
    lineHeight: 18,
    paddingVertical: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryRow: {
    paddingRight: 8,
    paddingBottom: 6,
    paddingTop: 2,
    alignItems: 'flex-start',
  },
  popularCard: {
    width: 82,
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 2,
  },
  categoryIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },

bannerWrapper: {
  marginTop: 20,
  width: '100%',
},

// banner: {
//   height: 150,
//   width: '100%',
//   backgroundColor: colors.primary,
//   borderRadius: 20,
//   overflow: 'hidden',

//   flexDirection: 'row',
//   alignItems: 'stretch',
//   justifyContent: 'space-between',

//   shadowColor: '#C65D0A',
//   shadowOpacity: 0.12,
//   shadowRadius: 12,
//   shadowOffset: {
//     width: 0,
//     height: 8,
//   },
//   elevation: 3,
// },

banner: {
    height: 150,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    // backgroundColor is supplied by the banner gradient.
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

bannerContent: {
  flex: 1,
  paddingLeft: 18,
  paddingTop: 10,
  paddingBottom: 3,
  zIndex: 2,
},

bannerTitle: {
  color: colors.text,
  fontSize: 18,
  lineHeight: 23,
  fontWeight: '800',
},

bannerSubtitle: {
  marginTop: 6,
  color: colors.text,
  fontSize: 11,
  fontWeight: '600',
  letterSpacing: 0.2,
},

bannerAction: {
  marginTop: 1,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.surface,

  justifyContent: 'center',
  alignItems: 'center',

  alignSelf: 'flex-start',

  shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2, // Android shadow
},

// bannerImageWrapper: {
//   width: 145,
//   height: '100%',

//   justifyContent: 'flex-end',
//   alignItems: 'center',

//   marginRight: 2,
// },

// bannerImage: {
//   width: 155,
//   height: 155,

//   position: 'absolute',
//   bottom: -1,
//   right: -5,
// },

// bannerImageWrapper: {
//   width: 150,
//   height: '100%',
//   justifyContent: 'flex-end',
//   alignItems: 'center',
//   marginRight: 0,
//   overflow: 'hidden',
// },

bannerImageWrapper: {
  width: 140,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  paddingRight: 10,
},
// avatarCircle: {
//   width: 110,
//   height: 110,
//   borderRadius: 55,
//   overflow: 'hidden',
//   backgroundColor: 'rgba(255, 255, 255, 0.2)', // Soft white glow ring
//   borderWidth: 2,
//   borderColor: 'rgba(255, 255, 255, 0.4)',
//   justifyContent: 'center',
//   alignItems: 'center',
// },
bannerImage: {
       position: 'absolute',
        bottom: -5,
        right: -10, // Pushes it completely to the right edge
        width: 160, // Adjust this based on your transparent PNG
        height: 155,
        zIndex: 1,
  },
// bannerImage: {
//   width: 170,
//   height: 170,
//   position: 'absolute',
//   bottom: -5,
//   right: -8,
// },

// bannerImage: {
//   width: 110,
//   height: 110,
// },

  bannerArtWrapper: {
    width: 120,
    height: 106,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bannerArt: {
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artHead: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE1C7',
    position: 'absolute',
    top: 16,
  },
  artBody: {
    width: 52,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#FAD0A8',
    position: 'absolute',
    top: 38,
  },
  artBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F4B77F',
    position: 'absolute',
    right: 16,
    top: 46,
  },
  sectionHeaderTopSpacing: {
    marginTop: 22,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: cardBorder,
    minHeight: 88,
    marginBottom: 0,
  },
  gridIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  otherServicesButton: {
    marginTop: 20,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  otherServicesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otherServicesText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  
promoBanner: {
  backgroundColor: colors.primaryLight,
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 14,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 0,
  borderWidth: 1,
  borderColor: '#F4D1B2',
},
whatsappBanner: {
  backgroundColor: colors.surface,
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 14,
  marginHorizontal: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: '#F4D1B2',
},
whatsappIcon: {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: '#E8F5EC',
  alignItems: 'center',
  justifyContent: 'center',
},
promoContent: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
},
promoIcon: {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: colors.surface,
  alignItems: 'center',
  justifyContent: 'center',
},
promoTextWrap: {
  flex: 1,
},
promoTitle: {
  fontSize: 16,
  lineHeight: 21,
  fontWeight: '700',
  color: colors.text,
},
promoText: {
  marginTop: 3,
  fontSize: 13,
  lineHeight: 18,
  color: colors.textMuted,
},
promoButton: {
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
  backgroundColor: colors.primary,
  borderRadius: 12,
  paddingHorizontal: 13,
  paddingVertical: 10,
},
promoButtonText: {
flexShrink: 1,
color: colors.text,
fontSize: 13,
  fontWeight: '700',
},
whatsappButton: {
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
  backgroundColor: '#198754',
  borderRadius: 12,
  paddingHorizontal: 13,
  paddingVertical: 10,
},
whatsappButtonText: {
  flexShrink: 1,
  color: colors.surface,
  fontSize: 13,
  fontWeight: '700',
},

searchResults: {
  backgroundColor: colors.surface,
  borderRadius: 14,
  marginTop: 8,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: cardBorder,
  overflow: 'hidden',
},

searchResultItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: cardBorder,
},

searchResultIcon: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: colors.primaryLight,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},

searchResultText: {
  flex: 1,
},

searchResultTitle: {
  fontSize: 15,
  fontWeight: '600',
},

searchResultCategory: {
  fontSize: 12,
  color: colors.textMuted,
  marginTop: 2,
},

noSearchResult: {
  padding: 16,
  alignItems: 'center',
},

noSearchResultText: {
  color: colors.textMuted,
},
});
