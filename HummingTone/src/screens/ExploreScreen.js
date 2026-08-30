import React, { useState, useCallback } from 'react';
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
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '../components/Icons';
import { shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSiteContent } from '../context/SiteContentContext';

const { width } = Dimensions.get('window');

const DEPARTMENT_CARDS = {
  Men: {
    badge: 'ATELIER 01',
    title: 'MENS COLLECTION',
    tagline: 'Tailored oversized fits, structured shirts & streetwear',
    buttonText: 'Explore Collection',
    image: require('../assets/mens.png'),
    bg: '#EFE6DC',
    accent: '#6B4E37',
    borderColor: '#DFD3C4',
    rightOffset: -12,
    widthPercent: '62%',
    heightPercent: '100%',
  },
  Women: {
    badge: 'COUTURE 02',
    title: 'WOMENS COUTURE',
    tagline: 'Contemporary silhouettes, artisan dresses & outerwear',
    buttonText: 'Explore Collection',
    image: require('../assets/women.png'),
    bg: '#F7E9EC',
    accent: '#8A3B4D',
    borderColor: '#EBCCD3',
    rightOffset: -12,
    widthPercent: '62%',
    heightPercent: '100%',
  },
  Children: {
    badge: 'KIDS SUITE 03',
    title: 'CHILDRENS SUITE',
    tagline: 'Pure organic cottons, playful fits & everyday luxury',
    buttonText: 'Explore Collection',
    image: require('../assets/children.png'),
    bg: '#E7EFE7',
    accent: '#2E5B3F',
    borderColor: '#D2E2D2',
    rightOffset: -12,
    widthPercent: '60%',
    heightPercent: '98%',
  },
  Baby: {
    badge: 'BABY LUXE 04',
    title: 'BABY & TODDLERS',
    tagline: 'Ultra-soft comfort, rompers & cozy newborn essentials',
    buttonText: 'Explore Collection',
    image: require('../assets/baby.png'),
    bg: '#F6EDE2',
    accent: '#7D5F3D',
    borderColor: '#E8D9C7',
    rightOffset: -8,
    widthPercent: '58%',
    heightPercent: '96%',
  },
  Sports: {
    badge: 'PRO ATHLETICS 05',
    title: 'SPORTS PERFORMANCE',
    tagline: 'High-performance breathable activewear & training gear',
    buttonText: 'Explore Collection',
    image: require('../assets/sports.png'),
    bg: '#E4ECF0',
    accent: '#24505C',
    borderColor: '#CEE0E6',
    rightOffset: -14,
    widthPercent: '64%',
    heightPercent: '100%',
  },
  Customize: {
    badge: 'BESPOKE 06',
    title: 'CUSTOM STUDIO',
    tagline: 'Personalize your premium fabrics, colors & custom prints',
    buttonText: 'Design Studio',
    image: require('../assets/customize.png'),
    bg: '#E6DFD7',
    accent: '#57483C',
    borderColor: '#D4C8BC',
    rightOffset: -12,
    widthPercent: '62%',
    heightPercent: '96%',
  },
};

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_500', label: 'Under ₹500' },
  { id: '500_1000', label: '₹500 - ₹1,000' },
  { id: '1000_2000', label: '₹1,000 - ₹2,000' },
  { id: 'above_2000', label: 'Above ₹2,000' },
];

const RATING_FILTER_OPTIONS = [
  { rating: 4.5, stars: 4.5, label: '4.5 ★ & Above', desc: 'Top rated luxury drops' },
  { rating: 4.0, stars: 4.0, label: '4.0 ★ & Above', desc: 'Highly rated by patrons' },
  { rating: 3.5, stars: 3.5, label: '3.5 ★ & Above', desc: 'Popular atelier designs' },
  { rating: 3.0, stars: 3.0, label: '3.0 ★ & Above', desc: 'All reviewed pieces' },
];

