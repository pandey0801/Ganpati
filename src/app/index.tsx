// import { Link } from 'expo-router';
// import React from 'react';
// import {StyleSheet, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import AppButton from '@/components/common/AppButton';
// import AppText from '@/components/common/AppText';
// import { colors } from '@/constants/colors';

// export default function EntryScreen() {
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <AppText variant="title">Welcome to MyApp</AppText>
//         <AppText variant="body" style={styles.subtitle}>
//           Find trusted local services and confirmed professionals for your next home need.
//         </AppText>

//         <Link href="/onboarding" asChild>
//           <AppButton title="Get Started" style={styles.button} />
//         </Link>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//     gap: 16,
//   },
//   subtitle: {
//     textAlign: 'center',
//     color: colors.textMuted,
//     maxWidth: 320,
//   },
//   button: {
//     minWidth: 220,
//   },
// });


import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function EntryScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Main content */}
        <View style={styles.mainContent}>

          {/* Ganpati Logo */}
          <Image
            source={require('../../assets/images/Ganesh1.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* App Name */}
          <Text style={styles.appName}>
            Ganapati
          </Text>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>
              Skilled People
            </Text>

            <Text style={styles.tagline}>
              Stronger Community
            </Text>
          </View>

        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>

          {/* Simple city skyline */}
          <View style={styles.skyline}>

            <View style={[styles.building, styles.buildingSmall]} />
            
            <View style={[styles.building, styles.buildingMedium]} />

            <View style={[styles.building, styles.buildingTall]}>
              <View style={styles.towerTop} />
            </View>

            <View style={[styles.building, styles.buildingMedium]} />

            <View style={[styles.building, styles.buildingSmall]} />

          </View>

          {/* Location */}
          <View style={styles.location}>
            <Ionicons
              name="location-outline"
              size={19}
              color="#3D806D"
            />

            <Text style={styles.locationText}>
              Ambikapur
            </Text>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    alignItems: 'center',
  },

  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

    // Move the main content slightly upward
    paddingBottom: height * 0.08,
  },

  logo: {
    width: width * 0.38,
    height: width * 0.38,

    marginBottom: -2,
  },

  appName: {
    fontSize: width * 0.095,
    lineHeight: width * 0.115,
    fontWeight: '800',

    color: '#087B59',

    letterSpacing: -1,

    marginTop: 0,
  },

  taglineContainer: {
    alignItems: 'center',
    marginTop: 9,
  },

  tagline: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',

    color: '#252525',
  },

  bottomSection: {
    width: '100%',
    height: height * 0.28,

    alignItems: 'center',
    justifyContent: 'flex-end',

    position: 'relative',
  },

  skyline: {
    position: 'absolute',

    bottom: 45,
    left: 0,
    right: 0,

    height: height * 0.18,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',

    opacity: 0.45,
  },

  building: {
    backgroundColor: '#DED7BE',

    marginHorizontal: 3,

    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  buildingSmall: {
    width: 42,
    height: 50,
  },

  buildingMedium: {
    width: 34,
    height: 75,
  },

  buildingTall: {
    width: 46,
    height: 105,

    alignItems: 'center',
  },

  towerTop: {
    position: 'absolute',

    top: -18,

    width: 5,
    height: 18,

    backgroundColor: '#DED7BE',
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 18,
  },

  locationText: {
    marginLeft: 5,

    fontSize: 14,
    fontWeight: '600',

    color: '#444444',
  },
});