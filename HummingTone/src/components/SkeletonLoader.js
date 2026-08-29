import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (spacing.screenPadding * 2) - spacing.sm) / 2;

export const SkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.imagePlaceholder} />
    <View style={styles.textLineSmall} />
    <View style={styles.textLineLarge} />
    <View style={styles.textLineMedium} />
  </View>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <View style={styles.grid}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
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
    marginBottom: spacing.md,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    marginBottom: 8,
  },
  textLineSmall: {
    width: '50%',
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 6,
  },
  textLineLarge: {
    width: '85%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 6,
  },
  textLineMedium: {
    width: '40%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
});
