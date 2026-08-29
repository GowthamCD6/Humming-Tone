import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { ProductService } from '../api/services';

export const CategoryProductsScreen = ({ route, navigation }) => {
  const { title = 'Products', gender, category, searchQuery } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price_asc' | 'price_desc' | 'newest'
  const [showSortMenu, setShowSortMenu] = useState(false);

  const fetchProductList = async () => {
    try {
      setLoading(true);
      const data = await ProductService.fetchProducts();
      setProducts(data);
    } catch (e) {
      console.warn('Error fetching category products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, [gender, category, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductList();
  };

  // Filter products by gender, category, or search
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.gender && p.gender.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (gender) {
      const g = gender.toLowerCase();
      list = list.filter((p) => {
        const prodGender = (p.gender || '').toLowerCase();
        const prodCategory = (p.category || '').toLowerCase();
        return (
          prodGender === g ||
          prodGender.includes(g) ||
          prodCategory === g ||
          prodCategory.includes(g)
        );
      });
    }

    if (category) {
      const c = category.toLowerCase();
      list = list.filter((p) => {
        const prodCategory = (p.category || '').toLowerCase();
        const prodSub = (p.subcategory || '').toLowerCase();
        return prodCategory === c || prodCategory.includes(c) || prodSub === c || prodSub.includes(c);
      });
    }

    // Apply Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [products, gender, category, searchQuery, sortBy]);

  return (
    <View style={styles.container}>
      <Header title={title} showBack={true} />

      {/* Control Bar: Item count & Sort Trigger */}
      <View style={styles.controlBar}>
        <Text style={styles.countText}>
          {loading ? 'Loading pieces...' : `${filteredProducts.length} Atelier Items`}
        </Text>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.textPrimary} />
          <Text style={styles.sortButtonText}>
            {sortBy === 'price_asc'
              ? 'Price: Low'
              : sortBy === 'price_desc'
              ? 'Price: High'
              : sortBy === 'newest'
              ? 'Newest'
              : 'Sort'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={styles.sortDropdown}>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'default' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('default');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'default' && styles.sortOptionTextActive]}>
              Default (Featured)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'price_asc' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('price_asc');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'price_asc' && styles.sortOptionTextActive]}>
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'price_desc' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('price_desc');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'price_desc' && styles.sortOptionTextActive]}>
              Price: High to Low
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'newest' && styles.sortOptionActive]}
            onPress={() => {
              setSortBy('newest');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'newest' && styles.sortOptionTextActive]}>
              Newest Arrivals
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="shirt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Pieces Found</Text>
            <Text style={styles.emptyDesc}>
              We couldn't find any products matching your selected criteria.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                navigation.navigate('ExploreTab');
              }}
            >
              <Text style={styles.resetBtnText}>EXPLORE ALL COLLECTIONS</Text>
            </TouchableOpacity>
          </View>
        )}

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
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  countText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.weightMedium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
  },
  sortDropdown: {
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: spacing.screenPadding,
  },
  sortOptionActive: {
    backgroundColor: colors.surface,
  },
  sortOptionText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 20,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 2,
  },
  resetBtnText: {
    color: colors.textInverse,
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
  },
});
