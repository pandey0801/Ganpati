import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
   Linking
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '@/components/common/AppText';
import { colors } from '@/constants/colors';
import servicesData from '@/data/services.json';
import { Service } from '@/types/service';
import { filterServices } from '@/utils/search';

const brandGreen = '#087B59';
const cardBorder = '#E7EBF0';

const categoryDefinitions = [
  { id: 'ac-repair', name: 'AC Repair', icon: 'snow-outline', tint: '#EAF3FF' },
  { id: 'electrical', name: 'Electrician', icon: 'flash-outline', tint: '#FFF8D8' },
  { id: 'plumbing', name: 'Plumber', icon: 'water-outline', tint: '#EAF6F3' },
  { id: 'painting', name: 'Painter', icon: 'brush-outline', tint: '#FDECF4' },
  { id: 'cctv', name: 'CCTV', icon: 'videocam-outline', tint: '#EEF7FF' },
  { id: 'carpenter', name: 'Carpenter', icon: 'construct-outline', tint: '#F6F4FF' },
  { id: 'driver', name: 'Driver', icon: 'car-outline', tint: '#EEF8F2' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline', tint: '#EEF7FF' },
  { id: 'home-appliance', name: 'Home Appliance', icon: 'tv-outline', tint: '#F5F1FF' },
  { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', tint: '#EAF9F2' },
  { id: 'beauty-salon', name: 'Beauty & Salon', icon: 'sparkles-outline', tint: '#FFF1F7' },
  { id: 'more', name: 'More', icon: 'ellipsis-horizontal', tint: '#F3F4F6' },
] as const;

const popularCategories = categoryDefinitions.filter((category) =>
  ['ac-repair', 'electrical', 'plumbing', 'painting'].includes(category.id),
);

const allCategories = categoryDefinitions;

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



export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const screenWidth = Dimensions.get('window').width;
  const gridItemWidth = (screenWidth - 32 - 3 * 10) / 4;

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

  const services = servicesData as Service[];

  // const searchResults = React.useMemo(() => {
  //   const trimmedQuery = searchText.trim();

  //   if (!trimmedQuery) {
  //     return [];
  //   }

  //   return filterServices(services, trimmedQuery)
  //     .slice(0, 8)
  //     .map((service) => ({
  //       id: service.id,
  //       title: service.name,
  //       subtitle: service.category ?? 'Service',
  //       route: { pathname: '/service/[id]' as const, params: { id: service.id } },
  //     }));
  // }, [searchText, services]);

  const searchResults = React.useMemo(() => {
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

      return (
        name.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        id.includes(query)
      );
    })
    .slice(0, 8)
    .map((service) => ({
      id: service.id,
      title: service.name,
      subtitle: service.category ?? 'Service',
      route: {
        pathname: '/service/[id]' as const,
        params: { id: service.id },
      },
    }));
}, [searchText, services]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <AppText style={styles.brandName}>Ganpati</AppText>
            <View style={styles.locationRow}>
              <AppText style={styles.locationText}>📍 Ambikapur, Chhattisgarh</AppText>
              <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
            </View>
          </View>

          <Pressable style={styles.notificationButton} accessibilityRole="button" onPress={() => {}}>
            <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          {/* <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholder="Search for services"
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
              placeholder="Search for services"
              placeholderTextColor="#8C939C"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              blurOnSubmit={false}
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
                    <Ionicons name="construct-outline" size={18} color={brandGreen} />
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
                <AppText style={styles.noSearchResultText}>No services found</AppText>
              </View>
            )}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Popular Categories</AppText>
          <Pressable onPress={() => navigateToServices()}>
            <AppText style={styles.seeAll}>See All</AppText>
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
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={20} color={brandGreen} />
              </View>
              <AppText style={styles.categoryLabel}>{category.name}</AppText>
            </Pressable>
          ))}
        </ScrollView>
{/* 
         <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
           
                  <AppText style={styles.bannerTitle}>
        Trusted{"\n"}Local Workers{"\n"}for Your Needs
      </AppText>
              <AppText style={styles.bannerSubtitle}>Fast • Reliable • Affordable</AppText>
              <Pressable style={styles.bannerAction} onPress={() => navigateToServices()}>
                <Ionicons name="arrow-forward" size={18} color={brandGreen} />
              </Pressable>
            </View> 

            <View style={styles.bannerArtWrapper}>
              <View style={styles.bannerArt}>
                <View style={styles.artHead} />
                <View style={styles.artBody} />
                <View style={styles.artBadge} />
              </View>
            </View>
          </View>
        </View> */}

        <View style={styles.bannerWrapper}>
  <View style={styles.banner}>

    {/* LEFT CONTENT */}
    <View style={styles.bannerContent}>
      <AppText style={styles.bannerTitle}>
        Trusted{"\n"}Local Workers{"\n"}for Your Needs
      </AppText>

      <AppText style={styles.bannerSubtitle}>
        Fast • Reliable • Affordable
      </AppText>

      {/* <Pressable
        style={styles.bannerAction}
        onPress={() => navigateToServices()}
      > */}
      <Pressable
        style={styles.bannerAction}
        onPress={() => navigateToServices()}
      >
        <Ionicons
          name="arrow-forward"
          size={20}
          color={brandGreen}
        />
      </Pressable>
    </View>

    {/* RIGHT IMAGE */}
    {/* <View style={styles.bannerImageWrapper}>
      <Image
  source={require('../../../assets/images/man1.png')}
  style={styles.bannerImage}
  resizeMode="contain"
/>
    </View> */}

    <View style={styles.bannerImageWrapper}>
  <View style={styles.avatarCircle}>
    <Image
      source={require('../../../assets/images/man1.png')}
      style={styles.bannerImage}
      resizeMode="cover"
    />
  </View>
</View>

  </View>
</View>

        <View style={styles.sectionHeaderTopSpacing}>
          <AppText style={styles.sectionTitle}>All Categories</AppText>
        </View>

        <View style={styles.gridContainer}>
          {allCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.gridItem, { width: gridItemWidth }]}
              onPress={() => navigateToServiceDetail(category.id)}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: category.tint }]}>
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={17} color={brandGreen} />
              </View>
              <AppText style={styles.gridLabel} numberOfLines={2}>{category.name}</AppText>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.otherServicesButton} onPress={() => navigateToServices()}>
          <View style={styles.otherServicesLeft}>
            <Ionicons name="grid-outline" size={18} color={colors.surface} />
            <AppText style={styles.otherServicesText}>Other Services</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.surface} />
        </Pressable>

            {/* <View style={styles.promoBanner}>
  <View style={styles.promoContent}>
    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
    <AppText style={styles.promoText}>
      Want to list your business? WhatsApp us at{' '}
      <AppText style={styles.promoPhone}>9815432763</AppText>
    </AppText>
  </View>
</View> */}

          <Pressable
            style={styles.promoBanner}
            // onPress={() => {
            //   Linking.openURL('https://wa.me/919815432763');
            // }}
            onPress={() => {
            const phone = '918223940122';
            const message = 'Hello, I want to list my business on Ganpati.';
            
            Linking.openURL(
              `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
            );
          }}
          >
            <View style={styles.promoContent}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />

              <AppText style={styles.promoText}>
                Want to list your business? WhatsApp us at{' '}
                <AppText style={styles.promoPhone}>
                  9815432763
                </AppText>
              </AppText>
            </View>
          </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
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
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: brandGreen,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7ECEF',
    height: 52,
    paddingHorizontal: 14,
    shadowColor: '#17212B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
    color: brandGreen,
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

banner: {
  height: 150,
  width: '100%',
  backgroundColor: brandGreen,
  borderRadius: 20,
  overflow: 'hidden',

  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'space-between',

  shadowColor: '#0A291B',
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
  paddingTop: 17,
  paddingBottom: 12,
  zIndex: 2,
},

bannerTitle: {
  color: colors.surface,
  fontSize: 18,
  lineHeight: 23,
  fontWeight: '800',
},

bannerSubtitle: {
  marginTop: 6,
  color: 'rgba(255,255,255,0.9)',
  fontSize: 11,
  fontWeight: '600',
  letterSpacing: 0.2,
},

bannerAction: {
  marginTop: 10,
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: colors.surface,

  justifyContent: 'center',
  alignItems: 'center',

  alignSelf: 'flex-start',
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
avatarCircle: {
  width: 110,
  height: 110,
  borderRadius: 55,
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Soft white glow ring
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},

// bannerImage: {
//   width: 170,
//   height: 170,
//   position: 'absolute',
//   bottom: -5,
//   right: -8,
// },

bannerImage: {
  width: 110,
  height: 110,
},

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
    backgroundColor: '#E7F9F1',
    position: 'absolute',
    top: 16,
  },
  artBody: {
    width: 52,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#D5F0E3',
    position: 'absolute',
    top: 38,
  },
  artBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A7E6C9',
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
    backgroundColor: brandGreen,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#0A291B',
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
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  
promoBanner: {
  backgroundColor: '#E8F5E9',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 24,
  borderWidth: 1,
  borderColor: '#C8E6C9',
},
promoContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
promoText: {
  fontSize: 13,
  color: '#2E7D32',
  flex: 1,
},
promoPhone: {
  fontWeight: 'bold',
  color: '#1B5E20',
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
  backgroundColor: '#EAF6F3',
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

