import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { useCart } from '../context/CartContext';

// Screen Imports
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CustomizeScreen } from '../screens/CustomizeScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 14,
          left: 20,
          right: 20,
          backgroundColor: '#1F1A17',
          borderRadius: 36,
          height: 64,
          borderTopWidth: 0,
          paddingHorizontal: 8,
          paddingTop: 0,
          paddingBottom: 0,
          elevation: 10,
          ...shadows.bottomBar,
        },
        tabBarItemStyle: {
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
        },
        tabBarIconStyle: {
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'CustomizeTab') {
            iconName = focused ? 'color-palette' : 'color-palette-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'bag-handle' : 'bag-handle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          if (focused) {
            return (
              <View style={styles.activePill}>
                <Ionicons name={iconName} size={21} color="#1F1A17" />
              </View>
            );
          }

          return (
            <View style={styles.inactivePill}>
              <Ionicons name={iconName} size={22} color="#8A7D75" />
              {route.name === 'CartTab' && cartCount > 0 && (
                <View style={styles.tabBadge} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ExploreTab" component={ExploreScreen} />
      <Tab.Screen name="CustomizeTab" component={CustomizeScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  inactivePill: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D4AF37',
  },
});
