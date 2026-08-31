import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Button } from '../components/Button';

export const PaymentFailureScreen = ({ route, navigation }) => {
  const {
    orderId = '',
    reason = 'Payment was cancelled or could not be completed.',
    totalAmount = 0,
  } = route.params || {};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Failure Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="close" size={44} color="#FFFFFF" />
        </View>

        <Text style={styles.tag}>PAYMENT INCOMPLETE</Text>
        <Text style={styles.title}>Payment Not Processed</Text>
        <Text style={styles.subtitle}>
          Your transaction was cancelled or could not be authorized. If any amount was deducted, it will be automatically refunded by your bank within 2-4 business days.
        </Text>

        {/* Failure Details Card */}
        <View style={styles.card}>
          {orderId ? (
            <>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Order Reference</Text>
                <Text style={styles.orderIdText}>{orderId}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {totalAmount > 0 ? (
            <>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Order Amount</Text>
                <Text style={styles.amountText}>₹{(totalAmount || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          <View style={styles.cardRowVertical}>
            <Text style={styles.cardLabel}>Status Reason</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="RETRY PAYMENT"
            onPress={() => navigation.navigate('Checkout')}
            variant="primary"
            size="lg"
            style={styles.retryBtn}
          />
          <Button
            title="VIEW SHOPPING BAG"
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
            variant="outline"
            size="md"
            style={{ width: '100%', marginBottom: 12 }}
          />
          <Button
            title="CONTINUE BROWSING"
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            variant="secondary"
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
    backgroundColor: '#C53030',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#C53030',
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
    color: '#C53030',
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
    color: colors.textPrimary,
  },
  amountText: {
    fontFamily: typography.fontSans,
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  reasonText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
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
  retryBtn: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#000000',
  },
});

export default PaymentFailureScreen;
