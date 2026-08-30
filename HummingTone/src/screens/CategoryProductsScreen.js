import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { ProductService } from '../api/services';
import { useSiteContent } from '../context/SiteContentContext';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { id: 'newest', label: 'Most Recent' },
  { id: 'popular', label: 'Popular / Featured' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price' },
  { id: 'under_500', label: 'Under ₹500', max: 500 },
  { id: '500_1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: '1000_2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { id: 'above_2000', label: 'Above ₹2,000', min: 2000 },
];

export const CategoryProductsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeGenders, genderCategories } = useSiteContent();

  const {
    title = 'Catalog Pieces',
    gender: initGender,
    category: initCategory,
    searchQuery: initSearch,
    sortBy: initSort = 'newest',
    priceRange: initPrice = 'all',
    minRating: initRating = null,
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Filter States
  const [selectedGender, setSelectedGender] = useState(initGender || 'All');
  const [selectedCategory, setSelectedCategory] = useState(initCategory || null);
  const [selectedSort, setSelectedSort] = useState(initSort);
  const [selectedPrice, setSelectedPrice] = useState(initPrice);
  const [selectedRating, setSelectedRating] = useState(initRating);
  const [searchQuery, setSearchQuery] = useState(initSearch || '');

  // UI Modals
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchProductList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGender && selectedGender !== 'All') {
        params.gender = selectedGender.toLowerCase();
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const data = await ProductService.fetchProducts(params);
      setProducts(data || []);
    } catch (e) {
      console.warn('Error fetching category products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, [selectedGender, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductList();
  };

  // Client-side filtering & sorting for search, price ranges, and ratings
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.about && p.about.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory) {
      const c = selectedCategory.toLowerCase();
      list = list.filter((p) => {
        const prodCat = (p.category || p.category_name || '').toLowerCase();
        const prodSub = (p.subcategory || '').toLowerCase();
        return prodCat === c || prodCat.includes(c) || prodSub === c || prodSub.includes(c);
      });
    }

    // Price range filter
    if (selectedPrice && selectedPrice !== 'all') {
      const targetRange = PRICE_RANGES.find((r) => r.id === selectedPrice);
      if (targetRange) {
        if (targetRange.min != null && targetRange.max != null) {
          list = list.filter((p) => (p.price || 0) >= targetRange.min && (p.price || 0) <= targetRange.max);
        } else if (targetRange.max != null) {
          list = list.filter((p) => (p.price || 0) <= targetRange.max);
        } else if (targetRange.min != null) {
          list = list.filter((p) => (p.price || 0) >= targetRange.min);
        }
      }
    }

    // Rating filter
    if (selectedRating != null) {
      list = list.filter((p) => (p.rating || 5.0) >= selectedRating);
    }

    // Sorting
    if (selectedSort === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (selectedSort === 'popular') {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedPrice, selectedRating, selectedSort]);

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGender && selectedGender !== 'All') count++;
    if (selectedCategory) count++;
    if (selectedPrice && selectedPrice !== 'all') count++;
    if (selectedRating != null) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedGender, selectedCategory, selectedPrice, selectedRating, searchQuery]);

  const clearAllFilters = () => {
    setSelectedGender('All');
    setSelectedCategory(null);
    setSelectedPrice('all');
    setSelectedRating(null);
    setSelectedSort('newest');
    setSearchQuery('');
  };

  // Subcategories available for active gender
  const availableSubcategories = useMemo(() => {
    if (selectedGender && selectedGender !== 'All') {
      return genderCategories[selectedGender] || genderCategories[selectedGender.toLowerCase()] || [];
    }
    const allCats = new Set();
    Object.values(genderCategories).forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach((c) => allCats.add(c));
    });
    return Array.from(allCats);
  }, [selectedGender, genderCategories]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <Header title={title} showBack={true} />

      {/* ── 1. CONTROL & SORT BAR ── */}
      <View style={styles.controlBar}>
        <Text style={styles.countText}>
          {loading ? 'Discovering pieces...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Piece' : 'Pieces'} Found`}
        </Text>

        <View style={styles.controlButtonsRow}>
          {/* Quick Sort Button */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={15} color="#1E1B18" />
            <Text style={styles.sortButtonText}>
              {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || 'Sort'}
            </Text>
          </TouchableOpacity>

          {/* Filter Modal Trigger Button */}
          <TouchableOpacity
            style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="funnel"
              size={14}
              color={activeFiltersCount > 0 ? '#FFFFFF' : '#1E1B18'}
            />
            <Text style={[styles.filterBtnText, activeFiltersCount > 0 && styles.filterBtnTextActive]}>
              Filter
            </Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. SORT DROPDOWN OVERLAY ── */}
      {showSortDropdown && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortOption, selectedSort === opt.id && styles.sortOptionActive]}
              onPress={() => {
                setSelectedSort(opt.id);
                setShowSortDropdown(false);
              }}
            >
              <Text style={[styles.sortOptionText, selectedSort === opt.id && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              {selectedSort === opt.id && (
                <Ionicons name="checkmark" size={16} color="#6B4E37" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── 3. ACTIVE FILTER CHIPS (Scrollable) ── */}
      {activeFiltersCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {selectedGender && selectedGender !== 'All' && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setSelectedGender('All')}
            >
              <Text style={styles.filterChipText}>{selectedGender}</Text>
              <Ionicons name="close" size={13} color="#6B4E37" />
            </TouchableOpacity>
          )}

          {selectedCategory && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.filterChipText}>{selectedCategory}</Text>
              <Ionicons name="close" size={13} color="#6B4E37" />
            </TouchableOpacity>
          )}

          {selectedPrice && selectedPrice !== 'all' && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setSelectedPrice('all')}
            >
              <Text style={styles.filterChipText}>
                {PRICE_RANGES.find((r) => r.id === selectedPrice)?.label}
              </Text>
              <Ionicons name="close" size={13} color="#6B4E37" />
            </TouchableOpacity>
          )}

          {Boolean(searchQuery.trim()) && (
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.filterChipText}>"{searchQuery}"</Text>
              <Ionicons name="close" size={13} color="#6B4E37" />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllChip}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── 4. PRODUCT GRID / LIST ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B4E37" />
        }
      >
        {loading ? (
          <SkeletonGrid count={4} />
        ) : filteredProducts.length > 0 ? (
          <View style={styles.grid}>
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetails', {
                    productId: item.id,
                    initialProduct: item,
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#A3998F" />
            <Text style={styles.emptyTitle}>No matching pieces found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your active filters or exploring other collections.
            </Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={clearAllFilters}
              activeOpacity={0.85}
            >
              <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── 5. BOTTOM SHEET FILTER MODAL ── */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Refine Catalog</Text>
                <Text style={styles.modalSubtitle}>Filter by department, category & price</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#1E1B18" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Department Selector */}
              <Text style={styles.modalSectionTitle}>DEPARTMENT</Text>
              <View style={styles.modalPillsWrap}>
                {['All', ...activeGenders].map((gender) => {
                  const isSelected = selectedGender === gender;
                  return (
                    <TouchableOpacity
                      key={gender}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setSelectedGender(gender)}
                    >
                      <Text style={[styles.modalPillText, isSelected && styles.modalPillTextActive]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subcategories (if available) */}
              {availableSubcategories.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>CATEGORY</Text>
                  <View style={styles.modalPillsWrap}>
                    <TouchableOpacity
                      style={[styles.modalPill, !selectedCategory && styles.modalPillActive]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Text style={[styles.modalPillText, !selectedCategory && styles.modalPillTextActive]}>
                        All Categories
                      </Text>
                    </TouchableOpacity>

                    {availableSubcategories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.modalPill, isSelected && styles.modalPillActive]}
                          onPress={() => setSelectedCategory(cat)}
                        >
                          <Text style={[styles.modalPillText, isSelected && styles.modalPillTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Price Range */}
              <Text style={styles.modalSectionTitle}>PRICE RANGE</Text>
              <View style={styles.modalPillsWrap}>
                {PRICE_RANGES.map((price) => {
                  const isSelected = selectedPrice === price.id;
                  return (
                    <TouchableOpacity
                      key={price.id}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setSelectedPrice(price.id)}
                    >
                      <Text style={[styles.modalPillText, isSelected && styles.modalPillTextActive]}>
                        {price.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={clearAllFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.modalResetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalApplyBtnText}>Apply ({filteredProducts.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
    backgroundColor: '#FAF8F5',
  },
  countText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#5C544E',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    ...shadows.card,
  },
  sortButtonText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#1E1B18',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    ...shadows.card,
  },
  filterBtnActive: {
    backgroundColor: '#1E1B18',
    borderColor: '#1E1B18',
  },
  filterBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#1E1B18',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#6B4E37',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
  },
  sortDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 6,
    paddingVertical: 4,
    ...shadows.card,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortOptionActive: {
    backgroundColor: '#FAF5EE',
  },
  sortOptionText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#5C544E',
  },
  sortOptionTextActive: {
    fontFamily: typography.fontSansBold,
    color: '#6B4E37',
  },
  chipsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#D8CEBF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  filterChipText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#6B4E37',
  },
  clearAllChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  clearAllText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#A3998F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16,
    color: '#1E1B18',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#8A7F75',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  resetFiltersBtn: {
    backgroundColor: '#1E1B18',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 13,
  },

  /* ── FILTER MODAL ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  modalTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 17,
    color: '#1E1B18',
  },
  modalSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSectionTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#5C544E',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  modalPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
  },
  modalPillActive: {
    backgroundColor: '#1E1B18',
    borderColor: '#1E1B18',
  },
  modalPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#5C544E',
  },
  modalPillTextActive: {
    color: '#FFFFFF',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAE4DC',
  },
  modalResetBtn: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#D8CEBF',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  modalResetBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#6B4E37',
  },
  modalApplyBtn: {
    flex: 2,
    backgroundColor: '#1E1B18',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  modalApplyBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
