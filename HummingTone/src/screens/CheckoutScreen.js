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
import RazorpayCheckout from 'react-native-razorpay';
import { Ionicons } from '../components/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OrderService } from '../api/services';

export const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, finalTotal, subtotal, discountAmount, gstAmount, shippingFee, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

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

  React.useEffect(() => {
    if (user && user.email !== 'guest@hummingtone.com') {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user || user.email === 'guest@hummingtone.com') {
      Alert.alert(
        'Google Sign-In Required',
        'Please sign in with your Google account to proceed with checkout.'
      );
      setShowGoogleModal(true);
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Incomplete Address', 'Please provide your full delivery address and contact number.');
      return;
    }

    try {
      setSubmitting(true);
      const orderPayload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        city: city.trim(),
        state: state.trim() || 'Tamil Nadu',
        pincode: pincode.trim(),
        order_instructions: notes.trim(),
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          size: item.size || 'M',
          color: item.color || null,
        })),
        discount_amount: discountAmount,
        shipping: shippingFee,
        user_id: user?.id,
      };

      const res = await OrderService.createOrder(orderPayload);
      const orderData = res?.data || res;

      if (!orderData || !orderData.razorpay_order_id) {
        throw new Error(res?.message || 'Failed to initialize payment gateway.');
      }

      // Configure Razorpay Native Modal Options
      const razorpayOptions = {
        description: 'Humming Tone Order Payment',
        image: 'https://res.cloudinary.com/agoiw3rz/image/upload/v1/hummingtone/logo',
        currency: orderData.currency || 'INR',
        key: orderData.key_id || 'rzp_test_RxiHjMose0no0s',
        amount: orderData.amount,
        name: 'Humming Tone',
        order_id: orderData.razorpay_order_id,
        prefill: {
          email: email.trim(),
          contact: phone.trim(),
          name: name.trim(),
        },
        theme: { color: '#6B4E37' },
      };

      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        Alert.alert(
          'Rebuild Required',
          'The native Razorpay module was recently installed. Please re-run "npx react-native run-android" in your terminal to compile the native module into your APK.'
        );
        return;
      }

      RazorpayCheckout.open(razorpayOptions)
        .then(async (paymentData) => {
          // Verify payment signature on backend
          try {
            await OrderService.verifyPayment({
              order_number: orderData.order_number,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_signature: paymentData.razorpay_signature,
            });
          } catch (verErr) {
            console.warn('Backend payment verification notice:', verErr);
          }

          clearCart();

          navigation.replace('OrderSuccess', {
            orderId: orderData.order_number,
            customerName: name,
            totalAmount: finalTotal,
            shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
            paymentId: paymentData.razorpay_payment_id,
          });
        })
        .catch((payErr) => {
          console.warn('Razorpay Checkout error / cancelled:', payErr);
          let parsedReason = 'Payment was cancelled by user.';
          if (typeof payErr?.description === 'string') {
            try {
              const parsed = JSON.parse(payErr.description);
              if (parsed?.error?.description && parsed.error.description !== 'undefined') {
                parsedReason = parsed.error.description;
              } else if (parsed?.error?.reason) {
                parsedReason = parsed.error.reason.replace(/_/g, ' ');
              } else if (parsed?.error?.step) {
                parsedReason = `Payment failed during ${parsed.error.step.replace(/_/g, ' ')}.`;
              }
            } catch {
              if (payErr.description !== 'undefined') {
                parsedReason = payErr.description;
              }
            }
          } else if (payErr?.message) {
            parsedReason = payErr.message;
          }

          navigation.navigate('PaymentFailure', {
            orderId: orderData?.order_number || '',
            reason: parsedReason,
            totalAmount: finalTotal,
          });
        });

    } catch (e) {
      console.error('Failed to create order:', e);
      Alert.alert('Order Placement Failed', e.response?.data?.message || e.message || 'Unable to complete order. Please check your connection and try again.');
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

        {/* Items Summary Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>2. ORDER SUMMARY ({cartItems.length} items)</Text>
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
        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#2E7D32" />
          <Text style={styles.secureBadgeText}>100% Encrypted & Secure Razorpay Payment</Text>
        </View>
        <Button
          title={`PAY ₹${finalTotal.toLocaleString('en-IN')}`}
          onPress={handlePlaceOrder}
          loading={submitting}
          style={styles.payBtnBlack}
          size="lg"
        />
      </View>

      {/* Google Auth Modal Gate */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(loggedUser) => {
          setShowGoogleModal(false);
          if (loggedUser) {
            if (loggedUser.name) setName(loggedUser.name);
            if (loggedUser.email) setEmail(loggedUser.email);
            if (loggedUser.phone) setPhone(loggedUser.phone);
          }
        }}
        title="Sign In with Google to Complete Order"
        subtitle="Sign in with your Google account to auto-fill delivery details, securely place your order, and enable live tracking."
      />
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
    paddingTop: 8,
    paddingHorizontal: spacing.screenPadding,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  secureBadgeText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  payBtnBlack: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 50,
  },
});
