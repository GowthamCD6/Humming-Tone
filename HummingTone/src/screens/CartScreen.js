import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useCart } from '../context/CartContext';

export const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const deliveryFee = cartSubtotal > 0 ? (cartSubtotal > 1500 ? 0 : 99) : 0;
  const discountAmount = discountApplied ? Math.round(cartSubtotal * 0.15) : 0;
  const totalCost = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Alert.alert('Promo Code', 'Please enter a valid coupon code.');
      return;
    }
    if (promoCode.trim().toUpperCase() === 'FIRST50' || promoCode.trim().toUpperCase() === 'HUMMING15') {
      setDiscountApplied(true);
      Alert.alert('Coupon Applied', 'You received a 15% discount on your order!');
    } else {
      Alert.alert('Invalid Code', 'The code you entered is invalid or expired.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. HEADER (Template Exact) ── */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 42 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Discover our curated bespoke silhouettes and elevate your wardrobe.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>Discover Collections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 40, 50) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 2. CART ITEMS LIST ── */}
          <View style={styles.itemsList}>
            {cartItems.map((item) => (
              <View key={`${item.id}-${item.selectedSize}`} style={styles.cartCard}>
                <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSize}>Size : {item.selectedSize || 'Standard'}</Text>
                  <Text style={styles.itemPrice}>₹{(item.price || 0).toLocaleString('en-IN')}</Text>
                </View>

                {/* Right Actions: Stepper + Trash */}
                <View style={styles.rightActions}>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => removeFromCart(item.id, item.selectedSize)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>

                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                    >
                      <Text style={styles.stepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* ── 3. PROMO CODE INPUT (Template Exact) ── */}
          <View style={styles.promoBox}>
            <TextInput
              style={styles.promoInput}
              placeholder="Promo Code"
              placeholderTextColor={colors.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyPromo}
              activeOpacity={0.88}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* ── 4. ORDER SUMMARY (Template Exact) ── */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sub-Total</Text>
              <Text style={styles.summaryValue}>₹{cartSubtotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
              </Text>
            </View>
            {discountApplied && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount (15%)</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  -₹{discountAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>₹{totalCost.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* ── 5. PROCEED TO CHECKOUT BUTTON (Template Exact) ── */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.88}
          >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backCircleBtn: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: typography.fontSans,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.weightBold,
    fontFamily: typography.fontSans,
    fontSize: 13,
  },

  // Cart Items
  itemsList: {
    gap: 14,
    marginBottom: 18,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
  },
  itemImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemSize: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  trashBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  stepperValue: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginHorizontal: 4,
  },

  // Promo Box
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 5,
    marginBottom: 18,
  },
  promoInput: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  applyBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },

  // Summary Box
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 6,
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
    color: colors.textPrimary,
  },

  // Checkout Button
  checkoutBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: '#FFFFFF',
  },
});
