import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from './Icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Header = ({ title, showBack = false, rightElement = null }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.content}>
        {/* Left Action / Logo */}
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoWrap}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.logoText}>HUMMING TONE</Text>
              <Text style={styles.logoSubtext}>OFFICIAL STORE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title (if provided in detail screens) */}
        {title && (
          <View style={styles.center}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right Actions */}
        <View style={styles.right}>
          {rightElement || (
            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('ExploreTab')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="search-outline" size={21} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('Wishlist')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart-outline" size={22} color={colors.textPrimary} />
                {wishlistCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('CartTab')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="bag-outline" size={22} color={colors.textPrimary} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 100,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    flexDirection: 'column',
  },
  logoText: {
    fontFamily: typography.fontSerif,
    fontSize: 16,
    fontWeight: typography.weightBold,
    letterSpacing: typography.spacingWidest,
    color: colors.primary,
  },
  logoSubtext: {
    fontFamily: typography.fontSans,
    fontSize: 8,
    letterSpacing: 2,
    color: colors.goldMuted,
    fontWeight: typography.weightSemiBold,
    marginTop: -2,
  },
  title: {
    fontFamily: typography.fontSerif,
    fontSize: typography.sizeSubhead,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
    letterSpacing: typography.spacingNormal,
  },
  iconButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: typography.weightBold,
    fontFamily: typography.fontSans,
  },
});
