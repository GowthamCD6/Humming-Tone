import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { GarmentIcon } from '../components/GarmentIcons';
import { ProductService } from '../api/services';
import { useSiteContent } from '../context/SiteContentContext';
import { useAuth } from '../context/AuthContext';
import { SITE_ASSETS } from '../api/siteAssets';

const { width } = Dimensions.get('window');
const CATEGORY_ITEM_WIDTH = (width - 40 - (3 * 10)) / 4;

const HERO_BANNERS = [
  {
    id: 'new-arrivals',
    title: 'NEW ARRIVALS',
    description: 'Handcrafted apparel tailored for effortless luxury.',
    buttonText: 'SHOP NOW',
    image: require('../assets/new_Arival.png'),
    routeType: 'category',
    routeTitle: 'New Arrivals',
    gender: 'Men',
    bg: '#ECE3DA',
    rightOffset: -20,
    widthPercent: '65%',
  },
  {
    id: 'featured-products',
    title: 'FEATURED PIECES',
    description: 'Exclusive artisanal drops crafted to elevate your wardrobe.',
    buttonText: 'SHOP NOW',
    image: require('../assets/featuredproduct.png'),
    routeType: 'category',
    routeTitle: 'Featured Products',
    gender: 'Men',
    bg: '#E8E1D8',
    rightOffset: -26,
    widthPercent: '72%',
  },
  {
    id: 'customize-apparel',
    title: 'CUSTOM STUDIO',
    description: 'Personalize your premium\nfabrics, colors, and prints.',
    buttonText: 'DESIGN NOW',
    image: require('../assets/customize.png'),
    routeType: 'tab',
    tabScreen: 'CustomizeTab',
    bg: '#E4DDD5',
    rightOffset: -22,
    widthPercent: '68%',
    heightPercent: '90%',
  },
];

