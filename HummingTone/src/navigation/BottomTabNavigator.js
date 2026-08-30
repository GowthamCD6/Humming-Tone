import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  const getIconName = (routeName, isFocused) => {
    switch (routeName) {
      case 'HomeTab':
        return isFocused ? 'home' : 'home-outline';
      case 'ExploreTab':
        return isFocused ? 'grid' : 'grid-outline';
      case 'CustomizeTab':
        return isFocused ? 'color-palette' : 'color-palette-outline';
      case 'CartTab':
        return isFocused ? 'bag-handle' : 'bag-handle-outline';
      case 'ProfileTab':
        return isFocused ? 'person' : 'person-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        { bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabBarDock}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIconName(route.name, isFocused);
          const TAB_ICON_SIZE = 22;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.85}
            >
              {isFocused ? (
                <View style={styles.activeCircle}>
                  <Ionicons name={iconName} size={TAB_ICON_SIZE} color="#6B4E37" />
                </View>
              ) : (
                <View style={styles.inactiveIconWrap}>
                  <Ionicons name={iconName} size={TAB_ICON_SIZE} color="#9E948C" />
                  {route.name === 'CartTab' && cartCount > 0 && (
                    <View style={styles.cartDotBadge} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
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
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  tabBarDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B18',
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartDotBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D4AF37',
  },
});
