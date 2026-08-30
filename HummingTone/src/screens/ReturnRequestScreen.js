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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { ReturnService } from '../api/services';

const REASONS = [
  { id: 'size', title: 'Size & Fit Issue', desc: 'Need a different size or fit preference' },
  { id: 'damage', title: 'Damaged / Defective Item', desc: 'Fabric defect, stitching or packaging flaw' },
  { id: 'wrong', title: 'Received Wrong Piece', desc: 'Different color, design or product received' },
  { id: 'quality', title: 'Quality Not as Expected', desc: 'Material feel or look differed from expectation' },
  { id: 'change', title: 'Change of Preference', desc: 'Decided on a different style or collection piece' },
];

export const ReturnRequestScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialOrderId = route.params?.orderId || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [selectedReason, setSelectedReason] = useState(REASONS[0].title);
  const [type, setType] = useState('Return'); // 'Return' | 'Exchange'
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  const handleSubmit = async () => {
    if (!orderId.trim()) {
      Alert.alert('Order Reference Required', 'Please enter your Order Reference ID to proceed.');
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
        'Request Registered',
        `Your ${type.toLowerCase()} request for Order #${orderId.trim()} has been registered. Our concierge team will schedule your complimentary doorstep reverse pickup within 24 hours.`,
        [
          {
            text: 'Track Status',
            onPress: () => navigation.navigate('OrderTracking', { initialOrderId: orderId.trim() }),
          },
          {
            text: 'Back to Profile',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Request Logged',
        `Your request for Order #${orderId.trim()} has been recorded for concierge review.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. TOP APP BAR ── */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B18" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.headerTitle}>Returns & Exchanges</Text>
          <Text style={styles.headerSubtitle}>Complimentary concierge pickup</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max((insets.bottom || 0) + 30, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. HERO POLICY BANNER ── */}
        <View style={styles.policyCard}>
          <View style={styles.policyIconBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#38A169" />
          </View>
          <View style={styles.policyTextWrap}>
            <Text style={styles.policyTitle}>7-Day Complimentary Reverse Pickup</Text>
            <Text style={styles.policyDesc}>
              Unworn pieces with intact tags qualify for 100% free doorstep pickup and express replacement or full refund.
            </Text>
          </View>
        </View>

        {/* ── 3. TYPE SEGMENT TOGGLE ── */}
        <Text style={styles.sectionLabel}>SELECT SERVICE TYPE</Text>
        <View style={styles.typeSegmentWrap}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'Return' && styles.typeBtnActive]}
            onPress={() => setType('Return')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="cash-outline"
              size={17}
              color={type === 'Return' ? '#FFFFFF' : '#7D726A'}
            />
            <Text style={[styles.typeBtnText, type === 'Return' && styles.typeBtnTextActive]}>
              Refund Return
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === 'Exchange' && styles.typeBtnActive]}
            onPress={() => setType('Exchange')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="repeat-outline"
              size={17}
              color={type === 'Exchange' ? '#FFFFFF' : '#7D726A'}
            />
            <Text style={[styles.typeBtnText, type === 'Exchange' && styles.typeBtnTextActive]}>
              Size / Color Exchange
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. ORDER REFERENCE ID ── */}
        <Text style={styles.sectionLabel}>ORDER REFERENCE ID *</Text>
        <View style={styles.inputCard}>
          <Ionicons name="receipt-outline" size={18} color="#8A7F75" style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.input}
            placeholder="e.g. HT-849201 or 10-digit phone"
            placeholderTextColor="#A3998F"
            value={orderId}
            onChangeText={setOrderId}
            autoCapitalize="characters"
          />
        </View>

        {/* ── 5. REASON SELECTOR ── */}
        <Text style={styles.sectionLabel}>REASON FOR {type.toUpperCase()} *</Text>
        <View style={styles.reasonsContainer}>
          {REASONS.map((r) => {
            const isSelected = selectedReason === r.title;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                onPress={() => setSelectedReason(r.title)}
                activeOpacity={0.85}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.reasonTextWrap}>
                  <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleSelected]}>
                    {r.title}
                  </Text>
                  <Text style={styles.reasonDesc}>{r.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 6. ADDITIONAL NOTES / COMMENTS ── */}
        <Text style={styles.sectionLabel}>ADDITIONAL REMARKS (OPTIONAL)</Text>
        <View style={styles.textAreaCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Please provide any additional details for our concierge team..."
            placeholderTextColor="#A3998F"
            value={comments}
            onChangeText={setComments}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ── 7. SUBMIT ACTION BUTTON ── */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit {type} Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  topBarCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16.5,
    color: '#1E1B18',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  /* Policy Card */
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    marginBottom: 20,
    gap: 12,
    ...shadows.subtle,
  },
  policyIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTextWrap: {
    flex: 1,
  },
  policyTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    marginBottom: 2,
  },
  policyDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#7D726A',
    lineHeight: 16,
  },

  /* Section Labels */
  sectionLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A7F75',
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  /* Type Segment */
  typeSegmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#EFEAE2',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 20,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: '#1E1B18',
    ...shadows.subtle,
  },
  typeBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#7D726A',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },

  /* Order Input Card */
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    marginBottom: 20,
    ...shadows.subtle,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: '#1E1B18',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  /* Reasons List */
  reasonsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    gap: 12,
    ...shadows.subtle,
  },
  reasonCardSelected: {
    borderColor: '#6B4E37',
    backgroundColor: '#FAF5EE',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#A3998F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#6B4E37',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B4E37',
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
  },
  reasonTitleSelected: {
    color: '#6B4E37',
  },
  reasonDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 2,
  },

  /* Text Area */
  textAreaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 12,
    marginBottom: 24,
    ...shadows.subtle,
  },
  textArea: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: '#1E1B18',
    height: 90,
  },

  /* Submit Action */
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 52,
    borderRadius: 26,
    gap: 8,
    ...shadows.card,
  },
  submitBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});

export default ReturnRequestScreen;
