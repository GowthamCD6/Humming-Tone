import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Ionicons } from './Icons';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const ProductCard = ({ product, onPress, style }) => {
  const navigation = useNavigation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product?.id);

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      navigation.navigate('ProductDetails', { productId: product.id, initialProduct: product });
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation?.();
    toggleWishlist(product);
  };

  const formattedPrice = `₹${(product.price || 0).toLocaleString('en-IN')}`;
  const originalPrice = product.original_price ? `₹${Number(product.original_price).toLocaleString('en-IN')}` : null;
  const rating = product.rating || (4.3 + (product.id ? (product.id % 7) * 0.1 : 0.4)).toFixed(1);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top-Right Heart Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={handleWishlistToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={16}
            color={isWishlisted ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Rating Tag on Image Bottom-Left */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color={colors.star} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      {/* Product Meta Details */}
      <View style={styles.metaContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {product.category || product.brand || 'Apparel'}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formattedPrice}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.28,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  metaContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 13.5,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    fontFamily: typography.fontSans,
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: typography.fontSans,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    fontFamily: typography.fontSans,
  },
  originalPrice: {
    fontSize: 11.5,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    fontFamily: typography.fontSans,
  },
});
