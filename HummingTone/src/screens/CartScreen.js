import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';

export const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    cartCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    gstAmount,
    shippingFee,
    finalTotal,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyCoupon = () => {
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    if (res.success) {
      Alert.alert('Privilege Applied', res.message);
      setPromoInput('');
    } else {
      Alert.alert('Invalid Code', res.message);
    }
  };

  const confirmRemove = (item) => {
    Alert.alert(
      'Remove Piece',
      `Remove "${item.name}" from your bag?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.cartItemId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Shopping Bag" rightElement={
        cartItems.length > 0 ? (
          <TouchableOpacity onPress={clearCart} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.clearText}>CLEAR</Text>
          </TouchableOpacity>
        ) : null
      } />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptyDesc}>
            Discover our curated bespoke silhouettes and elevate your modern wardrobe.
          </Text>
          <Button
            title="DISCOVER COLLECTIONS"
            onPress={() => navigation.navigate('ExploreTab')}
            variant="primary"
            size="md"
          />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cart Header Count */}
          <View style={styles.cartCountBar}>
            <Text style={styles.cartCountText}>{cartCount} Atelier {cartCount === 1 ? 'Piece' : 'Pieces'}</Text>
          </View>

          {/* Cart Items List */}
          <View style={styles.itemsList}>
            {cartItems.map((item) => (
              <View key={item.cartItemId} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <TouchableOpacity onPress={() => confirmRemove(item)} style={styles.trashBtn}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemSize}>Size: <Text style={styles.itemSizeBold}>{item.size}</Text></Text>
                  <Text style={styles.itemPrice}>₹{(item.price || 0).toLocaleString('en-IN')}</Text>

                  {/* Quantity adjustment */}
                  <View style={styles.itemBottomRow}>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity
                        style={styles.qtyActionBtn}
                        onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={14} color={colors.textPrimary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyActionBtn}
                        onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={14} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemSubtotal}>
                      Subtotal: ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Promo Code Box */}
          <View style={styles.promoSection}>
            <Text style={styles.promoTitle}>ATELIER PRIVILEGE CODE</Text>
            {coupon ? (
              <View style={styles.appliedCouponRow}>
                <View style={styles.couponPill}>
                  <Ionicons name="pricetag" size={14} color={colors.gold} />
                  <Text style={styles.couponCodeText}>{coupon.code} ({coupon.discountPercent}% OFF)</Text>
                </View>
                <TouchableOpacity onPress={removeCoupon}>
                  <Text style={styles.removeCouponText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.promoInputRow}>
                <TextInput
                  style={styles.promoInput}
                  placeholder='Try "HUMMING10"'
                  placeholderTextColor={colors.textMuted}
                  value={promoInput}
                  onChangeText={setPromoInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                  <Text style={styles.applyBtnText}>APPLY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Order Summary Box */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeading}>ORDER SUMMARY</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>Promo Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>-₹{discountAmount.toLocaleString('en-IN')}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated GST</Text>
              <Text style={styles.summaryValue}>₹{gstAmount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>₹{finalTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Sticky Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.bottomBarRow}>
            <View>
              <Text style={styles.bottomTotalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.bottomTotalValue}>₹{finalTotal.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  clearText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.error,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  cartCountBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cartCountText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemsList: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  itemImage: {
    width: 90,
    height: 110,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontFamily: typography.fontSerif,
    fontSize: 14,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    lineHeight: 18,
    marginRight: 6,
  },
  trashBtn: {
    padding: 2,
  },
  itemSize: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSizeBold: {
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    fontWeight: typography.weightBold,
    color: colors.primary,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
  },
  qtyActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  qtyNumber: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    paddingHorizontal: 8,
    color: colors.textPrimary,
  },
  itemSubtotal: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  promoSection: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  promoTitle: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 12,
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  applyBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textInverse,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponCodeText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  removeCouponText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: colors.error,
    fontWeight: typography.weightSemiBold,
  },
  summaryBox: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
  },
  summaryHeading: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textPrimary,
    fontWeight: typography.weightMedium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  totalLabel: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontFamily: typography.fontSans,
    fontSize: 16,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    paddingHorizontal: spacing.screenPadding,
  },
  bottomBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomTotalLabel: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  bottomTotalValue: {
    fontFamily: typography.fontSans,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 2,
  },
  checkoutBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textInverse,
  },
});
