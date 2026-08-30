import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { spacing } from '../theme/typography';
import { shadows } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (spacing.screenPadding * 2) - 14) / 2;
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
 * Matches the layout and dimensions of ProductCard.js
 */
export const SkeletonCard = () => (
  <View style={styles.card}>
    {/* Product Image Placeholder */}
    <SkeletonShimmer style={styles.imagePlaceholder}>
      <View style={styles.badgeSkeleton} />
    </SkeletonShimmer>

    {/* Details Placeholder Lines */}
    <View style={styles.infoWrap}>
      <SkeletonShimmer style={styles.titleLine} />
      <SkeletonShimmer style={styles.subLine} />
      <View style={styles.priceRow}>
        <SkeletonShimmer style={styles.priceLine} />
        <SkeletonShimmer style={styles.heartSkeleton} />
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
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EAE4DC',
    ...shadows.card,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 1.12,
    backgroundColor: '#EAE4DC',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  badgeSkeleton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 44,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DFD7CE',
  },
  infoWrap: {
    paddingTop: 10,
  },
  titleLine: {
    width: '85%',
    height: 13,
    backgroundColor: '#EAE4DC',
    borderRadius: 4,
    marginBottom: 6,
  },
  subLine: {
    width: '55%',
    height: 10,
    backgroundColor: '#F0EBE3',
    borderRadius: 3,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceLine: {
    width: '45%',
    height: 15,
    backgroundColor: '#DFD7CE',
    borderRadius: 4,
  },
  heartSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0EBE3',
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
