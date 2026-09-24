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

/**
 * Skeleton Loader for Customizer / Virtual Atelier Studio
 */
export const SkeletonCustomizer = () => (
  <View style={styles.customizerContainer}>
    {/* 1. Header Bar */}
    <View style={styles.customizerHeaderRow}>
      <View>
        <SkeletonShimmer style={styles.headerTitleLine} />
        <SkeletonShimmer style={styles.headerSubLine} />
      </View>
      <View style={styles.headerBtnsRow}>
        <SkeletonShimmer style={styles.headerCircleBtn} />
        <SkeletonShimmer style={styles.headerCircleBtn} />
      </View>
    </View>

    {/* 2. Virtual Stage Card */}
    <View style={styles.stageCardSkeleton}>
      <View style={styles.stageHeaderSkeleton}>
        <SkeletonShimmer style={styles.stagePillSkeleton} />
        <SkeletonShimmer style={styles.sideSwitcherSkeleton} />
      </View>
      <View style={styles.quickPlacementSkeletonRow}>
        <SkeletonShimmer style={styles.quickPillSkeleton} />
        <SkeletonShimmer style={styles.quickPillSkeleton} />
        <SkeletonShimmer style={styles.quickPillSkeleton} />
      </View>
      <View style={styles.garmentBoxSkeleton}>
        <SkeletonShimmer style={styles.garmentSilhouetteSkeleton} />
      </View>
      <SkeletonShimmer style={styles.stageFooterSkeleton} />
    </View>

    {/* 3. Stepper Workflow Bar */}
    <View style={styles.stepperBarSkeleton}>
      <View style={styles.stepperMetaSkeleton}>
        <SkeletonShimmer style={styles.stepperCircleSkeleton} />
        <SkeletonShimmer style={styles.stepperTitleSkeleton} />
      </View>
      <View style={styles.stepperPillsRow}>
        <SkeletonShimmer style={styles.stepperPill} />
        <SkeletonShimmer style={styles.stepperPill} />
        <SkeletonShimmer style={styles.stepperPill} />
        <SkeletonShimmer style={styles.stepperPill} />
      </View>
    </View>

    {/* 4. Tool Panel Card */}
    <View style={styles.toolPanelSkeleton}>
      <SkeletonShimmer style={styles.panelTitleSkeleton} />
      <SkeletonShimmer style={styles.panelSubSkeleton} />
      <View style={styles.panel3ColGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.tile3ColSkeleton}>
            <SkeletonShimmer style={styles.tileSwatchSkeleton} />
            <SkeletonShimmer style={styles.tileNameSkeleton} />
            <SkeletonShimmer style={styles.tilePriceSkeleton} />
          </View>
        ))}
      </View>
    </View>
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

  // Customizer Studio Skeleton
  customizerContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  customizerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitleLine: {
    width: 140,
    height: 20,
    backgroundColor: '#EAE4DC',
    borderRadius: 6,
    marginBottom: 5,
  },
  headerSubLine: {
    width: 190,
    height: 12,
    backgroundColor: '#F0EBE3',
    borderRadius: 4,
  },
  headerBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECE4DC',
  },
  stageCardSkeleton: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 14,
  },
  stageHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stagePillSkeleton: {
    width: 120,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0EBE3',
  },
  sideSwitcherSkeleton: {
    width: 110,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0EBE3',
  },
  quickPlacementSkeletonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  quickPillSkeleton: {
    width: 80,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F5EFEB',
  },
  garmentBoxSkeleton: {
    width: '100%',
    aspectRatio: 500 / 580,
    maxHeight: 340,
    backgroundColor: '#F4EDE6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  garmentSilhouetteSkeleton: {
    width: '55%',
    height: '75%',
    backgroundColor: '#EAE4DC',
    borderRadius: 16,
  },
  stageFooterSkeleton: {
    width: '100%',
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    marginTop: 10,
  },
  stepperBarSkeleton: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 12,
  },
  stepperMetaSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepperCircleSkeleton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECE4DC',
  },
  stepperTitleSkeleton: {
    width: 130,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#ECE4DC',
  },
  stepperPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperPill: {
    width: 76,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  toolPanelSkeleton: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 16,
    marginBottom: 20,
  },
  panelTitleSkeleton: {
    width: 160,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#EAE4DC',
    marginBottom: 6,
  },
  panelSubSkeleton: {
    width: 220,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F0EBE3',
    marginBottom: 16,
  },
  panel3ColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  tile3ColSkeleton: {
    width: (width - 64 - 16) / 3,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  tileSwatchSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECE4DC',
  },
  tileNameSkeleton: {
    width: 44,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#ECE4DC',
  },
  tilePriceSkeleton: {
    width: 32,
    height: 9,
    borderRadius: 3,
    backgroundColor: '#F0EBE3',
  },
});
