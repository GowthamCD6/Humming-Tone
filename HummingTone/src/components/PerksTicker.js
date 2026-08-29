import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';

const PERKS = [
  { title: 'COMPLIMENTARY EXPRESS DELIVERY', sub: 'ON ALL DOMESTIC ORDERS' },
  { title: '100% BESPOKE CRAFTSMANSHIP', sub: 'PREMIUM WOOL & PURE COTTON' },
  { title: 'EXCLUSIVE ATELIER PROMOS', sub: 'USE CODE "HUMMING10" FOR 10% OFF' },
  { title: 'EASY 7-DAY EXCHANGES', sub: 'SEAMLESS DOORSTEP PICKUP' },
];

export const PerksTicker = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PERKS.map((perk, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.star}>✦</Text>
            <Text style={styles.title}>{perk.title}</Text>
            <View style={styles.subPill}>
              <Text style={styles.sub}>{perk.sub}</Text>
            </View>
            {index < PERKS.length - 1 && <Text style={styles.dot}>•</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  star: {
    color: colors.goldMuted,
    fontSize: 11,
    marginRight: 6,
  },
  title: {
    color: colors.textInverse,
    fontSize: 10.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: typography.fontSans,
  },
  subPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weightRegular,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: typography.fontSans,
  },
  dot: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    marginLeft: 16,
  },
});
