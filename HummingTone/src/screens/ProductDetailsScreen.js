import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductService } from '../api/services';

const { width } = Dimensions.get('window');
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const COLOR_SWATCHES = [
  { id: 'brown', name: 'Brown', color: '#704F38' },
  { id: 'black', name: 'Black', color: '#1F1A17' },
  { id: 'cream', name: 'Cream', color: '#EAE1D8' },
  { id: 'sage', name: 'Sage', color: '#8A9A86' },
];

export const ProductDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { productId, initialProduct } = route.params || {};
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [isExpandedDesc, setIsExpandedDesc] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchDetails = async () => {
      if (productId) {
        try {
          const data = await ProductService.fetchProductById(productId);
          if (data) setProduct(data);
        } catch (e) {
          console.warn('Error fetching product details:', e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetails();
  }, [productId]);

  if (!product && !loading) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Product not found.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const galleryImages = [
    product?.image,
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  ].filter(Boolean);

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const rating = product?.rating || 4.5;
  const formattedPrice = `₹${(product?.price || 0).toLocaleString('en-IN')}`;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedSize, 1);
      Alert.alert(
        'Added to Bag',
        `${product.name} (Size: ${selectedSize}) added to your shopping bag.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Bag', onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }) },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. TOP HEADER BAR (Template Exact) ── */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.circleIconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <TouchableOpacity
          style={styles.circleIconBtn}
          onPress={() => product && toggleWishlist(product)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. LARGE MAIN PRODUCT IMAGE ── */}
        <View style={styles.mainImageWrap}>
          <Image
            source={{ uri: galleryImages[selectedImageIndex] || product?.image }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Thumbnails Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsRow}
        >
          {galleryImages.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.thumbnailWrap,
                selectedImageIndex === idx && styles.thumbnailWrapActive,
              ]}
              onPress={() => setSelectedImageIndex(idx)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── 3. PRODUCT TITLE & RATING ROW ── */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryOverline}>
                {product?.category || "Female's Style"}
              </Text>
              <Text style={styles.productTitle}>{product?.name || 'Luxury Tailored Piece'}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color={colors.star} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* ── 4. PRODUCT DETAILS DESCRIPTION ── */}
          <Text style={styles.sectionHeading}>Product Details</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={isExpandedDesc ? undefined : 3}
          >
            {product?.description ||
              'Crafted from 100% premium combed cotton, tailored for everyday comfort and structured luxury silhouette. Features reinforced seams, pre-shrunk weave, and breathable natural drape.'}
          </Text>
          <TouchableOpacity onPress={() => setIsExpandedDesc(!isExpandedDesc)}>
            <Text style={styles.readMoreText}>
              {isExpandedDesc ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>

          {/* ── 5. SELECT SIZE PILLS (Template Exact) ── */}
          <Text style={styles.sectionHeading}>Select Size</Text>
          <View style={styles.sizePillsRow}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizePill,
                  selectedSize === size && styles.sizePillActive,
                ]}
                onPress={() => setSelectedSize(size)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sizePillText,
                    selectedSize === size && styles.sizePillTextActive,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 6. SELECT COLOR (Template Exact) ── */}
          <Text style={styles.sectionHeading}>
            Select Color : <Text style={styles.colorSelectedName}>{selectedColor.name}</Text>
          </Text>
          <View style={styles.colorsRow}>
            {COLOR_SWATCHES.map((swatch) => (
              <TouchableOpacity
                key={swatch.id}
                style={[
                  styles.colorCircle,
                  { backgroundColor: swatch.color },
                  selectedColor.id === swatch.id && styles.colorCircleActive,
                ]}
                onPress={() => setSelectedColor(swatch)}
                activeOpacity={0.8}
              >
                {selectedColor.id === swatch.id && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={swatch.id === 'cream' ? colors.primary : '#FFFFFF'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── 7. BOTTOM STICKY BAR (Template Exact) ── */}
      <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceValue}>{formattedPrice}</Text>
        </View>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.88}
        >
          <Ionicons name="bag-handle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  circleIconBtn: {
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

  // 2. Main Image & Gallery
  mainImageWrap: {
    width: '100%',
    height: 320,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailsRow: {
    gap: 10,
    marginBottom: 18,
  },
  thumbnailWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceMuted,
  },
  thumbnailWrapActive: {
    borderColor: colors.primary,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },

  // 3. Info Section
  infoSection: {
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  categoryOverline: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  productTitle: {
    fontFamily: typography.fontSans,
    fontSize: 20,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingTop: 4,
  },
  ratingText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },

  // 4. Description
  sectionHeading: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  descriptionText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  readMoreText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.primary,
    marginTop: 4,
  },

  // 5. Size Pills
  sizePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sizePill: {
    minWidth: 44,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizePillText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  sizePillTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
  },

  // 6. Colors
  colorSelectedName: {
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // 7. Bottom Sticky Bar
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textMuted,
  },
  totalPriceValue: {
    fontFamily: typography.fontSans,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
    gap: 8,
  },
  addToCartText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },

  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
  },
});
