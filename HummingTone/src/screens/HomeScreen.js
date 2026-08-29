import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { ProductService } from '../api/services';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { SITE_ASSETS } from '../api/siteAssets';

const { width } = Dimensions.get('window');

// Dynamic Gender Icon Mapper
const GENDER_ICON_MAP = {
  Men: 'shirt-outline',
  Women: 'woman-outline',
  Children: 'happy-outline',
  Baby: 'heart-outline',
  Sports: 'fitness-outline',
  Customize: 'color-palette-outline',
};

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeGenders, refreshSiteContent } = useSiteContent();
  const { user, isAuthenticated } = useAuth();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const loadData = async () => {
    try {
      const [featured, arrivals] = await Promise.all([
        ProductService.fetchFeaturedProducts(),
        ProductService.fetchNewArrivals(),
      ]);
      setFeaturedProducts(featured);
      setNewArrivals(arrivals);
    } catch (e) {
      console.warn('Error loading home data:', e);
    } finally {
      setLoadingFeatured(false);
      setLoadingNewArrivals(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refreshSiteContent();
    loadData();
  };

  const handleGenderPress = (gender) => {
    if (gender.toLowerCase() === 'customize') {
      navigation.navigate('MainTabs', { screen: 'CustomizeTab' });
    } else {
      navigation.navigate('CategoryProducts', {
        title: `${gender}'s Collection`,
        gender: gender,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. PROMINENT WELCOME GREETING & NOTIFICATION HEADER ── */}
      <View style={[styles.topLocationBar, { paddingTop: Math.max((insets.top || 0) + 14, (StatusBar.currentHeight || 0) + 14, 32) }]}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeSub}>
            {isAuthenticated ? 'Welcome back,' : 'Hello, Welcome'}
          </Text>
          <TouchableOpacity
            style={styles.welcomeUserRow}
            onPress={() => navigation.navigate(isAuthenticated ? 'MainTabs' : 'Login', { screen: 'ProfileTab' })}
            activeOpacity={0.8}
          >
            <Text style={styles.welcomeUserName} numberOfLines={1}>
              {isAuthenticated ? (user?.name || 'Patron') : 'Guest'}
            </Text>
            <Text style={styles.waveEmoji}> 👋</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Wishlist')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 80, 90) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── 2. REFINED SEARCH BAR & FILTER TUNE BUTTON ── */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchInputContainer}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.9}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search apparel, hoodies, tees...</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterTuneBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.85}
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── 3. HERO PROMOTIONAL BANNER CARD ── */}
        <View style={styles.heroPromoCard}>
          <View style={styles.heroTextSide}>
            <Text style={styles.heroCardTitle}>New Collection</Text>
            <Text style={styles.heroCardSub}>
              Discover handcrafted apparel & custom silhouettes
            </Text>
            <TouchableOpacity
              style={styles.heroShopNowBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CustomizeTab' })}
              activeOpacity={0.85}
            >
              <Text style={styles.heroShopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroImageSide}>
            <Image
              source={{ uri: SITE_ASSETS.homeHero }}
              style={styles.heroModelImg}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Hero Carousel Indicator Dots */}
        <View style={styles.heroDotsRow}>
          {[0, 1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={[
                styles.heroDot,
                activeSlide === dot && styles.heroDotActive,
              ]}
            />
          ))}
        </View>

        {/* ── 4. BACKEND DYNAMIC CATEGORY CIRCLES ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleBold}>Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryCirclesScroll}
        >
          {activeGenders.map((gender) => {
            const iconName = GENDER_ICON_MAP[gender] || 'grid-outline';
            return (
              <TouchableOpacity
                key={gender}
                style={styles.categoryCircleItem}
                onPress={() => handleGenderPress(gender)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryCircle}>
                  <Ionicons name={iconName} size={24} color={colors.primary} />
                </View>
                <Text style={styles.categoryNameText} numberOfLines={1}>{gender}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── 5. FEATURED PRODUCTS SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleBold}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGridWrap}>
          {loadingFeatured ? (
            <SkeletonGrid count={4} />
          ) : featuredProducts.length > 0 ? (
            <View style={styles.grid}>
              {featuredProducts.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No featured products available.</Text>
          )}
        </View>

        {/* ── 6. NEW ARRIVALS SECTION ── */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitleBold}>New Arrivals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGridWrap}>
          {loadingNewArrivals ? (
            <SkeletonGrid count={4} />
          ) : newArrivals.length > 0 ? (
            <View style={styles.grid}>
              {newArrivals.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={{ ...item, isNewArrival: true }} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No new arrivals available.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  // 1. Welcome Greeting Header
  topLocationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  welcomeContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeSub: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
    fontWeight: typography.weightMedium,
  },
  welcomeUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeUserName: {
    fontFamily: typography.fontSans,
    fontSize: 20,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  waveEmoji: {
    fontSize: 18,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // 2. Search Row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchPlaceholder: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textMuted,
  },
  filterTuneBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Hero Promo Card
  heroPromoCard: {
    flexDirection: 'row',
    backgroundColor: '#EAE1D8',
    borderRadius: 20,
    overflow: 'hidden',
    height: 150,
    position: 'relative',
  },
  heroTextSide: {
    flex: 1.2,
    padding: 16,
    justifyContent: 'center',
  },
  heroCardTitle: {
    fontFamily: typography.fontSans,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroCardSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    marginBottom: 12,
  },
  heroShopNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  heroShopNowText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },
  heroImageSide: {
    flex: 1,
    height: '100%',
  },
  heroModelImg: {
    width: '100%',
    height: '100%',
  },
  heroDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  heroDotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  // 4. Category Circles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleBold: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightSemiBold,
    color: colors.primary,
  },
  categoryCirclesScroll: {
    gap: 16,
    paddingBottom: 4,
    marginBottom: 18,
  },
  categoryCircleItem: {
    alignItems: 'center',
    width: 64,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryNameText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // 5. Product Grid
  productsGridWrap: {
    paddingTop: 2,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginVertical: 20,
    fontSize: 13,
  },
});
