// import React, { useEffect } from 'react';
// import {
//   Image,
//   StyleSheet,
//   Text,
//   View,
//   Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';

// import { colors } from '@/constants/colors';

// const { width, height } = Dimensions.get('window');

// export default function EntryScreen() {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // router.replace('/onboarding');
//       router.replace('/(tabs)/home');
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>

//         {/* Main content */}
//         <View style={styles.mainContent}>

//           {/* Ganpati Logo */}
//           <Image
//             source={require('../../assets/images/Ganesh1.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />

//           {/* App Name */}
//           <Text style={styles.appName}>
//             Ganapati
//           </Text>

//           {/* Tagline */}
//           <View style={styles.taglineContainer}>
//             <Text style={styles.tagline}>
//               Skilled People
//             </Text>

//             <Text style={styles.tagline}>
//               Stronger Community
//             </Text>
//           </View>

//         </View>

//         {/* Bottom section */}
//         <View style={styles.bottomSection}>

//           {/* Simple city skyline */}
//           <View style={styles.skyline}>

//             <View style={[styles.building, styles.buildingSmall]} />
            
//             <View style={[styles.building, styles.buildingMedium]} />

//             <View style={[styles.building, styles.buildingTall]}>
//               <View style={styles.towerTop} />
//             </View>

//             <View style={[styles.building, styles.buildingMedium]} />

//             <View style={[styles.building, styles.buildingSmall]} />

//           </View>

//           {/* Location */}
//           <View style={styles.location}>
//             <Ionicons
//               name="location-outline"
//               size={19}
//               color="#E87516"
//             />

//             <Text style={styles.locationText}>
//               Ambikapur
//             </Text>
//           </View>

//         </View>

//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#FFFDF7',
//   },

//   container: {
//     flex: 1,
//     backgroundColor: '#FFFDF7',
//     alignItems: 'center',
//   },

//   mainContent: {
//     flex: 1,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',

//     // Move the main content slightly upward
//     paddingBottom: height * 0.08,
//   },

//   logo: {
//     width: width * 0.38,
//     height: width * 0.38,

//     marginBottom: -2,
//   },

//   appName: {
//     fontSize: width * 0.095,
//     lineHeight: width * 0.115,
//     fontWeight: '800',

//     color: '#E87516',

//     letterSpacing: -1,

//     marginTop: 0,
//   },

//   taglineContainer: {
//     alignItems: 'center',
//     marginTop: 9,
//   },

//   tagline: {
//     fontSize: 14,
//     lineHeight: 21,
//     fontWeight: '600',

//     color: '#252525',
//   },

//   bottomSection: {
//     width: '100%',
//     height: height * 0.28,

//     alignItems: 'center',
//     justifyContent: 'flex-end',

//     position: 'relative',
//   },

//   skyline: {
//     position: 'absolute',

//     bottom: 45,
//     left: 0,
//     right: 0,

//     height: height * 0.18,

//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     justifyContent: 'center',

//     opacity: 0.45,
//   },

//   building: {
//     backgroundColor: '#DED7BE',

//     marginHorizontal: 3,

//     borderTopLeftRadius: 3,
//     borderTopRightRadius: 3,
//   },

//   buildingSmall: {
//     width: 42,
//     height: 50,
//   },

//   buildingMedium: {
//     width: 34,
//     height: 75,
//   },

//   buildingTall: {
//     width: 46,
//     height: 105,

//     alignItems: 'center',
//   },

//   towerTop: {
//     position: 'absolute',

//     top: -18,

//     width: 5,
//     height: 18,

//     backgroundColor: '#DED7BE',
//   },

//   location: {
//     flexDirection: 'row',
//     alignItems: 'center',

//     marginBottom: 18,
//   },

//   locationText: {
//     marginLeft: 5,

//     fontSize: 14,
//     fontWeight: '600',

//     color: '#444444',
//   },
// });



import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function EntryScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // router.replace('/onboarding');
      router.replace('/(tabs)/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Main Content Area */}
        <View style={styles.mainContent}>

          {/* App Name in Hindi */}
          <View style={styles.titleContainer}>
            <Text style={styles.appNamePrimary}>गणपति</Text>
            <Text style={styles.appNameSecondary}>सुविधा</Text>
          </View>

          {/* Center Image (Ganpati Icon) */}
          <View style={styles.imageWrapper}>
            <Image
              // source={require('./assets/images/ganpati-icon.png')}
              source={require('../../assets/images/ganpati-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Subtitle / Tagline in Hindi */}
          <Text style={styles.tagline}>
            कुशल श्रमिक संपर्क
          </Text>

          {/* Location Indicator */}
          <View style={styles.locationContainer}>
            <Ionicons
              name="location"
              size={18}
              color={colors.primary}
              style={styles.locationIcon}
            />
            <Text style={styles.locationText}>
              Ambikapur
            </Text>
          </View>

        </View>

        {/* Bottom Section (Loading Indicator) */}
        <View style={styles.bottomSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.loadingText}>लोड हो रहा है...</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.04,
  },

  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },

  appNamePrimary: {
    fontSize: width * 0.12,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  appNameSecondary: {
    fontSize: width * 0.11,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: -8,
  },

  imageWrapper: {
    width: width * 0.65,
    height: width * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.01,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  tagline: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: colors.text,
    marginTop: height * 0.02,
    textAlign: 'center',
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  locationIcon: {
    marginRight: 4,
  },

  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  bottomSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: height * 0.02,
  },

  dividerLine: {
    width: width * 0.35,
    height: 1.5,
    backgroundColor: colors.primary,
    marginBottom: 8,
    opacity: 0.8,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primaryDark,
  },
});