import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';

const FAQ_DATA = [
  {
    q: 'How does bespoke custom print apparel work?',
    a: 'In our Custom Studio, you can select premium 100% heavyweight cotton hoodies or tees, place custom artwork or logos on the front/back, and our master print artisans will craft and ship your bespoke piece within 3-5 business days.',
  },
  {
    q: 'What is your 7-day return & exchange policy?',
    a: 'We offer complimentary doorstep reverse pickup within 7 days of delivery for all catalog pieces in unworn condition with original tags intact. Replacement pieces or 100% refunds are processed within 48 hours of quality inspection.',
  },
  {
    q: 'What are the delivery timelines across India?',
    a: 'Metro cities receive express delivery within 2 to 4 business days. All other Indian pin codes are delivered within 4 to 6 business days with full real-time tracking links provided via SMS & WhatsApp.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Razorpay secure checkout (UPI via Google Pay/PhonePe/Paytm, Credit/Debit Cards, Net Banking, EMI) as well as Cash on Delivery for eligible catalog items.',
  },
  {
    q: 'How should I care for my heavyweight cotton garments?',
    a: 'Machine wash cold inside-out with mild detergent. Avoid bleach and tumble dry low or line dry in shade. Do not iron directly over screen-printed graphics to preserve color longevity.',
  },
];

export const SupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210?text=Hello%20Humming%20Tone%20VIP%20Concierge,%20I%20need%20assistance%20with%20an%20order.');
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:concierge@hummingtone.com?subject=Humming%20Tone%20Customer%20Inquiry');
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
          <Text style={styles.headerTitle}>VIP Concierge & Help</Text>
          <Text style={styles.headerSubtitle}>Personal styling & order care</Text>
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
        {/* ── 2. HERO CONCIERGE CARD ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#D4AF37" />
            <Text style={styles.heroBadgeText}>ATELIER VIP SUPPORT</Text>
          </View>

          <Text style={styles.heroTitle}>We Are Here To Assist You</Text>
          <Text style={styles.heroSubtitle}>
            Our dedicated atelier concierge is available 7 days a week to assist with order tracking, size consultations, and bespoke custom printing.
          </Text>

          {/* Contact Touchpoints */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="logo-whatsapp" size={22} color="#2E7D32" />
              </View>
              <Text style={styles.contactCardTitle}>WhatsApp</Text>
              <Text style={styles.contactCardSub}>Instant Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleCall}
              activeOpacity={0.85}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: '#FAF5EE' }]}>
                <Ionicons name="call-outline" size={22} color="#6B4E37" />
              </View>
              <Text style={styles.contactCardTitle}>Direct Call</Text>
              <Text style={styles.contactCardSub}>10 AM - 8 PM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleEmail}
              activeOpacity={0.85}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: '#FAF5EE' }]}>
                <Ionicons name="mail-outline" size={22} color="#6B4E37" />
              </View>
              <Text style={styles.contactCardTitle}>Email Us</Text>
              <Text style={styles.contactCardSub}>24h Response</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. QUICK SELF-SERVICE PORTALS ── */}
        <Text style={styles.sectionHeading}>SELF-SERVICE PORTALS</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('OrderTracking')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="location-outline" size={19} color="#6B4E37" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Live Shipment Tracking</Text>
              <Text style={styles.menuSub}>Look up courier milestones & delivery date</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#A3998F" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('ReturnRequest')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="repeat-outline" size={19} color="#6B4E37" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Return & Exchange Portal</Text>
              <Text style={styles.menuSub}>Complimentary 7-day reverse doorstep pickup</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#A3998F" />
          </TouchableOpacity>
        </View>

        {/* ── 4. FREQUENTLY ASKED QUESTIONS ── */}
        <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          {FAQ_DATA.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                onPress={() => setExpandedIndex(isExpanded ? null : idx)}
                activeOpacity={0.88}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionActive]}>
                    {item.q}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={17}
                    color={isExpanded ? '#6B4E37' : '#8A7F75'}
                  />
                </View>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 5. BRAND ASSURANCE BANNER ── */}
        <View style={styles.assuranceCard}>
          <Ionicons name="sparkles-outline" size={22} color="#D4AF37" />
          <View style={styles.assuranceTextWrap}>
            <Text style={styles.assuranceTitle}>100% Authentic Luxury Guarantee</Text>
            <Text style={styles.assuranceDesc}>
              Every garment is handcrafted in our atelier with strict quality standards and guaranteed fabric authenticity.
            </Text>
          </View>
        </View>
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

  /* Hero Concierge Card */
  heroCard: {
    backgroundColor: '#1E1B18',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    ...shadows.elevated,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#D4AF37',
  },
  heroTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 19,
    color: '#FAF8F5',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#A3998F',
    lineHeight: 18,
    marginBottom: 18,
  },

  /* Contact Touchpoints Row */
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  contactIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactCardTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    color: '#1E1B18',
    marginBottom: 2,
  },
  contactCardSub: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: '#8A7F75',
  },

  /* Section Headings */
  sectionHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#8A7F75',
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  /* Menu Container */
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    overflow: 'hidden',
    marginBottom: 22,
    ...shadows.subtle,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#1E1B18',
  },
  menuSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1.5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3EDE6',
    marginLeft: 66,
  },

  /* FAQ Accordion */
  faqList: {
    gap: 10,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.subtle,
  },
  faqCardExpanded: {
    borderColor: '#6B4E37',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    lineHeight: 18,
  },
  faqQuestionActive: {
    color: '#6B4E37',
  },
  faqBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE6',
  },
  faqAnswer: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#7D726A',
    lineHeight: 18,
  },

  /* Assurance Card */
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAE2D8',
    gap: 12,
  },
  assuranceTextWrap: {
    flex: 1,
  },
  assuranceTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#1E1B18',
    marginBottom: 2,
  },
  assuranceDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#7D726A',
    lineHeight: 16,
  },
});

export default SupportScreen;
