import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

// Screen Imports
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CustomizeScreen } from '../screens/CustomizeScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOCK_HORIZONTAL_MARGIN = 20;
const DOCK_PADDING_H = 8;
const DOCK_WIDTH = SCREEN_WIDTH - (DOCK_HORIZONTAL_MARGIN * 2);
const TAB_BAR_INNER_WIDTH = DOCK_WIDTH - (DOCK_PADDING_H * 2);
const TAB_COUNT = 5;
const TAB_ITEM_WIDTH = TAB_BAR_INNER_WIDTH / TAB_COUNT;
const ACTIVE_BUBBLE_SIZE = 48;
const BUBBLE_OFFSET_LEFT = DOCK_PADDING_H + (TAB_ITEM_WIDTH - ACTIVE_BUBBLE_SIZE) / 2;

const TABS = [
  { id: 'HomeTab', name: 'HomeTab', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 'ExploreTab', name: 'ExploreTab', label: 'Explore', icon: 'grid', iconOutline: 'grid-outline' },
  { id: 'CustomizeTab', name: 'CustomizeTab', label: 'Studio', icon: 'color-palette', iconOutline: 'color-palette-outline' },
  { id: 'CartTab', name: 'CartTab', label: 'Cart', icon: 'bag-handle', iconOutline: 'bag-handle-outline' },
  { id: 'ProfileTab', name: 'ProfileTab', label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

export const BottomTabNavigator = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Handle external navigation requests into specific tabs (e.g. { screen: 'CartTab' })
  useEffect(() => {
    const targetScreen = route.params?.screen;
    if (targetScreen) {
      const targetIndex = TABS.findIndex((t) => t.id === targetScreen || t.name === targetScreen);
      if (targetIndex !== -1 && targetIndex !== activeTab) {
        goToTab(targetIndex);
      }
    }
  }, [route.params?.screen, route.params]);

  const goToTab = (index) => {
    if (index === activeTab) return;
    setActiveTab(index);
    pagerRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const onScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex >= 0 && pageIndex < TABS.length && pageIndex !== activeTab) {
      setActiveTab(pageIndex);
    }
  };

  // Custom navigation wrapper to seamlessly support navigation.navigate('CartTab') or navigation.navigate('MainTabs', { screen: 'CartTab' })
  const customNav = {
    ...navigation,
    navigate: (screenName, params) => {
      const tabIdx = TABS.findIndex((t) => t.id === screenName || t.name === screenName);
      if (tabIdx !== -1) {
        goToTab(tabIdx);
      } else if (screenName === 'MainTabs' && params?.screen) {
        const targetIdx = TABS.findIndex((t) => t.id === params.screen || t.name === params.screen);
        if (targetIdx !== -1) {
          goToTab(targetIdx);
        } else {
          navigation.navigate(screenName, params);
        }
      } else {
        navigation.navigate(screenName, params);
      }
    },
  };

  // Real-time sub-pixel sliding glide position for the active pill
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2, SCREEN_WIDTH * 3, SCREEN_WIDTH * 4],
    outputRange: [
      0 * TAB_ITEM_WIDTH,
      1 * TAB_ITEM_WIDTH,
      2 * TAB_ITEM_WIDTH,
      3 * TAB_ITEM_WIDTH,
      4 * TAB_ITEM_WIDTH,
    ],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Real-time Continuous Horizontal Sheet Pager (Finger Swiping Supported) */}
      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        decelerationRate="fast"
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.pager}
        contentContainerStyle={styles.pagerContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageWrap}>
          <HomeScreen navigation={customNav} route={route} />
        </View>
        <View style={styles.pageWrap}>
          <ExploreScreen navigation={customNav} route={route} />
        </View>
        <View style={styles.pageWrap}>
          <CustomizeScreen navigation={customNav} route={route} />
        </View>
        <View style={styles.pageWrap}>
          <CartScreen navigation={customNav} route={route} />
        </View>
        <View style={styles.pageWrap}>
          <ProfileScreen navigation={customNav} route={route} />
        </View>
      </Animated.ScrollView>

      {/* Floating Bottom Tab Bar Dock with Silky Smooth Sliding Indicator */}
      <View
        style={[
          styles.tabBarContainer,
          { bottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16 },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.tabBarDock}>
          {/* Synchronized Gliding Active Circle Indicator */}
          <Animated.View
            style={[
              styles.activeBubble,
              {
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />

          {/* Tab Button Items */}
          {TABS.map((tab, index) => {
            const activeOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            const inactiveOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [1, 0, 1],
              extrapolate: 'clamp',
            });

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => goToTab(index)}
                style={styles.tabButton}
                activeOpacity={0.8}
              >
                <View style={styles.iconContainer}>
                  {/* Active Highlighted Icon */}
                  <Animated.View style={[styles.iconLayer, { opacity: activeOpacity }]}>
                    <Ionicons name={tab.icon} size={22} color="#6B4E37" />
                  </Animated.View>

                  {/* Inactive Sleek Icon */}
                  <Animated.View style={[styles.iconLayer, { opacity: inactiveOpacity }]}>
                    <Ionicons name={tab.iconOutline} size={22} color="#9E948C" />
                    {tab.id === 'CartTab' && cartCount > 0 && (
                      <View style={styles.cartDotBadge} />
                    )}
                  </Animated.View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexDirection: 'row',
  },
  pageWrap: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    left: DOCK_HORIZONTAL_MARGIN,
    right: DOCK_HORIZONTAL_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  tabBarDock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B18',
    height: 64,
    borderRadius: 32,
    paddingHorizontal: DOCK_PADDING_H,
    width: '100%',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  activeBubble: {
    position: 'absolute',
    top: (64 - ACTIVE_BUBBLE_SIZE) / 2,
    left: BUBBLE_OFFSET_LEFT,
    width: ACTIVE_BUBBLE_SIZE,
    height: ACTIVE_BUBBLE_SIZE,
    borderRadius: ACTIVE_BUBBLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: ACTIVE_BUBBLE_SIZE,
    height: ACTIVE_BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  cartDotBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    borderWidth: 1.5,
    borderColor: '#1E1B18',
  },
});
