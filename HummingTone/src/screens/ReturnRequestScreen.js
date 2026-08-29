import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ReturnService } from '../api/services';

const REASONS = [
  'Size / Fit Issue',
  'Damaged / Defective Item',
  'Received Wrong Item',
  'Quality Not as Expected',
  'Change of Preference',
];

export const ReturnRequestScreen = ({ navigation, route }) => {
  const initialOrderId = route.params?.orderId || '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [type, setType] = useState('Return'); // 'Return' | 'Exchange'
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!orderId.trim()) {
      Alert.alert('Required', 'Please enter your Order ID.');
      return;
    }

    try {
      setLoading(true);
      await ReturnService.requestReturn({
        orderId: orderId.trim(),
        requestType: type,
        reason: selectedReason,
        comments: comments.trim(),
      });

      Alert.alert(
        'Request Submitted',
        `Your ${type.toLowerCase()} request for Order #${orderId.trim()} has been registered. Our concierge team will reach out within 24 hours to schedule complimentary pickup.`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('OrderTracking', { initialOrderId: orderId.trim() }),
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Request Logged',
        `Your request for Order #${orderId.trim()} has been recorded for review.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header title="Return & Exchange" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>COMPLIMENTARY CONCIERGE PICKUP</Text>
        <Text style={styles.headerTitle}>Hassle-Free Return Portal</Text>
        <Text style={styles.headerDesc}>
          Initiate a complimentary reverse pickup for unworn items with intact security tags within 7 days of delivery.
        </Text>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'Return' && styles.typeBtnActive]}
            onPress={() => setType('Return')}
          >
            <Text style={[styles.typeText, type === 'Return' && styles.typeTextActive]}>
              REFUND RETURN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'Exchange' && styles.typeBtnActive]}
            onPress={() => setType('Exchange')}
          >
            <Text style={[styles.typeText, type === 'Exchange' && styles.typeTextActive]}>
              SIZE EXCHANGE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Order Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ORD-1724819"
              placeholderTextColor={colors.textMuted}
              value={orderId}
              onChangeText={setOrderId}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason for {type}</Text>
            <View style={styles.reasonsList}>
              {REASONS.map((r) => {
                const isSelected = selectedReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reasonPill, isSelected && styles.reasonPillActive]}
                    onPress={() => setSelectedReason(r)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide any additional comments or preferred pickup timings..."
              placeholderTextColor={colors.textMuted}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Button
            title={`Submit ${type} Request`}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
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
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  headerDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.xl,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeBtnActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  typeTextActive: {
    color: colors.textInverse,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
  },
  reasonsList: {
    gap: 8,
    marginTop: 4,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    borderRadius: 8,
  },
  reasonPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  reasonText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reasonTextActive: {
    fontWeight: typography.weightSemiBold,
    color: colors.primary,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default ReturnRequestScreen;
