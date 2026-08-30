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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { shadows } from '../theme/colors';
import { typography } from '../theme/typography';
import { useCart } from '../context/CartContext';

export const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    cartCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Total is discounted subtotal with GST and delivery fully included
  const calculatedTotal = Math.max(0, discountedSubtotal);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || promoCodeInput;
    if (!code || !code.trim()) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }
    setCouponError('');
    setApplyingCoupon(true);
    try {
      const res = await applyCoupon(code);
      if (res.success) {
        setPromoCodeInput('');
        Alert.alert('Coupon Applied', res.message);
      } else {
        setCouponError(res.message);
      }
    } catch (e) {
      setCouponError('Unable to apply promo code. Please try again.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleClearBag = () => {
    if (cartItems.length === 0) return;
    Alert.alert(
      'Clear Shopping Bag',
      'Are you sure you want to remove all pieces from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearCart() },
      ]
    );
  };

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. TOP HEADER ── */}
      <View style={[styles.headerBar, { paddingTop: topPadding }]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() ? (
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#1E1B18" />
            </TouchableOpacity>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>Shopping Bag</Text>
            <Text style={styles.headerSubtitle}>
              {cartCount === 0 ? 'No items selected' : `${cartCount} ${cartCount === 1 ? 'Piece' : 'Pieces'} Selected`}
            </Text>
          </View>
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearBagBtn}
            onPress={handleClearBag}
            activeOpacity={0.75}
          >
            <Ionicons name="trash-outline" size={16} color="#6B4E37" />
            <Text style={styles.clearBagText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        /* ── EMPTY STATE ── */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={44} color="#8A7F75" />
          </View>
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our handcrafted luxury apparel, oversized street silhouettes, and bespoke atelier pieces.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' })}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>Discover Collections</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* ── CART ITEMS SCROLL ── */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max((insets.bottom || 0) + 75, 90) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 2. CART ITEMS LIST ── */}
          <View style={styles.itemsList}>
            {cartItems.map((item) => {
              const itemKey = item.cartItemId || `${item.id}-${item.size || 'std'}`;
              return (
                <View key={itemKey} style={styles.cartCard}>
                  {/* Thumbnail Image */}
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImg}
                    resizeMode="cover"
                  />

                  {/* Details */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemBrand} numberOfLines={1}>
                      {item.brand || item.category || 'ATELIER COLLECTION'}
                    </Text>

                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>

                    {/* Variant specs */}
                    <View style={styles.variantBadgesRow}>
                      <View style={styles.variantChip}>
                        <Text style={styles.variantChipText}>
                          Size: <Text style={{ fontFamily: typography.fontSansBold }}>{item.size || 'Standard'}</Text>
                        </Text>
                      </View>
                      {Boolean(item.color) && (
                        <View style={styles.variantChip}>
                          <Text style={styles.variantChipText}>{item.color}</Text>
                        </View>
                      )}
                    </View>

                    {/* Price & Quantity Controls */}
                    <View style={styles.priceStepperRow}>
                      <Text style={styles.itemPrice}>
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                      </Text>

                      <View style={styles.stepperWrap}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateQuantity(itemKey, (item.quantity || 1) - 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={(item.quantity || 1) === 1 ? 'trash-outline' : 'remove'}
                            size={14}
                            color={(item.quantity || 1) === 1 ? '#D32F2F' : '#1E1B18'}
                          />
                        </TouchableOpacity>

                        <Text style={styles.stepperCount}>{item.quantity || 1}</Text>

                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateQuantity(itemKey, (item.quantity || 1) + 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={14} color="#1E1B18" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── 3. PROMO CODE INPUT BOX (Real Backend Sync) ── */}
          <View style={styles.promoSection}>
            <Text style={styles.sectionHeaderTitle}>PROMOTIONAL PRIVILEGE</Text>

            {coupon ? (
              <View style={styles.activeCouponCard}>
                <View style={styles.activeCouponLeft}>
                  <View style={styles.activeCouponIcon}>
                    <Ionicons name="pricetag" size={16} color="#6B4E37" />
                  </View>
                  <View>
                    <Text style={styles.activeCouponCode}>{coupon.code}</Text>
                    <Text style={styles.activeCouponLabel}>
                      {coupon.label || `${coupon.discount_value}% Discount Applied`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={removeCoupon}
                  style={styles.removeCouponBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color="#8A7F75" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.promoInputRow}>
                  <View style={styles.promoInputWrap}>
                    <Ionicons name="ticket-outline" size={18} color="#8A7F75" />
                    <TextInput
                      style={styles.promoInput}
                      placeholder="Enter promo code"
                      placeholderTextColor="#A3998F"
                      value={promoCodeInput}
                      onChangeText={(t) => {
                        setPromoCodeInput(t);
                        setCouponError('');
                      }}
                      autoCapitalize="characters"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.applyPromoBtn}
                    onPress={() => handleApplyCoupon()}
                    activeOpacity={0.85}
                    disabled={applyingCoupon}
                  >
                    {applyingCoupon ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.applyPromoBtnText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {Boolean(couponError) && (
                  <Text style={styles.couponErrorText}>{couponError}</Text>
                )}
              </>
            )}
          </View>

          {/* ── 4. ORDER BILL BREAKDOWN ── */}
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionHeaderTitle}>PRICE BREAKDOWN</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Bag Subtotal</Text>
              <Text style={styles.breakdownValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: '#2E7D32' }]}>
                  Coupon Savings ({coupon?.code})
                </Text>
                <Text style={[styles.breakdownValue, { color: '#2E7D32' }]}>
                  −₹{discountAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Taxes & GST</Text>
              <Text style={[styles.breakdownValue, { color: '#2E7D32', fontFamily: typography.fontSansBold }]}>
                Included in Price
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery Charges</Text>
              <Text style={[styles.breakdownValue, { color: '#2E7D32', fontFamily: typography.fontSansBold }]}>
                FREE
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalTitle}>Total Amount</Text>
                <Text style={styles.totalSub}>All prices are inclusive of GST</Text>
              </View>
              <Text style={styles.totalAmount}>₹{calculatedTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* ── 5. PROCEED TO CHECKOUT ACTION (Solid Black) ── */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.88}
          >
            <View style={styles.checkoutBtnLeft}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Text style={styles.checkoutBtnSub}>
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'} • ₹{calculatedTotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.checkoutBtnArrowCircle}>
              <Ionicons name="arrow-forward" size={17} color="#1E1B18" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#8A7F75',
    marginTop: 1,
  },
  clearBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E5DCCE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  clearBagText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#6B4E37',
  },

  /* ── EMPTY STATE ── */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#E5DCCE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 19,
    color: '#1E1B18',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#8A7F75',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6B4E37',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    ...shadows.card,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    letterSpacing: 0.3,
  },

  /* ── SCROLL ── */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  /* ── CART ITEMS ── */
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE4DC',
    gap: 12,
    ...shadows.card,
  },
  itemImg: {
    width: 80,
    height: 94,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemBrand: {
    fontFamily: typography.fontSansBold,
    fontSize: 10,
    color: '#8A7F75',
    letterSpacing: 0.6,
  },
  itemName: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: '#1E1B18',
    marginTop: 2,
    marginBottom: 4,
  },
  variantBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  variantChip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  variantChipText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#5C544E',
  },
  priceStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontFamily: typography.fontSansBold,
    fontSize: 15,
    color: '#1E1B18',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    paddingHorizontal: 8,
  },

  /* ── PROMO SECTION ── */
  promoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE4DC',
    marginBottom: 14,
    ...shadows.card,
  },
  sectionHeaderTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#8A7F75',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE4DC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  promoInput: {
    flex: 1,
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    padding: 0,
  },
  applyPromoBtn: {
    backgroundColor: '#6B4E37',
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  applyPromoBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
  },
  couponErrorText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#D32F2F',
    marginTop: 6,
    marginLeft: 4,
  },
  suggestedCouponsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  suggestPill: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E5DCCE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  suggestPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#6B4E37',
  },
  activeCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: '#E5DCCE',
    borderRadius: 14,
    padding: 12,
  },
  activeCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeCouponIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCouponCode: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#1E1B18',
  },
  activeCouponLabel: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#6B4E37',
    marginTop: 1,
  },
  removeCouponBtn: {
    padding: 4,
  },

  /* ── BREAKDOWN CARD ── */
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE4DC',
    marginBottom: 16,
    ...shadows.card,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#5C544E',
  },
  breakdownValue: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE4DC',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 15,
    color: '#1E1B18',
  },
  totalSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1,
  },
  totalAmount: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
  },

  /* ── CHECKOUT BUTTON (Solid Black in Content Flow) ── */
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B18',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    ...shadows.card,
  },
  checkoutBtnLeft: {
    flex: 1,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  checkoutBtnSub: {
    color: '#C4BCB3',
    fontFamily: typography.fontSans,
    fontSize: 12,
    marginTop: 2,
  },
  checkoutBtnArrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