export const ExploreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeGenders, refreshSiteContent } = useSiteContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedRating, setSelectedRating] = useState(null);
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
    setSelectedRating(null);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (q) {
      navigation.navigate('CategoryProducts', {
        title: `Search: "${q}"`,
        searchQuery: q,
        gender: selectedGender !== 'All' ? selectedGender : undefined,
        priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
        minRating: selectedRating,
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
        priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
        minRating: selectedRating,
      });
    }
  };

  const displayedGenders = selectedGender === 'All'
    ? activeGenders
    : activeGenders.filter((g) => g.toLowerCase() === selectedGender.toLowerCase());

  // Proper Safe Area Top Calculation
  const topSafePadding = Math.max(
    (insets.top || 0) + 12,
    (StatusBar.currentHeight || 0) + 12,
    Platform.OS === 'android' ? 34 : 44
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. TOP HEADER ── */}
      <View style={[styles.topBar, { paddingTop: topSafePadding }]}>
        <View>
          <Text style={styles.headerTitle}>Categories & Filter</Text>
          <Text style={styles.headerSubtitle}>Curated Apparel & Custom Atelier</Text>
        </View>
      </View>

      {/* ── 2. SEARCH INPUT BAR ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleSearchSubmit} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={19} color="#8A7F75" />
          </TouchableOpacity>
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
          { paddingBottom: Math.max((insets.bottom || 0) + 65, 75) },
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

        {/* ── 4. DISTINCT LOOKBOOK COLLECTION CARDS ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>COLLECTION CATALOG</Text>
            <Text style={styles.sectionMeta}>{displayedGenders.length} Collections</Text>
          </View>

          <View style={styles.cardsList}>
            {displayedGenders.map((gender) => {
              const card = DEPARTMENT_CARDS[gender] || DEPARTMENT_CARDS.Men;

              return (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.lookbookCard,
                    { backgroundColor: card.bg, borderColor: card.borderColor },
                  ]}
                  onPress={() => handleDepartmentPress(gender)}
                  activeOpacity={0.88}
                >
                  {/* Left Editorial Content */}
                  <View style={styles.cardContentLeft}>
                    {/* Unique Top Badge */}
                    <View style={styles.badgePill}>
                      <Text style={[styles.badgePillText, { color: card.accent }]}>
                        {card.badge}
                      </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.cardMainTitle} numberOfLines={1}>
                      {card.title}
                    </Text>

                    {/* Description Tagline */}
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {card.tagline}
                    </Text>

                    {/* Distinct Action Button with Icon */}
                    <View style={[styles.exploreBtn, { borderColor: card.accent }]}>
                      <Text style={[styles.exploreBtnText, { color: card.accent }]}>
                        {card.buttonText}
                      </Text>
                      <View style={[styles.exploreBtnCircle, { backgroundColor: card.accent }]}>
                        <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>

                  {/* Right Studio Halo Pedestal */}
                  <View style={styles.studioHalo} />

                  {/* Right Model Cutout Image */}
                  <View
                    style={[
                      styles.cardRightImageWrap,
                      {
                        right: card.rightOffset,
                        width: card.widthPercent,
                        height: card.heightPercent,
                      },
                    ]}
                  >
                    <Image
                      source={card.image}
                      style={styles.cardModelImage}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
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
                      minRating: selectedRating,
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

        {/* ── 6. STAR RATING & REVIEWS FILTER ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>CUSTOMER RATINGS</Text>
            <Text style={styles.sectionMeta}>Verified Impressions</Text>
          </View>

          <View style={styles.ratingsList}>
            {RATING_FILTER_OPTIONS.map((item) => {
              const isSelected = selectedRating === item.rating;
              return (
                <TouchableOpacity
                  key={item.rating}
                  style={[styles.ratingCard, isSelected && styles.ratingCardActive]}
                  onPress={() => {
                    const nextRating = isSelected ? null : item.rating;
                    setSelectedRating(nextRating);
                    navigation.navigate('CategoryProducts', {
                      title: `${item.label} Rated`,
                      gender: selectedGender !== 'All' ? selectedGender : undefined,
                      priceRange: selectedPrice !== 'all' ? selectedPrice : undefined,
                      minRating: nextRating,
                    });
                  }}
                  activeOpacity={0.82}
                >
                  <View style={styles.ratingInfoWrap}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={
                            star <= Math.floor(item.stars)
                              ? 'star'
                              : star - 0.5 === item.stars
                              ? 'star-half'
                              : 'star-outline'
                          }
                          size={17}
                          color="#D4AF37"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text style={styles.ratingScoreLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.ratingDescText}>{item.desc}</Text>
                  </View>

                  <View style={[styles.ratingRadio, isSelected && styles.ratingRadioActive]}>
                    {isSelected && <View style={styles.ratingRadioDot} />}
                  </View>
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
    marginBottom: 20,
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
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
  },
  deptPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#5C544E',
  },
  deptPillTextActive: {
    color: '#FFFFFF',
  },

  /* ── DISTINCT LOOKBOOK CARDS ── */
  cardsList: {
    gap: 14,
  },
  lookbookCard: {
    width: width - 40,
    height: 178,
    borderRadius: 22,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    ...shadows.card,
  },
  cardContentLeft: {
    width: '58%',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 14,
    justifyContent: 'space-between',
    zIndex: 3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    gap: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgePillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  cardMainTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16.5,
    color: '#1E1B18',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  cardDescription: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#655A51',
    lineHeight: 16,
    marginBottom: 4,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 18,
    gap: 7,
    ...shadows.card,
  },
  exploreBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  exploreBtnCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studioHalo: {
    position: 'absolute',
    right: 12,
    top: 16,
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    zIndex: 1,
  },
  cardRightImageWrap: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  cardModelImage: {
    width: '100%',
    height: '100%',
  },

  /* ── PRICE PILLS ── */
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

  /* ── RATING CARDS ── */
  ratingsList: {
    gap: 10,
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE4DC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.card,
  },
  ratingCardActive: {
    borderColor: '#6B4E37',
    backgroundColor: '#FAF5EE',
  },
  ratingInfoWrap: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  ratingScoreLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#1E1B18',
    marginLeft: 8,
  },
  ratingDescText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#8A7F75',
  },
  ratingRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#A3998F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  ratingRadioActive: {
    borderColor: '#6B4E37',
  },
  ratingRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B4E37',
  },
});
