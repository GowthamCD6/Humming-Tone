import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const CATEGORY_ITEM_WIDTH = (width - 40 - (3 * 10)) / 4;

/**
 * Animated Shimmer Pulse Component
 * Uses native driver for 60fps smooth opacity breathing animation
 */
export const SkeletonShimmer = ({ style, children }) => {
  const anim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [anim]);

  return <Animated.View style={[style, { opacity: anim }]} children={children} />;
};

/**
 * Skeleton Product Card
 * Matches the layout and dimensions of ProductCard.js exactly
 */
export const SkeletonCard = () => (
  <View style={styles.card}>
    {/* Product Image Placeholder */}
    <SkeletonShimmer style={styles.imagePlaceholder}>
      {/* Top right wishlist heart button placeholder */}
      <View style={styles.heartSkeleton} />
      {/* Bottom left rating badge placeholder */}
      <View style={styles.badgeSkeleton} />
    </SkeletonShimmer>

    {/* Details Placeholder Lines */}
    <View style={styles.metaContainer}>
      <SkeletonShimmer style={styles.titleLine} />
      <SkeletonShimmer style={styles.categoryLine} />
      <View style={styles.priceRow}>
        <SkeletonShimmer style={styles.priceLine} />
        <SkeletonShimmer style={styles.originalPriceLine} />
      </View>
    </View>
  </View>
);

/**
 * 2-Column Product Grid Skeleton
 */
export const SkeletonGrid = ({ count = 4 }) => (
  <View style={styles.grid}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

/**
 * Horizontal Category Circles Skeleton for HomeScreen
 */
export const SkeletonCategoryCircles = ({ count = 4 }) => (
  <View style={styles.categoriesRow}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={[styles.catCircleItem, { width: CATEGORY_ITEM_WIDTH }]}>
        <SkeletonShimmer style={styles.catCircle} />
        <SkeletonShimmer style={styles.catLabel} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted || '#F0EBE3',
    overflow: 'hidden',
    position: 'relative',
  },
  heartSkeleton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  badgeSkeleton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 42,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  metaContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  titleLine: {
    width: '85%',
    height: 13.5,
    backgroundColor: '#EAE4DC',
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryLine: {
    width: '50%',
    height: 10.5,
    backgroundColor: '#F0EBE3',
    borderRadius: 3,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLine: {
    width: '42%',
    height: 14,
    backgroundColor: '#DFD7CE',
    borderRadius: 4,
  },
  originalPriceLine: {
    width: '30%',
    height: 11.5,
    backgroundColor: '#F0EBE3',
    borderRadius: 3,
  },

  // Category circles row
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  catCircleItem: {
    alignItems: 'center',
  },
  catCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EAE4DC',
    marginBottom: 6,
  },
  catLabel: {
    width: 40,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#EAE4DC',
  },
});
