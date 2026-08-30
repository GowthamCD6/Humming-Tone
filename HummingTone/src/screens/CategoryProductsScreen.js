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
import { shadows } from '../theme/colors';
import { typography } from '../theme/typography';
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
  { id: 'all', label: 'All Prices' },
  { id: 'under_500', label: 'Under ₹500', max: 500 },
  { id: '500_1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: '1000_2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { id: 'above_2000', label: 'Above ₹2,000', min: 2000 },
];

export const CategoryProductsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeGenders, genderCategories } = useSiteContent();

  const {
    title = 'Collection Pieces',
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

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
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

  // Active filter count (excluding default page gender)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPrice && selectedPrice !== 'all') count++;
    if (selectedRating != null) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedPrice, selectedRating, searchQuery]);

  const clearAllFilters = () => {
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

      {/* ── 1. SUBCATEGORY PILL BAR ── */}
      {availableSubcategories.length > 0 && (
        <View style={styles.subCatBarWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCatScroll}
          >
            <TouchableOpacity
              style={[
                styles.subCatHeaderPill,
                !selectedCategory && styles.subCatHeaderPillActive,
              ]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.subCatHeaderPillText,
                  !selectedCategory && styles.subCatHeaderPillTextActive,
                ]}
              >
                All Pieces
              </Text>
            </TouchableOpacity>

            {availableSubcategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.subCatHeaderPill,
                    isSelected && styles.subCatHeaderPillActive,
                  ]}
                  onPress={() => setSelectedCategory(isSelected ? null : cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.subCatHeaderPillText,
                      isSelected && styles.subCatHeaderPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── 2. METADATA & SORT / FILTER CONTROLS BAR ── */}
      <View style={styles.controlBar}>
        <Text style={styles.countText}>
          {loading ? 'Curating pieces...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Piece Available' : 'Pieces Available'}`}
        </Text>

        <View style={styles.controlButtonsRow}>
          {/* Quick Sort Button */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={14} color="#1E1B18" />
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
              name="options-outline"
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

      {/* ── 3. SORT DROPDOWN OVERLAY ── */}
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

      {/* ── 4. COMPACT ACTIVE FILTER CHIPS (Only if price/search filter active) ── */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeChipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsScroll}
          >
            {selectedPrice && selectedPrice !== 'all' && (
              <TouchableOpacity
                style={styles.compactChip}
                onPress={() => setSelectedPrice('all')}
              >
                <Text style={styles.compactChipText}>
                  {PRICE_RANGES.find((r) => r.id === selectedPrice)?.label}
                </Text>
                <Ionicons name="close" size={12} color="#6B4E37" />
              </TouchableOpacity>
            )}

            {selectedRating != null && (
              <TouchableOpacity
                style={styles.compactChip}
                onPress={() => setSelectedRating(null)}
              >
                <Text style={styles.compactChipText}>{selectedRating}★ & Above</Text>
                <Ionicons name="close" size={12} color="#6B4E37" />
              </TouchableOpacity>
            )}

            {Boolean(searchQuery.trim()) && (
              <TouchableOpacity
                style={styles.compactChip}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.compactChipText}>"{searchQuery}"</Text>
                <Ionicons name="close" size={12} color="#6B4E37" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={clearAllFilters} style={styles.compactClearAll}>
              <Text style={styles.compactClearAllText}>Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ── 5. PRODUCT GRID ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max((insets.bottom || 0) + 30, 45) },
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
            <Ionicons name="sparkles-outline" size={48} color="#A3998F" />
            <Text style={styles.emptyTitle}>No matching pieces in this collection</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting "All Pieces" or adjusting your active filter preferences.
            </Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={clearAllFilters}
              activeOpacity={0.85}
            >
              <Text style={styles.resetFiltersBtnText}>Show All Collection Pieces</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── 6. BOTTOM SHEET FILTER MODAL ── */}
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
                <Text style={styles.modalTitle}>Refine Collection</Text>
                <Text style={styles.modalSubtitle}>Filter by category, budget & ratings</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#1E1B18" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Category Pills */}
              {availableSubcategories.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>CATEGORY</Text>
                  <View style={styles.modalPillsWrap}>
                    <TouchableOpacity
                      style={[styles.modalPill, !selectedCategory && styles.modalPillActive]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Text style={[styles.modalPillText, !selectedCategory && styles.modalPillTextActive]}>
                        All Pieces
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
              <Text style={styles.modalSectionTitle}>BUDGET</Text>
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
                <Text style={styles.modalApplyBtnText}>Show Results ({filteredProducts.length})</Text>
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
  subCatBarWrap: {
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
    paddingVertical: 10,
  },
  subCatScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subCatHeaderPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
  },
  subCatHeaderPillActive: {
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
  },
  subCatHeaderPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#5C544E',
  },
  subCatHeaderPillTextActive: {
    color: '#FFFFFF',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
    backgroundColor: '#FAF8F5',
  },
  countText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#5C544E',
    letterSpacing: 0.2,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 12,
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
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...shadows.card,
  },
  filterBtnActive: {
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
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
  activeChipsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
    backgroundColor: '#FAF8F5',
  },
  activeChipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#D8CEBF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    height: 28,
  },
  compactChipText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#6B4E37',
  },
  compactClearAll: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  compactClearAllText: {
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
    textAlign: 'center',
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
    backgroundColor: '#6B4E37',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
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
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
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
    backgroundColor: '#6B4E37',
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
