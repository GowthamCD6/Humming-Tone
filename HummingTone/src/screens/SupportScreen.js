import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';

const FAQ_DATA = [
  {
    q: 'How does bespoke customization work?',
    a: 'Each customized piece (handcrafted instruments and bespoke fragrances) is built to your specifications by master artisans in our dedicated workshop. Production takes between 7 to 14 business days.',
  },
  {
    q: 'What is your luxury return & exchange policy?',
    a: 'We offer a complimentary 7-day return policy for standard catalog items in original unboxing condition with intact security tags. Custom engraved pieces are covered under full warranty for manufacturing craftsmanship.',
  },
  {
    q: 'How can I track my order?',
    a: 'You can track orders directly within the app using your Order ID or phone number on the Account tab or from the top navigation.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept all major Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery for eligible orders.',
  },
];

export const SupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210?text=Hello%20HummingTone%20Support,%20I%20would%20like%20assistance%20with%20my%20order.');
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@hummingtone.com?subject=Customer%20Inquiry');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header title="Customer Care & Support" showBack={true} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.conciergeCard}>
          <Text style={styles.conciergeLabel}>HUMMING TONE CUSTOMER CARE</Text>
          <Text style={styles.conciergeTitle}>We Are Here To Help</Text>
          <Text style={styles.conciergeDesc}>
            Our dedicated team is available around the clock to assist you with your orders, custom apparel requests, sizing queries, and delivery tracking.
          </Text>

          {/* Quick Contact Buttons */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp} activeOpacity={0.8}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <Text style={styles.contactBtnText}>Phone</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleEmail} activeOpacity={0.8}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('ReturnRequest')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="repeat-outline" size={22} color={colors.primary} />
              <Text style={styles.linkTitle}>Request Return / Exchange</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('OrderTracking')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
              <Text style={styles.linkTitle}>Track Order Shipment</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
          {FAQ_DATA.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <View key={idx} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{item.a}</Text>
                )}
              </View>
            );
          })}
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
  conciergeCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  conciergeLabel: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 4,
  },
  conciergeTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 20,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
    marginBottom: 8,
  },
  conciergeDesc: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: '#D1D5DB',
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 6,
  },
  contactBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  quickLinks: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: {
    fontFamily: typography.fontSans,
    fontSize: 14,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },
  faqSection: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  faqCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontFamily: typography.fontSerif,
    fontSize: 14,
    fontWeight: typography.weightSemiBold,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

export default SupportScreen;
