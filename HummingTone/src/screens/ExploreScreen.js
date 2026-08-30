import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '../components/Icons';
import { shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSiteContent } from '../context/SiteContentContext';

const { width } = Dimensions.get('window');

const DEPARTMENT_THEMES = {
  Men: {
    bg: '#F5EFEB',
    borderColor: '#E6DCCE',
    accent: '#6B4E37',
    icon: 'shirt-outline',
    tagline: 'Tailored Silhouettes, Baggy & Streetwear',
    badge: 'ATELIER MEN',
  },
  Women: {
    bg: '#F8EFF2',
    borderColor: '#EBDCE0',
    accent: '#8C485C',
    icon: 'sparkles-outline',
    tagline: 'Contemporary Dresses, Tops & Outerwear',
    badge: 'COUTURE WOMEN',
  },
  Children: {
    bg: '#EEF4F7',
    borderColor: '#D8E5EC',
    accent: '#3E667E',
    icon: 'happy-outline',
    tagline: 'Pure Organic Cottons & Everyday Basics',
    badge: 'KIDS SUITE',
  },
  Baby: {
    bg: '#F9F5EC',
    borderColor: '#EFE7D5',
    accent: '#8A7146',
    icon: 'heart-outline',
    tagline: 'Ultra-Soft Comfort, Rompers & Bodysuits',
    badge: 'BABY LUXE',
  },
  Sports: {
    bg: '#EAF0EE',
    borderColor: '#D3E0DC',
    accent: '#2F6155',
    icon: 'fitness-outline',
    tagline: 'High-Performance Breathable Activewear',
    badge: 'SPORTS PRO',
  },
  Customize: {
    bg: '#25211D',
    borderColor: '#3D3630',
    accent: '#D4AF37',
    icon: 'color-palette-outline',
    tagline: 'Design & Print Your Bespoke Apparel',
    badge: 'CUSTOM STUDIO',
    isDark: true,
  },
};

