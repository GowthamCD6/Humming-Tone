import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Ionicons } from './Icons';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (spacing.screenPadding * 2) - spacing.sm) / 2;

export const ProductCard = ({ product, onPress, style }) => {
  const navigation = useNavigation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

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

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge Pill */}
        {product.isNewArrival ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        ) : product.is_featured ? (
          <View style={[styles.newBadge, { backgroundColor: colors.goldDark }]}>
            <Text style={styles.newBadgeText}>FEATURED</Text>
          </View>
        ) : null}

        {/* Wishlist Heart Button */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={handleWishlistToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? colors.error : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Meta */}
      <View style={styles.metaContainer}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category || product.brand || 'HUMMING TONE'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
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
    marginBottom: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.subtle,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.32,
    backgroundColor: colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: colors.textInverse,
    fontSize: 8.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.2,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metaContainer: {
    padding: 10,
    backgroundColor: colors.cardBg,
  },
  category: {
    fontSize: 9.5,
    fontWeight: typography.weightSemiBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.goldDark,
    marginBottom: 3,
    fontFamily: typography.fontSans,
  },
  title: {
    fontSize: 13,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: typography.fontSerif,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14.5,
    fontWeight: typography.weightBold,
    color: colors.primary,
    fontFamily: typography.fontSans,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    fontFamily: typography.fontSans,
  },
});
