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
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { PerksTicker } from '../components/PerksTicker';
import { Button } from '../components/Button';
import { ProductService } from '../api/services';
import { useSiteContent } from '../context/SiteContentContext';
import { SITE_ASSETS } from '../api/siteAssets';

const { width } = Dimensions.get('window');

const GENDER_IMAGES = {
  Men: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80',
  Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
  Children: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80',
  Baby: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400&q=80',
  Sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
  Customize: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
};

export const HomeScreen = ({ navigation }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { activeGenders, refreshSiteContent } = useSiteContent();

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
      navigation.navigate('CustomizeTab');
    } else {
      navigation.navigate('CategoryProducts', {
        title: `${gender}'s Collection`,
        gender: gender,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Dynamic Category Story Cards Bar */}
        <View style={styles.storyBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyBarScroll}>
            {activeGenders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.storyItem}
                onPress={() => handleGenderPress(gender)}
                activeOpacity={0.8}
              >
                <View style={styles.storyImageRing}>
                  <Image
                    source={{ uri: GENDER_IMAGES[gender] || GENDER_IMAGES.Men }}
                    style={styles.storyImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.storyLabel} numberOfLines={1}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hero Section */}
        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri: SITE_ASSETS.homeHero,
            }}
            style={styles.heroImageAbsolute}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>BESPOKE APPAREL</Text>
            </View>
            <Text style={styles.heroTitle}>Elegance Crafted For You</Text>
            <Text style={styles.heroDesc}>
              Discover bespoke t-shirts, premium hoodies, luxury knitwear, and customized essentials.
            </Text>
            <View style={styles.heroActions}>
              <Button
                title="CUSTOM STUDIO"
                onPress={() => navigation.navigate('CustomizeTab')}
                variant="primary"
                size="md"
                style={[styles.heroBtn, styles.heroBtnPrimary]}
                textStyle={styles.heroBtnText}
              />
              <Button
                title="EXPLORE ALL"
                onPress={() => navigation.navigate('ExploreTab')}
                variant="outline"
                size="md"
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                textStyle={{ color: colors.textInverse, fontWeight: typography.weightBold }}
              />
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionCategory}>CURATED SELECTION</Text>
              <Text style={styles.sectionTitle}>Featured Collection</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExploreTab')}
              style={styles.viewAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>VIEW ALL</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

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

        {/* Infinite Perks Marquee Ticker */}
        <PerksTicker />

        {/* Craftsmanship Brand Story Section */}
        <View style={styles.storySection}>
          <View style={styles.storyContent}>
            <View style={styles.goldPill}>
              <Text style={styles.storyTag}>HUMMING TONE PROMISE</Text>
            </View>
            <Text style={styles.storyTitle}>Exceptional Quality & Bespoke Craftsmanship</Text>
            <Text style={styles.storyDescription}>
              Every piece in our collection is a testament to meticulous tailoring, organic cottons, and refined aesthetics. Designed for comfort, longevity, and modern individuality.
            </Text>
            <TouchableOpacity
              style={styles.storyLink}
              onPress={() => navigation.navigate('CustomizeTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.storyLinkText}>ENTER CUSTOM STUDIO</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.goldLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Arrivals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionCategory}>LATEST RELEASES</Text>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExploreTab')}
              style={styles.viewAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>VIEW ALL</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

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

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  storyBarContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  storyBarScroll: {
    paddingHorizontal: spacing.screenPadding,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyImageRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  storyLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  heroWrapper: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 14,
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.card,
  },
  heroImageAbsolute: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.62)',
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textInverse,
  },
  heroTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 28,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
    lineHeight: 34,
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 19,
    marginBottom: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
  },
  heroBtnPrimary: {
    backgroundColor: colors.surface,
  },
  heroBtnText: {
    color: colors.primary,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    fontSize: 12,
  },
  heroBtnSecondary: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionCategory: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightSemiBold,
    letterSpacing: 1.5,
    color: colors.goldDark,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  viewAllText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.primary,
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
  storySection: {
    backgroundColor: colors.darkSurface,
    marginVertical: spacing.xl,
    paddingVertical: spacing.xl + 4,
    paddingHorizontal: spacing.screenPadding,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderGold,
  },
  storyContent: {
    maxWidth: 500,
  },
  goldPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  storyTag: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
  storyTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 23,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
    marginBottom: 12,
    lineHeight: 30,
  },
  storyDescription: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  storyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.goldLight,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  storyLinkText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
});
