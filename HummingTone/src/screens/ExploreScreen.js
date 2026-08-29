import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { useSiteContent } from '../context/SiteContentContext';

const GENDER_IMAGES = {
  Men: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
  Women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  Children: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80',
  Baby: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  Customize: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
};

export const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGender, setExpandedGender] = useState(null);
  const { activeGenders, genderCategories } = useSiteContent();

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('CategoryProducts', {
        title: `Search: "${searchQuery}"`,
        searchQuery: searchQuery.trim(),
      });
    }
  };

  const handleGenderSelect = (gender) => {
    if (gender.toLowerCase() === 'customize') {
      navigation.navigate('CustomizeTab');
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

  return (
    <View style={styles.container}>
      <Header title="Collections" />

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, hoodies, t-shirts..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Heading */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>EXPLORE BY CATEGORY</Text>
        <Text style={styles.sectionDesc}>Select a collection to discover products</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Gender Cards Accordion */}
        {activeGenders.map((gender) => {
          const categories = genderCategories[gender] || genderCategories[gender.toLowerCase()] || [];
          const isExpanded = expandedGender === gender;
          const bgImage = GENDER_IMAGES[gender] || GENDER_IMAGES.Men;

          return (
            <View key={gender} style={styles.genderCardWrapper}>
              <TouchableOpacity
                style={styles.genderCard}
                onPress={() => handleGenderSelect(gender)}
                activeOpacity={0.88}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: bgImage }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <View style={styles.cardOverlay}>
                    <View style={styles.cardTextContent}>
                      <Text style={styles.cardTitle}>{gender.toUpperCase()}</Text>
                      <Text style={styles.cardSub}>
                        {categories.length > 0 ? `${categories.length} Curated Categories` : 'View Products'}
                      </Text>
                    </View>

                    {categories.length > 0 && (
                      <TouchableOpacity
                        style={styles.expandPill}
                        onPress={(e) => {
                          e.stopPropagation();
                          setExpandedGender(isExpanded ? null : gender);
                        }}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textInverse}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Subcategories Dropdown Panel */}
              {isExpanded && categories.length > 0 && (
                <View style={styles.subCategoryPanel}>
                  <TouchableOpacity
                    style={[styles.subCatItem, styles.subCatItemHighlight]}
                    onPress={() => handleGenderSelect(gender)}
                  >
                    <Text style={styles.subCatItemHighlightText}>All {gender} Clothing</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </TouchableOpacity>

                  {categories.map((cat, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.subCatItem}
                      onPress={() => handleCategorySelect(gender, cat)}
                    >
                      <Text style={styles.subCatText}>{cat}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* All Products Banner CTA */}
        <TouchableOpacity
          style={styles.allProductsBanner}
          onPress={() =>
            navigation.navigate('CategoryProducts', {
              title: 'All Products',
            })
          }
          activeOpacity={0.88}
        >
          <View style={styles.allProductsOverlay}>
            <Text style={styles.allProductsSub}>VIEW COMPLETE CATALOG</Text>
            <Text style={styles.allProductsTitle}>All Collections</Text>
            <Text style={styles.allProductsDesc}>
              Browse through our complete catalog of men, women, kids, and custom garments.
            </Text>
          </View>
        </TouchableOpacity>

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
  searchWrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: typography.fontSerif,
    fontSize: 14,
    color: colors.textPrimary,
  },
  genderCardWrapper: {
    marginBottom: 14,
  },
  genderCard: {
    height: 120,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 22,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.textInverse,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  expandPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCategoryPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 6,
  },
  subCatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subCatItemHighlight: {
    backgroundColor: 'rgba(17, 24, 39, 0.04)',
  },
  subCatText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  subCatTextHighlight: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  allProductsBanner: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 20,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allProductsContent: {
    flex: 1,
  },
  allProductsSub: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.goldMuted,
    marginBottom: 4,
  },
  allProductsTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
  },
  allProductsArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
