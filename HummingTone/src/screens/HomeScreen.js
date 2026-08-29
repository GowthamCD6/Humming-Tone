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
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { PerksTicker } from '../components/PerksTicker';
import { Button } from '../components/Button';
import { ProductService } from '../api/services';
import { useSiteContent } from '../context/SiteContentContext';

const { width } = Dimensions.get('window');

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Dynamic Gender Category Pills Bar */}
        <View style={styles.genderPillsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genderPillsScroll}>
            {activeGenders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.genderPill}
                onPress={() => handleGenderPress(gender)}
                activeOpacity={0.8}
              >
                <Text style={styles.genderPillText}>{gender.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hero Section */}
        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
            }}
            style={styles.heroImageAbsolute}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubTag}>NEW ARRIVALS 2026</Text>
            <Text style={styles.heroTitle}>Elevate Your Style</Text>
            <Text style={styles.heroDesc}>
              Discover premium bespoke apparel, custom t-shirts, hoodies, and luxury essentials.
            </Text>
            <View style={styles.heroActions}>
              <Button
                title="CUSTOMIZE APPAREL"
                onPress={() => navigation.navigate('CustomizeTab')}
                variant="primary"
                size="md"
                style={styles.heroBtn}
              />
              <Button
                title="EXPLORE ALL"
                onPress={() => navigation.navigate('ExploreTab')}
                variant="outline"
                size="md"
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                textStyle={{ color: colors.textInverse }}
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
            <Text style={styles.storyTag}>OUR PROMISE</Text>
            <Text style={styles.storyTitle}>Exceptional Quality & Comfort</Text>
            <Text style={styles.storyDescription}>
              Every piece in our collection is a testament to meticulous design, premium natural cotton, and unparalleled comfort. At Humming Tone, we craft modern clothing engineered for everyday elegance and long-lasting durability.
            </Text>
            <TouchableOpacity
              style={styles.storyLink}
              onPress={() => navigation.navigate('CustomizeTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.storyLinkText}>START CUSTOMIZING</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Arrivals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionCategory}>JUST ARRIVED</Text>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExploreTab')}
              style={styles.viewAllButton}
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
  genderPillsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  genderPillsScroll: {
    paddingHorizontal: spacing.screenPadding,
    gap: 8,
  },
  genderPill: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderPillText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightSemiBold,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  heroWrapper: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 12,
    height: 380,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImageAbsolute: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroSubTag: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightSemiBold,
    letterSpacing: 2,
    color: colors.goldLight,
    marginBottom: 6,
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
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    flex: 1,
    minHeight: 42,
  },
  heroBtnSecondary: {
    borderColor: colors.textInverse,
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
    color: colors.textSecondary,
    marginBottom: 2,
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
    backgroundColor: colors.primaryDark,
    marginVertical: spacing.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.screenPadding,
  },
  storyContent: {
    maxWidth: 500,
  },
  storyTag: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.goldMuted,
    marginBottom: 8,
  },
  storyTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 24,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
    marginBottom: 12,
    lineHeight: 30,
  },
  storyDescription: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 20,
  },
  storyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.textInverse,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  storyLinkText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textInverse,
  },
});