const SORT_OPTIONS = [
  { id: 'newest', label: 'Most Recent', icon: 'time-outline' },
  { id: 'popular', label: 'Popular & Featured', icon: 'flame-outline' },
  { id: 'price_asc', label: 'Price: Low to High', icon: 'trending-down-outline' },
  { id: 'price_desc', label: 'Price: High to Low', icon: 'trending-up-outline' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_500', label: 'Under ₹500' },
  { id: '500_1000', label: '₹500 - ₹1,000' },
  { id: '1000_2000', label: '₹1,000 - ₹2,000' },
  { id: 'above_2000', label: 'Above ₹2,000' },
];

export const ExploreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeGenders, genderCategories, refreshSiteContent } = useSiteContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh dynamic categories whenever user navigates into Explore tab
  useFocusEffect(
    useCallback(() => {
      refreshSiteContent();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSiteContent();
    setRefreshing(false);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedPrice('all');
    setSelectedSort('newest');
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (q) {
      navigation.navigate('CategoryProducts', {
        title: `Search: "${q}"`,
        searchQuery: q,
        gender: selectedGender !== 'All' ? selectedGender : undefined,
        sortBy: selectedSort,
        priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
      });
    }
  };

  const handleDepartmentPress = (gender) => {
    if (gender.toLowerCase() === 'customize') {
      navigation.navigate('MainTabs', { screen: 'CustomizeTab' });
    } else {
      navigation.navigate('CategoryProducts', {
        title: `${gender}'s Collection`,
        gender,
        sortBy: selectedSort,
        priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
      });
    }
  };

  const handleSubCategoryPress = (gender, catName) => {
    navigation.navigate('CategoryProducts', {
      title: `${catName}`,
      gender,
      category: catName,
      sortBy: selectedSort,
      priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
    });
  };

  const displayedGenders = selectedGender === 'All'
    ? activeGenders
    : activeGenders.filter((g) => g.toLowerCase() === selectedGender.toLowerCase());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      {/* ── 1. TOP HEADER ── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <View>
          <Text style={styles.headerTitle}>Categories & Filter</Text>
          <Text style={styles.headerSubtitle}>Curated Apparel & Custom Atelier</Text>
        </View>

        {(selectedGender !== 'All' || selectedPrice !== 'all' || searchQuery.length > 0) ? (
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.75}>
            <Ionicons name="refresh-outline" size={14} color="#6B4E37" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── 2. SEARCH INPUT BAR ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={19} color="#8A7F75" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search oversized, shirts, jerseys, hoodies..."
            placeholderTextColor="#A3998F"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#8A7F75" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 95, 115) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B4E37" />
        }
      >
        {/* ── 3. DEPARTMENT TABS (Horizontal Pills) ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>DEPARTMENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {['All', ...activeGenders].map((dept) => {
              const isSelected = selectedGender === dept;
              return (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.deptPill,
                    isSelected && styles.deptPillActive,
                  ]}
                  onPress={() => setSelectedGender(dept)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.deptPillText,
                      isSelected && styles.deptPillTextActive,
                    ]}
                  >
                    {dept}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── 4. CATEGORY COLLECTIONS (Rich Luxury Cards) ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>COLLECTION CATALOG</Text>
            <Text style={styles.sectionMeta}>{displayedGenders.length} Departments</Text>
          </View>

          <View style={styles.cardsGrid}>
            {displayedGenders.map((gender) => {
              const theme = DEPARTMENT_THEMES[gender] || DEPARTMENT_THEMES.Men;
              const categories = genderCategories[gender] || genderCategories[gender.toLowerCase()] || [];
              const isDark = Boolean(theme.isDark);

              return (
                <View
                  key={gender}
                  style={[
                    styles.collectionCard,
                    {
                      backgroundColor: theme.bg,
                      borderColor: theme.borderColor,
                    },
                  ]}
                >
                  {/* Card Main Info */}
                  <TouchableOpacity
                    style={styles.cardMainTouch}
                    onPress={() => handleDepartmentPress(gender)}
                    activeOpacity={0.85}
                  >
                    {/* Top Row: Icon + Badge + Arrow */}
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardBadgeWrap}>
                        <View
                          style={[
                            styles.cardIconCircle,
                            { backgroundColor: isDark ? '#3D3630' : '#FFFFFF' },
                          ]}
                        >
                          <Ionicons name={theme.icon} size={18} color={theme.accent} />
                        </View>
                        <Text
                          style={[
                            styles.cardBadgeText,
                            { color: theme.accent },
                          ]}
                        >
                          {theme.badge}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.viewAllArrowCircle,
                          { backgroundColor: isDark ? '#3D3630' : '#FFFFFF' },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color={isDark ? '#D4AF37' : '#1E1B18'}
                        />
                      </View>
                    </View>

                    {/* Title & Tagline */}
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isDark ? '#FFFFFF' : '#1E1B18' },
                      ]}
                    >
                      {gender === 'Customize' ? 'Customize Studio' : `${gender}'s Fashion`}
                    </Text>

                    <Text
                      style={[
                        styles.cardTagline,
                        { color: isDark ? '#A3998F' : '#6B6259' },
                      ]}
                    >
                      {theme.tagline}
                    </Text>
                  </TouchableOpacity>

                  {/* Subcategories Chips (Inside Card) */}
                  {categories.length > 0 ? (
                    <View style={styles.subCatSection}>
                      <View style={styles.subCatHeader}>
                        <Text style={[styles.subCatTitle, { color: isDark ? '#C7BFB5' : '#8A7F75' }]}>
                          EXPLORE CATEGORIES ({categories.length})
                        </Text>
                      </View>

                      <View style={styles.subCatChipsWrap}>
                        {categories.map((cat, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.subCatChip,
                              { backgroundColor: isDark ? '#36302B' : '#FFFFFF', borderColor: isDark ? '#4A423B' : theme.borderColor },
                            ]}
                            onPress={() => handleSubCategoryPress(gender, cat)}
                            activeOpacity={0.75}
                          >
                            <Text style={[styles.subCatChipText, { color: isDark ? '#FAF8F5' : '#423B35' }]}>
                              {cat}
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={12}
                              color={theme.accent}
                              style={{ marginLeft: 3 }}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 5. QUICK PRICE FILTERS ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>PRICE BUDGET</Text>
          <View style={styles.pillsWrap}>
            {PRICE_RANGES.map((price) => {
              const isSelected = selectedPrice === price.id;
              return (
                <TouchableOpacity
                  key={price.id}
                  style={[
                    styles.pricePill,
                    isSelected && styles.pricePillActive,
                  ]}
                  onPress={() => {
                    const nextPrice = isSelected ? 'all' : price.id;
                    setSelectedPrice(nextPrice);
                    navigation.navigate('CategoryProducts', {
                      title: price.label,
                      gender: selectedGender !== 'All' ? selectedGender : undefined,
                      priceRange: nextPrice !== 'all' ? nextPrice : undefined,
                      sortBy: selectedSort,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pricePillText,
                      isSelected && styles.pricePillTextActive,
                    ]}
                  >
                    {price.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 6. SORTING MODES ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>DISCOVERY SORTING</Text>
          <View style={styles.sortGrid}>
            {SORT_OPTIONS.map((sort) => {
              const isSelected = selectedSort === sort.id;
              return (
                <TouchableOpacity
                  key={sort.id}
                  style={[
                    styles.sortCard,
                    isSelected && styles.sortCardActive,
                  ]}
                  onPress={() => {
                    setSelectedSort(sort.id);
                    navigation.navigate('CategoryProducts', {
                      title: sort.label,
                      gender: selectedGender !== 'All' ? selectedGender : undefined,
                      sortBy: sort.id,
                      priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={sort.icon}
                    size={16}
                    color={isSelected ? '#6B4E37' : '#8A7F75'}
                  />
                  <Text
                    style={[
                      styles.sortCardText,
                      isSelected && styles.sortCardTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FAF8F5',
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 20,
    color: '#1E1B18',
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#8A7F75',
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E5DCCE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  resetText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#6B4E37',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: '#1E1B18',
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#6B6259',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionMeta: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#8A7F75',
  },
  pillsScroll: {
    gap: 8,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE4DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptPillActive: {
    backgroundColor: '#1E1B18',
    borderColor: '#1E1B18',
  },
  deptPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#5C544E',
  },
  deptPillTextActive: {
    color: '#FFFFFF',
  },
  cardsGrid: {
    gap: 14,
  },
  collectionCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    ...shadows.card,
  },
  cardMainTouch: {
    marginBottom: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cardBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  viewAllArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 19,
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  cardTagline: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    lineHeight: 18,
  },
  subCatSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  subCatHeader: {
    marginBottom: 8,
  },
  subCatTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.6,
  },
  subCatChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  subCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  subCatChipText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
  },
  pricePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
  },
  pricePillActive: {
    backgroundColor: '#FAF5EE',
    borderColor: '#6B4E37',
  },
  pricePillText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#5C544E',
  },
  pricePillTextActive: {
    fontFamily: typography.fontSansBold,
    color: '#6B4E37',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  sortCardActive: {
    backgroundColor: '#FAF5EE',
    borderColor: '#6B4E37',
  },
  sortCardText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#5C544E',
  },
  sortCardTextActive: {
    fontFamily: typography.fontSansBold,
    color: '#6B4E37',
  },
});