const EXTENDED_BANNERS = [
  ...HERO_BANNERS.map((b, i) => ({ ...b, uniqueKey: `set1-${b.id}-${i}` })),
  ...HERO_BANNERS.map((b, i) => ({ ...b, uniqueKey: `set2-${b.id}-${i}` })),
  ...HERO_BANNERS.map((b, i) => ({ ...b, uniqueKey: `set3-${b.id}-${i}` })),
];

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

  const bannerScrollRef = useRef(null);
  const virtualIndexRef = useRef(HERO_BANNERS.length);
  const hasInitializedRef = useRef(false);

  // Continuous Seamless Forward-Sliding Loop
  useEffect(() => {
    const slideInterval = setInterval(() => {
      const nextVirtualIndex = virtualIndexRef.current + 1;
      virtualIndexRef.current = nextVirtualIndex;
      bannerScrollRef.current?.scrollTo({
        x: nextVirtualIndex * (width - 40),
        animated: true,
      });
      setActiveSlide(nextVirtualIndex % HERO_BANNERS.length);
    }, 4500);

    return () => clearInterval(slideInterval);
  }, []);

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

  // Auto-refresh latest products & site categories whenever user focuses Home tab
  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshSiteContent();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    refreshSiteContent();
    loadData();
  };

  const handleCategoryPress = (gender) => {
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

        {/* ── 3. HERO PROMOTIONAL BANNER CAROUSEL ── */}
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={width - 40}
          snapToAlignment="center"
          disableIntervalMomentum={true}
          onLayout={() => {
            if (!hasInitializedRef.current) {
              hasInitializedRef.current = true;
              bannerScrollRef.current?.scrollTo({
                x: HERO_BANNERS.length * (width - 40),
                animated: false,
              });
            }
          }}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const slideWidth = width - 40;
            let vIndex = Math.round(offsetX / slideWidth);
            const realIndex = ((vIndex % HERO_BANNERS.length) + HERO_BANNERS.length) % HERO_BANNERS.length;
            setActiveSlide(realIndex);

            // Silent normalization to middle set to ensure continuous infinite forward scroll
            if (vIndex >= HERO_BANNERS.length * 2) {
              vIndex = HERO_BANNERS.length + realIndex;
              bannerScrollRef.current?.scrollTo({ x: vIndex * slideWidth, animated: false });
            } else if (vIndex < HERO_BANNERS.length) {
              vIndex = HERO_BANNERS.length + realIndex;
              bannerScrollRef.current?.scrollTo({ x: vIndex * slideWidth, animated: false });
            }
            virtualIndexRef.current = vIndex;
          }}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const slideWidth = width - 40;
            const vIndex = Math.round(offsetX / slideWidth);
            const realIndex = ((vIndex % HERO_BANNERS.length) + HERO_BANNERS.length) % HERO_BANNERS.length;
            if (realIndex !== activeSlide && realIndex >= 0 && realIndex < HERO_BANNERS.length) {
              setActiveSlide(realIndex);
            }
          }}
          scrollEventThrottle={16}
          style={styles.bannerScroll}
        >
          {EXTENDED_BANNERS.map((banner) => (
            <View key={banner.uniqueKey} style={[styles.heroPromoCard, { backgroundColor: banner.bg }]}>
              <View style={styles.heroLeftContent}>
                <Text style={styles.heroMainTitle} numberOfLines={1}>{banner.title}</Text>
                <Text style={styles.heroDescription}>
                  {banner.description}
                </Text>

                <TouchableOpacity
                  style={styles.heroShopBtn}
                  onPress={() => {
                    if (banner.routeType === 'tab') {
                      navigation.navigate('MainTabs', { screen: banner.tabScreen });
                    } else {
                      navigation.navigate('CategoryProducts', { title: banner.routeTitle, gender: banner.gender });
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroShopBtnText}>{banner.buttonText}</Text>
                </TouchableOpacity>
              </View>

              {/* Right Sized Model Image */}
              <View style={[styles.heroRightImageWrap, { right: banner.rightOffset, width: banner.widthPercent, height: banner.heightPercent || '99%' }]}>
                <Image
                  source={banner.image}
                  style={styles.heroModelImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Hero Carousel Indicator Dots */}
        <View style={styles.heroDotsRow}>
          {HERO_BANNERS.map((_, dot) => (
            <View
              key={dot}
              style={[
                styles.heroDot,
                activeSlide === dot && styles.heroDotActive,
              ]}
            />
          ))}
        </View>

        {/* ── 4. BACKEND CATEGORY CIRCLES (4 PER ROW) ── */}
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
          {activeGenders.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.categoryCircleItem, { width: CATEGORY_ITEM_WIDTH }]}
              onPress={() => handleCategoryPress(gender)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryCircle}>
                <GarmentIcon type={gender} color={colors.primary} size={26} />
              </View>
              <Text style={styles.categoryNameText} numberOfLines={1}>{gender}</Text>
            </TouchableOpacity>
          ))}
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

  // 3. Hero Promo Card (Minimalist Luxury)
  bannerScroll: {
    width: width - 40,
    height: 172,
    marginBottom: 4,
  },
  heroPromoCard: {
    width: width - 40,
    backgroundColor: '#ECE3DA',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 172,
    borderWidth: 1,
    borderColor: '#E2D8CE',
  },
  heroLeftContent: {
    width: '56%',
    paddingLeft: 14,
    paddingRight: 0,
    paddingVertical: 12,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroMainTitle: {
    fontFamily: typography.fontSans,
    fontSize: 16.5,
    fontWeight: '900',
    color: '#1F1A17',
    letterSpacing: 0.1,
    marginBottom: 5,
  },
  heroDescription: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#6B5E55',
    lineHeight: 16,
    marginBottom: 12,
    fontWeight: typography.weightMedium,
  },
  heroShopBtn: {
    backgroundColor: '#6B4E37',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroShopBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroRightImageWrap: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: '65%',
    height: '99%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  heroModelImage: {
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
    backgroundColor: '#DDD3C7',
  },
  heroDotActive: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B4E37',
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
    gap: 10,
    paddingBottom: 4,
    marginBottom: 18,
  },
  categoryCircleItem: {
    alignItems: 'center',
  },
  categoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#EAE1D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryNameText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    fontWeight: typography.weightSemiBold,
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
