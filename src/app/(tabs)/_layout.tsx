// import { Tabs } from 'expo-router';
// import React from 'react';
// import { Platform } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import { colors } from '@/constants/colors';

// export default function TabsLayout() {
//   const insets = useSafeAreaInsets();
//   const baseTabHeight = Platform.OS === 'ios' ? 88 : 64;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.textMuted,
//         tabBarStyle: {
//           backgroundColor: colors.surface,
//           borderTopColor: colors.border,
//           height: baseTabHeight + insets.bottom,
//           paddingBottom: insets.bottom,
//           paddingTop: 8,
//         },
//         contentStyle: {
//           paddingBottom: 12 + insets.bottom,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: 'Home',
//         }}
//       />
//       <Tabs.Screen
//         name="services"
//         options={{
//           title: 'Services',
//         }}
//       />
//       <Tabs.Screen
//         name="search"
//         options={{
//           title: 'Search',
//         }}
//       />
//     </Tabs>
//   );
// }



import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const baseTabHeight = Platform.OS === 'ios' ? 88 : 64;

  return (
    <Tabs
      screenOptions={{
        // Hide the default header
        headerShown: false,

        // Tab colors
        // tabBarActiveTintColor: colors.primary,
        tabBarActiveTintColor: colors.brandGreen,
        tabBarInactiveTintColor: colors.textMuted,

        // Bottom tab bar
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          height: baseTabHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },

        // Tab text
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },

        // Icon positioning
        tabBarIconStyle: {
          marginBottom: 2,
        },

        // Screen content spacing
        sceneContainerStyle: {
          paddingBottom: 12 + insets.bottom,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SERVICES */}
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SEARCH */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
