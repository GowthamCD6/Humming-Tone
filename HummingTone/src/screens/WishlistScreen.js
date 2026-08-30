import React, { useState, useMemo } from 'react';
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
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const FILTER_TABS = ['All', 'Hoodies', 'T-Shirts', 'Jackets', 'Pants', 'Custom'];

export const WishlistScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { wishlistItems, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = useMemo(() => {
    if (activeTab === 'All') return wishlistItems;
    const tabLower = activeTab.toLowerCase();
    return wishlistItems.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const subcat = (item.subcategory || '').toLowerCase();
      return name.includes(tabLower) || cat.includes(tabLower) || subcat.includes(tabLower);
    });
  }, [activeTab, wishlistItems]);

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  const handleQuickAddBag = (item) => {
    addToCart(item, item.size || 'Standard', 1);
    Alert.alert(
      'Added to Bag',
      `${item.name} has been added to your shopping bag.`,
      [
        { text: 'Keep Exploring', style: 'cancel' },
        { text: 'View Bag', onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }) },
      ]
    );
  };

  const renderWishlistItem = ({ item }) => {
    const originalPrice = parseFloat(item.original_price || item.originalPrice || item.price * 1.25);
    const currentPrice = parseFloat(item.price) || 0;
    const hasDiscount = originalPrice > currentPrice;
    const discountPercent = hasDiscount
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id, initialProduct: item })}
        activeOpacity={0.88}
      >
        {/* Product Image Wrap */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image || (item.images && item.images[0]) }}
            style={styles.productImg}
            resizeMode="cover"
          />

          {/* Discount Pill */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}

          {/* Remove / Heart Button */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleWishlist(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={17} color="#E53E3E" />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.cardDetails}>
          <Text style={styles.brandText}>{(item.brand || 'HUMMING TONE').toUpperCase()}</Text>
          <Text style={styles.titleText} numberOfLines={1}>{item.name}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{currentPrice.toLocaleString('en-IN')}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{Math.round(originalPrice).toLocaleString('en-IN')}</Text>
            )}
          </View>

          {/* Move to Bag Action Button */}
          <TouchableOpacity
            style={styles.addBagBtn}
            onPress={() => handleQuickAddBag(item)}
            activeOpacity={0.85}
          >
            <Ionicons name="bag-handle-outline" size={14} color="#6B4E37" />
            <Text style={styles.addBagBtnText}>Move to Bag</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. LUXURY TOP APP BAR ── */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Saved Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {wishlistCount === 0 ? 'No items saved' : `${wishlistCount} ${wishlistCount === 1 ? 'Curated Piece' : 'Curated Pieces'}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-handle-outline" size={20} color="#1E1B18" />
        </TouchableOpacity>
      </View>

      {/* ── 2. FILTER PILLS (Only shown if items exist) ── */}
      {wishlistItems.length > 0 && (
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── 3. WISHLIST GRID OR EMPTY STATE ── */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={42} color="#8A7F75" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite luxury pieces, oversized hoodies, and atelier creations to easily find and order them later.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>Explore Collections</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderWishlistItem}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max((insets.bottom || 0) + 30, 40) },
          ]}
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
    backgroundColor: '#FAF8F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  topBarCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16.5,
    color: '#1E1B18',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1,
  },
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },

  /* Filter Pills */
  filterWrap: {
    paddingVertical: 10,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  filterScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
  },
  filterPillActive: {
    backgroundColor: '#6B4E37',
    borderColor: '#6B4E37',
  },
  filterPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#7D726A',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  /* List & Grid Cards */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    overflow: 'hidden',
    ...shadows.subtle,
  },
  imageWrap: {
    width: '100%',
    height: COLUMN_WIDTH * 1.25,
    backgroundColor: '#F7F3EE',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#C53030',
    paddingHorizontal: 6.5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  cardDetails: {
    padding: 12,
  },
  brandText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#8A7F75',
    marginBottom: 2,
  },
  titleText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  currentPrice: {
    fontFamily: typography.fontSansBold,
    fontSize: 14.5,
    color: '#1E1B18',
  },
  originalPrice: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#A3998F',
    textDecorationLine: 'line-through',
  },
  addBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#EAE2D8',
    gap: 6,
  },
  addBagBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11.5,
    color: '#6B4E37',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 19,
    color: '#1E1B18',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#7D726A',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 48,
    paddingHorizontal: 26,
    borderRadius: 24,
    gap: 8,
    ...shadows.card,
  },
  exploreBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});

export default WishlistScreen;
