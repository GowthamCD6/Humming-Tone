import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrderService } from '../api/services';

export const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, finalTotal, subtotal, discountAmount, gstAmount, shippingFee, clearCart } = useCart();
  const { user } = useAuth();

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Incomplete Address', 'Please provide your full delivery address and contact number.');
      return;
    }

    try {
      setSubmitting(true);
      const orderPayload = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: `${address}, ${city}, ${state} - ${pincode}`,
        order_notes: notes,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        shipping_fee: shippingFee,
        total_amount: finalTotal,
      };

      const res = await OrderService.createOrder(orderPayload);
      const generatedOrderId = res.orderId || res.id;

      clearCart();

      navigation.replace('OrderSuccess', {
        orderId: generatedOrderId,
        customerName: name,
        totalAmount: finalTotal,
        shippingAddress: `${address}, ${city}, ${pincode}`,
      });
    } catch (e) {
      console.error('Failed to create order:', e);
      Alert.alert('Order Placement Failed', e.response?.data?.message || 'Unable to complete order. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack={true} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. DELIVERY DETAILS</Text>

          <Text style={styles.inputLabel}>FULL NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>STREET ADDRESS / FLAT / BUILDING *</Text>
          <TextInput
            style={styles.input}
            placeholder="Suite 402, Highline Residency, Park Avenue"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>CITY *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mumbai"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>PINCODE *</Text>
              <TextInput
                style={styles.input}
                placeholder="400001"
                placeholderTextColor={colors.textMuted}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>SPECIAL ATELIER INSTRUCTIONS (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            placeholder="Gift packaging notes, delivery gate instructions..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>2. PAYMENT PREFERENCE</Text>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'online' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('online')}
            activeOpacity={0.8}
          >
            <View style={styles.radio}>
              {paymentMethod === 'online' && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.paymentCardContent}>
              <Text style={styles.paymentTitle}>Instant Online Payment (Cards / UPI / NetBanking)</Text>
              <Text style={styles.paymentSub}>Secure 256-bit encrypted checkout</Text>
            </View>
            <Ionicons name="card-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.8}
          >
            <View style={styles.radio}>
              {paymentMethod === 'cod' && <View style={styles.radioSelected} />}
            </View>
            <View style={styles.paymentCardContent}>
              <Text style={styles.paymentTitle}>Cash / Pay on Delivery</Text>
              <Text style={styles.paymentSub}>Pay at doorstep upon delivery</Text>
            </View>
            <Ionicons name="cash-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Items Summary Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>3. BAG PREVIEW ({cartItems.length} items)</Text>
          {cartItems.map((item) => (
            <View key={item.cartItemId} style={styles.previewItem}>
              <Text style={styles.previewName} numberOfLines={1}>
                {item.quantity}x {item.name} ({item.size})
              </Text>
              <Text style={styles.previewPrice}>
                ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotalRow}>
            <Text style={styles.finalTotalLabel}>Grand Total</Text>
            <Text style={styles.finalTotalValue}>₹{finalTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Confirmation Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title={paymentMethod === 'online' ? `PAY ₹${finalTotal.toLocaleString('en-IN')}` : `CONFIRM ORDER (₹${finalTotal.toLocaleString('en-IN')})`}
          onPress={handlePlaceOrder}
          loading={submitting}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 20,
  },
  sectionHeading: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginBottom: 10,
    gap: 12,
  },
  paymentCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(17, 24, 39, 0.03)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paymentCardContent: {
    flex: 1,
  },
  paymentTitle: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
  },
  paymentSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewName: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginRight: 10,
  },
  previewPrice: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 10,
  },
  finalTotalLabel: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  finalTotalValue: {
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
});
