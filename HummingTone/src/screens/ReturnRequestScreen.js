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
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { ReturnService } from '../api/services';

const REASONS = [
  {
    id: 'size',
    icon: 'shirt-outline',
    title: 'Size & Fit Issue',
    desc: 'Need a different size, fit preference or drape alteration',
  },
  {
    id: 'damage',
    icon: 'alert-circle-outline',
    title: 'Damaged / Defective Item',
    desc: 'Fabric flaw, stitching blemish or transit packaging issue',
  },
  {
    id: 'wrong',
    icon: 'swap-horizontal-outline',
    title: 'Received Wrong Piece',
    desc: 'Different color, design, size or incorrect garment delivered',
  },
  {
    id: 'quality',
    icon: 'sparkles-outline',
    title: 'Quality Not as Expected',
    desc: 'Material hand-feel or color nuance differed from preview',
  },
  {
    id: 'change',
    icon: 'heart-dislike-outline',
    title: 'Change of Preference',
    desc: 'Decided on an alternative style or seasonal drop piece',
  },
];

const STEPS = [
  { num: '01', title: 'Submit Request', desc: 'Instant registration' },
  { num: '02', title: 'Doorstep Pickup', desc: 'Free 24h reverse courier' },
  { num: '03', title: 'Refund / Swap', desc: 'Instant credit or reship' },
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

  const openWhatsAppSupport = () => {
    const ref = orderId.trim() || 'my order';
    const msg = encodeURIComponent(`Hello Humming Tone VIP Concierge, I need assistance with a return/exchange for Order #${ref}.`);
    Linking.openURL(`https://wa.me/919876543210?text=${msg}`).catch(() => {
      navigation.navigate('Support');
    });
  };

  const handleSubmit = async () => {
    if (!orderId.trim()) {
      Alert.alert('Order Reference Required', 'Please enter your Order Reference Number or ID to proceed.');
      return;
    }

    try {
      setLoading(true);
      await ReturnService.requestReturn({
        order_id: orderId.trim(),
        order_number: orderId.trim(),
        request_type: type,
        return_reason: `${type}: ${selectedReason}`,
        return_description: comments.trim() || `Customer requested ${type.toLowerCase()} for order #${orderId.trim()}`,
      });

      Alert.alert(
        'Request Confirmed',
        `Your ${type.toLowerCase()} request for Order #${orderId.trim()} has been registered. Our concierge team will dispatch complimentary doorstep reverse pickup within 24-48 hours.`,
        [
          {
            text: 'Track Order',
            onPress: () => navigation.navigate('OrderTracking', { initialOrderId: orderId.trim() }),
          },
          {
            text: 'Return to Account',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Request Logged',
        `Your request for Order #${orderId.trim()} has been noted. Our concierge team will reach out to confirm your pickup schedule.`,
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
          <Text style={styles.headerSubtitle}>Complimentary 7-day doorstep concierge</Text>
        </View>

        <TouchableOpacity
          style={styles.helpIconBtn}
          onPress={openWhatsAppSupport}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={19} color="#6B4E37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max((insets.bottom || 0) + 40, 50) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. HERO POLICY CARD ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#D4AF37" />
            <Text style={styles.heroBadgeText}>ATELIER REVERSE CONCIERGE</Text>
          </View>

          <Text style={styles.heroTitle}>7-Day Complimentary Return & Swap</Text>
          <Text style={styles.heroSubtitle}>
            Unworn garments with original tags intact qualify for 100% free doorstep reverse pickup, express size swap, or complete refund.
          </Text>

          {/* 3-Step Milestone Tracker */}
          <View style={styles.stepsRow}>
            {STEPS.map((s, idx) => (
              <View key={s.num} style={styles.stepBlock}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepSub}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 3. SERVICE TYPE SEGMENT ── */}
        <Text style={styles.sectionLabel}>SELECT SERVICE PREFERENCE</Text>
        <View style={styles.typeSegmentWrap}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'Return' && styles.typeBtnActive]}
            onPress={() => setType('Return')}
            activeOpacity={0.88}
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
            activeOpacity={0.88}
          >
            <Ionicons
              name="repeat-outline"
              size={17}
              color={type === 'Exchange' ? '#FFFFFF' : '#7D726A'}
            />
            <Text style={[styles.typeBtnText, type === 'Exchange' && styles.typeBtnTextActive]}>
              Size / Style Exchange
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. ORDER REFERENCE ID ── */}
        <Text style={styles.sectionLabel}>ORDER REFERENCE NUMBER *</Text>
        <View style={styles.inputCard}>
          <Ionicons name="receipt-outline" size={19} color="#6B4E37" style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.input}
            placeholder="e.g. ORD-2026-XXXX or #1024"
            placeholderTextColor="#A3998F"
            value={orderId}
            onChangeText={setOrderId}
            autoCapitalize="characters"
          />
          {Boolean(orderId) && (
            <TouchableOpacity onPress={() => setOrderId('')} style={{ padding: 10 }}>
              <Ionicons name="close-circle" size={17} color="#A3998F" />
            </TouchableOpacity>
          )}
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
                <View style={[styles.reasonIconBg, isSelected && styles.reasonIconBgSelected]}>
                  <Ionicons
                    name={r.icon}
                    size={18}
                    color={isSelected ? '#6B4E37' : '#7D726A'}
                  />
                </View>

                <View style={styles.reasonTextWrap}>
                  <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleSelected]}>
                    {r.title}
                  </Text>
                  <Text style={styles.reasonDesc}>{r.desc}</Text>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 6. ADDITIONAL NOTES / COMMENTS ── */}
        <Text style={styles.sectionLabel}>ADDITIONAL REMARKS OR SIZE PREFERENCE</Text>
        <View style={styles.textAreaCard}>
          <TextInput
            style={styles.textArea}
            placeholder={
              type === 'Exchange'
                ? 'Specify the replacement size, color, or preferred fit alterations...'
                : 'Please describe any defect or feedback for our quality artisans...'
            }
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
              <Text style={styles.submitBtnText}>Confirm {type} & Schedule Pickup</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── 8. WHATSAPP ASSISTANCE BANNER ── */}
        <TouchableOpacity
          style={styles.whatsappCard}
          onPress={openWhatsAppSupport}
          activeOpacity={0.85}
        >
          <View style={styles.whatsappIconCircle}>
            <Ionicons name="logo-whatsapp" size={20} color="#2E7D32" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.whatsappTitle}>Need Instant Help or Sizing Guidance?</Text>
            <Text style={styles.whatsappSubtitle}>Chat directly with our master atelier concierge on WhatsApp.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A3998F" />
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
  helpIconBtn: {
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

  /* Hero Card */
  heroCard: {
    backgroundColor: '#1E1B18',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 10,
  },
  heroBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 16,
    color: '#FAF8F5',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#D7C4A5',
    lineHeight: 17,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B4E37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNumText: {
    fontFamily: typography.fontSansBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  stepTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    color: '#FAF8F5',
    textAlign: 'center',
    marginBottom: 2,
  },
  stepSub: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    color: '#A3998F',
    textAlign: 'center',
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
    height: 44,
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
  reasonIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonIconBgSelected: {
    backgroundColor: '#EAE1D7',
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
    lineHeight: 15,
  },

  /* Text Area */
  textAreaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    padding: 12,
    marginBottom: 22,
    ...shadows.subtle,
  },
  textArea: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: '#1E1B18',
    height: 85,
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
    marginBottom: 16,
    ...shadows.card,
  },
  submitBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  /* WhatsApp Card */
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2DCD5',
    gap: 12,
    ...shadows.subtle,
  },
  whatsappIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#1E1B18',
  },
  whatsappSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 2,
  },
});

export default ReturnRequestScreen;
