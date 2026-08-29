import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
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

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.isNewArrival && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

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
            color={isWishlisted ? colors.accent : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Meta */}
      <View style={styles.metaContainer}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category || product.brand || 'ATELIER COLLECTION'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
    backgroundColor: colors.cardBg,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.35,
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
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  newBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  metaContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  category: {
    fontSize: 9.5,
    fontWeight: typography.weightSemiBold,
    letterSpacing: typography.spacingWide,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: typography.fontSans,
  },
  title: {
    fontSize: 13.5,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: typography.fontSerif,
  },
  price: {
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.primary,
    fontFamily: typography.fontSans,
  },
});
