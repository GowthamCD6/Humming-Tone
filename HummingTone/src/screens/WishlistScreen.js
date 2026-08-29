import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

const { width } = Dimensions.get('window');
const FILTER_TABS = ['All', 'Jacket', 'Shirt', 'Pant', 'T-Shirt', 'Custom'];

export const WishlistScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = React.useMemo(() => {
    if (activeTab === 'All') return wishlistItems;
    return wishlistItems.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(activeTab.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(activeTab.toLowerCase())
    );
  }, [activeTab, wishlistItems]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. HEADER (Template Exact) ── */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* ── 2. FILTER TABS (Template Exact) ── */}
      <View style={styles.filterTabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTabPill,
                activeTab === tab && styles.filterTabPillActive,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabPillText,
                  activeTab === tab && styles.filterTabPillTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── 3. WISHLIST GRID OR EMPTY STATE ── */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite pieces here to easily find and purchase them later.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>Discover Collections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  filterTabsWrap: {
    paddingVertical: 10,
  },
  filterTabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTabPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  filterTabPillActive: {
    backgroundColor: colors.primary,
  },
  filterTabPillText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
  },
  filterTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: typography.fontSans,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
    fontFamily: typography.fontSans,
    fontSize: 13,
  },
});
