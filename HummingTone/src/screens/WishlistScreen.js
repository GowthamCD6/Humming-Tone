import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - (spacing.screenPadding * 2) - spacing.md) / 2;

export const WishlistScreen = ({ navigation }) => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (item) => {
    addToCart(item, null, 1);
    removeFromWishlist(item.id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id, initialProduct: item })}
        activeOpacity={0.88}
        style={styles.imageWrap}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeFromWishlist(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand || 'ATELIER COLLECTION'}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>₹{(item.price || 0).toLocaleString('en-IN')}</Text>

        <TouchableOpacity
          style={styles.addToBagBtn}
          onPress={() => handleMoveToBag(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-outline" size={14} color={colors.textInverse} />
          <Text style={styles.addToBagText}>Move to Bag</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header
        title="Saved Items"
        showBack={true}
        rightElement={
          wishlistItems.length > 0 ? (
            <TouchableOpacity onPress={clearWishlist} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>YOUR WISHLIST IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Curate your personal collection of bespoke fragrances, tailored instruments, and luxury apparel.
          </Text>
          <Button
            title="Explore Collection"
            onPress={() => navigation.navigate('ExploreTab')}
            style={styles.exploreBtn}
          />
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
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
    backgroundColor: colors.background,
  },
  clearAllText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightSemiBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageWrap: {
    width: '100%',
    height: ITEM_WIDTH * 1.25,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: spacing.sm,
  },
  brand: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontFamily: typography.fontSerif,
    fontSize: 13,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    fontWeight: typography.weightBold,
    color: colors.primary,
    marginBottom: 8,
  },
  addToBagBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addToBagText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 16,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  exploreBtn: {
    minWidth: 200,
  },
});

export default WishlistScreen;
