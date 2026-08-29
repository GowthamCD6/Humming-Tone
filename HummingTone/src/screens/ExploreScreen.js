import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useSiteContent } from '../context/SiteContentContext';
import { SITE_ASSETS } from '../api/siteAssets';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 52) / 2;

const GENDER_IMAGES = {
  Men: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
  Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  Children: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
  Baby: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  Customize: SITE_ASSETS.homeHero,
};

const SORT_OPTIONS = ['Most Recent', 'Popular', 'Price: Low to High', 'Price: High to Low'];
const REVIEW_OPTIONS = [
  { rating: 4.5, stars: 5 },
  { rating: 4.0, stars: 4 },
  { rating: 3.5, stars: 3.5 },
  { rating: 3.0, stars: 3 },
];

export const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenderTab, setSelectedGenderTab] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [selectedRating, setSelectedRating] = useState(4.0);
  const [expandedGender, setExpandedGender] = useState(null);
  const { activeGenders, genderCategories } = useSiteContent();
  const insets = useSafeAreaInsets();

  const handleSearchSubmit = (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (q) {
      navigation.navigate('CategoryProducts', {
        title: `Search: "${q}"`,
        searchQuery: q,
      });
    }
  };

  const handleGenderSelect = (gender) => {
    if (gender.toLowerCase() === 'customize') {
      navigation.navigate('MainTabs', { screen: 'CustomizeTab' });
    } else {
      navigation.navigate('CategoryProducts', {
        title: `${gender}'s Collection`,
        gender,
      });
    }
  };

  const handleCategorySelect = (gender, categoryName) => {
    navigation.navigate('CategoryProducts', {
      title: `${categoryName}`,
      gender,
      category: categoryName,
    });
  };

  const filteredGenders = selectedGenderTab === 'All'
    ? activeGenders
    : activeGenders.filter((g) => g.toLowerCase() === selectedGenderTab.toLowerCase());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. TOP HEADER (Template Exact) ── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter & Categories</Text>
        <TouchableOpacity onPress={() => { setSelectedGenderTab('All'); setSelectedSort('Most Recent'); setSearchQuery(''); }}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. SEARCH INPUT BAR (Template Exact) ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories, hoodies, jackets..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearchSubmit()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 90) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 3. GENDER PILLS SECTION (Template Exact) ── */}
        <Text style={styles.filterSectionTitle}>Gender</Text>
        <View style={styles.pillsWrap}>
          {['All', ...activeGenders].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterPill,
                selectedGenderTab === tab && styles.filterPillActive,
              ]}
              onPress={() => setSelectedGenderTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedGenderTab === tab && styles.filterPillTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 4. SORT BY PILLS SECTION (Template Exact) ── */}
        <Text style={styles.filterSectionTitle}>Sort by</Text>
        <View style={styles.pillsWrap}>
          {SORT_OPTIONS.map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.filterPill,
                selectedSort === sort && styles.filterPillActive,
              ]}
              onPress={() => setSelectedSort(sort)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedSort === sort && styles.filterPillTextActive,
                ]}
              >
                {sort}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 5. REVIEWS RATING FILTER (Template Exact) ── */}
        <Text style={styles.filterSectionTitle}>Reviews</Text>
        <View style={styles.reviewsList}>
          {REVIEW_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.rating}
              style={styles.reviewRow}
              onPress={() => setSelectedRating(item.rating)}
              activeOpacity={0.8}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(item.stars) ? 'star' : star - 0.5 === item.stars ? 'star-half' : 'star-outline'}
                    size={18}
                    color={colors.star}
                  />
                ))}
                <Text style={styles.reviewScoreText}>{item.rating.toFixed(1)}</Text>
              </View>
              <View style={[styles.radioCircle, selectedRating === item.rating && styles.radioCircleActive]}>
                {selectedRating === item.rating && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 6. CATEGORY DIRECTORY TILES (Template Exact) ── */}
        <Text style={styles.filterSectionTitle}>Category Collections</Text>
        <View style={styles.lookbookGrid}>
          {filteredGenders.map((gender) => {
            const categories = genderCategories[gender] || genderCategories[gender.toLowerCase()] || [];
            const isExpanded = expandedGender === gender;
            const bgImage = GENDER_IMAGES[gender] || GENDER_IMAGES.Men;

            return (
              <View key={gender} style={styles.lookbookGridItem}>
                <TouchableOpacity
                  style={styles.categoryTile}
                  onPress={() => handleGenderSelect(gender)}
                  activeOpacity={0.88}
                >
                  <Image
                    source={{ uri: bgImage }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <View style={styles.categoryTileOverlay}>
                    <Text style={styles.categoryTileTitle}>{gender}</Text>
                    <Text style={styles.categoryTileCount}>
                      {categories.length > 0 ? `${categories.length} Items` : 'Explore'}
                    </Text>

                    {categories.length > 0 && (
                      <TouchableOpacity
                        style={styles.tileExpandBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setExpandedGender(isExpanded ? null : gender);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Subcategory Drawer */}
                {isExpanded && categories.length > 0 && (
                  <View style={styles.subCatDrawer}>
                    <TouchableOpacity
                      style={styles.subCatAllLink}
                      onPress={() => handleGenderSelect(gender)}
                    >
                      <Text style={styles.subCatAllText}>All {gender} Clothing</Text>
                      <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                    </TouchableOpacity>

                    {categories.map((cat, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.subCatRow}
                        onPress={() => handleCategorySelect(gender, cat)}
                      >
                        <Text style={styles.subCatRowText}>{cat}</Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── 7. APPLY FILTER BUTTON (Template Exact) ── */}
        <TouchableOpacity
          style={styles.applyFilterBtn}
          onPress={() => handleGenderSelect(selectedGenderTab === 'All' ? 'Men' : selectedGenderTab)}
          activeOpacity={0.88}
        >
          <Text style={styles.applyFilterBtnText}>Apply Filter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
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
  resetText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightSemiBold,
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: colors.textPrimary,
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterSectionTitle: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 10,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
  },
  reviewsList: {
    gap: 10,
    marginTop: 4,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewScoreText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  lookbookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  lookbookGridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 14,
  },
  categoryTile: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  categoryTileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 26, 23, 0.4)',
    padding: 12,
    justifyContent: 'flex-end',
  },
  categoryTileTitle: {
    fontFamily: typography.fontSans,
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },
  categoryTileCount: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  tileExpandBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCatDrawer: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    marginTop: 6,
    padding: 8,
  },
  subCatAllLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 4,
  },
  subCatAllText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  subCatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  subCatRowText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  applyFilterBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },
});
