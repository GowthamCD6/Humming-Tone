import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Button } from '../components/Button';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const { orderId = 'HT-849201', customerName = 'Patron', totalAmount = 0, shippingAddress = '' } =
    route.params || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={44} color={colors.textInverse} />
        </View>

        <Text style={styles.tag}>ORDER CONFIRMED</Text>
        <Text style={styles.title}>Thank You, {customerName}</Text>
        <Text style={styles.subtitle}>
          Your bespoke order has been placed into our atelier production queue.
        </Text>

        {/* Order Reference Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order Reference</Text>
            <Text style={styles.orderIdText}>{orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Amount Paid</Text>
            <Text style={styles.amountText}>₹{(totalAmount || 0).toLocaleString('en-IN')}</Text>
          </View>
          {shippingAddress ? (
            <>
              <View style={styles.divider} />
              <View style={styles.cardRowVertical}>
                <Text style={styles.cardLabel}>Delivery Address</Text>
                <Text style={styles.addressText}>{shippingAddress}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="TRACK ORDER STATUS"
            onPress={() => navigation.navigate('OrderTracking', { initialOrderId: orderId })}
            variant="primary"
            size="lg"
            style={{ width: '100%', marginBottom: 12 }}
          />
          <Button
            title="CONTINUE SHOPPING"
            onPress={() => navigation.navigate('HomeTab')}
            variant="outline"
            size="md"
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  tag: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.goldMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: typography.fontSerif,
    fontSize: 26,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 32,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    marginBottom: 32,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRowVertical: {
    gap: 4,
  },
  cardLabel: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderIdText: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  amountText: {
    fontFamily: typography.fontSans,
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  addressText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  actions: {
    width: '100%',
  },
});
