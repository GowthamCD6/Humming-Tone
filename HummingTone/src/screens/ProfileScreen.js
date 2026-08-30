import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { performGoogleSignIn } from '../services/googleAuth';

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, login, logout, updateProfile } = useAuth();
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useNotifications();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await performGoogleSignIn();
      if (res.success && res.user) {
        await login(res.user, res.token);
      } else if (!res.cancelled && res.message) {
        Alert.alert('Sign In Failed', res.message);
      }
    } catch (e) {
      Alert.alert('Sign In Error', 'Unable to complete Google sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    if (updateProfile) {
      await updateProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || user?.email,
      });
    }
    setEditModalVisible(false);
    Alert.alert('Profile Saved', 'Your account details have been updated successfully.');
  };

  const openWhatsAppSupport = () => {
    const phone = '919876543210';
    const msg = encodeURIComponent('Hello Humming Tone VIP Concierge, I need assistance with my order.');
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`).catch(() => {
      navigation.navigate('Support');
    });
  };

  const userInitials = (user?.name || 'Humming Tone')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const topPadding = Math.max(
    (insets.top || 0) + 10,
    (StatusBar.currentHeight || 0) + 10,
    Platform.OS === 'android' ? 32 : 44
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent={true} />

      {/* ── 1. LUXURY TOP APP BAR ── */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <View style={styles.brandTitleWrap}>
          <Image
            source={require('../assets/title-logo.png')}
            style={styles.headerTitleLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandSub}>MY ATELIER & ACCOUNT</Text>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.notifCircleBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={19} color="#1E1B18" />
            {unreadCount > 0 && (
              <View style={styles.topNotifBadge}>
                {unreadCount > 1 ? (
                  <Text style={styles.topNotifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                ) : null}
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? '#38A169' : '#A3998F' }]} />
            <Text style={styles.statusPillText}>{isAuthenticated ? 'MEMBER' : 'GUEST'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max((insets.bottom || 0) + 95, 115) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. HERO IDENTITY CARD ── */}
        {isAuthenticated ? (
          <View style={styles.memberCard}>
            {/* Background Texture Accents */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.avatarWrap}>
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{userInitials || 'HT'}</Text>
                  </View>
                )}
                <View style={styles.verifiedCheckBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#38A169" />
                </View>
              </View>

              <View style={styles.memberInfo}>
                <View style={styles.tierPill}>
                  <Ionicons name="sparkles" size={11} color="#D4AF37" />
                  <Text style={styles.tierPillText}>PRIVILEGE PATRON</Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Member'}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'member@hummingtone.com'}</Text>
              </View>

              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => {
                  setEditForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    email: user?.email || '',
                  });
                  setEditModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={15} color="#FAF8F5" />
              </TouchableOpacity>
            </View>

            {/* Quick Stats Ribbon */}
            <View style={styles.statsRibbon}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('Wishlist')}
                activeOpacity={0.8}
              >
                <Text style={styles.statNumber}>{wishlistCount}</Text>
                <Text style={styles.statLabel}>SAVED PIECES</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('OrderTracking')}
                activeOpacity={0.8}
              >
                <Ionicons name="cube-outline" size={18} color="#D4AF37" style={{ marginBottom: 2 }} />
                <Text style={styles.statLabel}>ORDERS</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('MainTabs', { screen: 'CustomizeTab' })}
                activeOpacity={0.8}
              >
                <Ionicons name="color-palette-outline" size={18} color="#D4AF37" style={{ marginBottom: 2 }} />
                <Text style={styles.statLabel}>STUDIO</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Guest Welcome Hero */
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={28} color="#6B4E37" />
            </View>

            <Text style={styles.guestTitle}>Welcome to Humming Tone</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage your orders, track express shipments, save wishlist items, and unlock member privileges.
            </Text>

            {/* Google Sign-In Action */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              activeOpacity={0.88}
              disabled={googleLoading}
            >
              <View style={styles.googleIconBg}>
                <Ionicons name="logo-google" size={16} color="#EA4335" />
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailSignInBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.emailSignInBtnText}>Sign In with Email / Phone</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 3. SERVICES & MANAGEMENT SECTION ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>ORDERS & SHIPMENTS</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('OrderTracking')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name="location-outline" size={19} color="#6B4E37" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>Track Orders & Shipments</Text>
                <Text style={styles.menuRowSub}>Real-time delivery milestones and tracking IDs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>

            <View style={styles.menuLineDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('ReturnRequest')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name="repeat-outline" size={19} color="#6B4E37" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>Returns & Exchanges</Text>
                <Text style={styles.menuRowSub}>Complimentary 7-day doorstep pickup service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4. ATELIER & CURATIONS ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>ATELIER & WARDROBE</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('Wishlist')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name="heart-outline" size={19} color="#6B4E37" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>Saved Pieces & Wishlist</Text>
                <Text style={styles.menuRowSub}>{wishlistCount} curated luxury garments</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{wishlistCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>

            <View style={styles.menuLineDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name="notifications-outline" size={19} color="#6B4E37" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>Drop Alerts & Notifications</Text>
                <Text style={styles.menuRowSub}>
                  {unreadCount > 0 ? `${unreadCount} unread atelier notifications` : 'All drop updates & order alerts'}
                </Text>
              </View>
              {unreadCount > 0 && (
                <View style={[styles.countPill, { backgroundColor: '#C53030' }]}>
                  <Text style={[styles.countPillText, { color: '#FFFFFF' }]}>{unreadCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 5. VIP CONCIERGE & SUPPORT ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>VIP CONCIERGE & HELP</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={openWhatsAppSupport}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="logo-whatsapp" size={19} color="#2E7D32" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>WhatsApp Personal Stylist</Text>
                <Text style={styles.menuRowSub}>Direct instant messaging with our atelier team</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>

            <View style={styles.menuLineDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBg}>
                <Ionicons name="headset-outline" size={19} color="#6B4E37" />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuRowTitle}>Help Center & FAQ</Text>
                <Text style={styles.menuRowSub}>Shipping policies, size guides, care instructions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A3998F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 6. SIGN OUT ACTION (When Authenticated) ── */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#C53030" />
            <Text style={styles.signOutBtnText}>Sign Out from Account</Text>
          </TouchableOpacity>
        )}

        {/* ── 7. LUXURY BRAND FOOTER ── */}
        <View style={styles.footerWrap}>
          <View style={styles.footerDivider} />
          <Image
            source={require('../assets/title-logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrandDesc}>Official Mobile Atelier & Storefront</Text>
          <Text style={styles.footerVersion}>Version 2.4.0 • Built with Pride</Text>
        </View>
      </ScrollView>

      {/* ── 8. EDIT PROFILE BOTTOM SHEET MODAL ── */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Edit Profile Details</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#1E1B18" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>FULL NAME *</Text>
            <TextInput
              style={styles.modalInput}
              value={editForm.name}
              onChangeText={(t) => setEditForm((prev) => ({ ...prev, name: t }))}
              placeholder="e.g. Julian Montgomery"
              placeholderTextColor="#A3998F"
            />

            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: '#F0EBE4' }]}
              value={editForm.email}
              editable={false}
              placeholder="julian@example.com"
              placeholderTextColor="#A3998F"
            />

            <Text style={styles.inputLabel}>PHONE NUMBER (FOR ORDER UPDATES)</Text>
            <TextInput
              style={styles.modalInput}
              value={editForm.phone}
              onChangeText={(t) => setEditForm((prev) => ({ ...prev, phone: t }))}
              placeholder="10-digit mobile number"
              placeholderTextColor="#A3998F"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveProfile}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveProfileBtnText}>Save Account Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FAF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4DC',
  },
  brandTitleWrap: {
    justifyContent: 'center',
  },
  headerTitleLogo: {
    width: 140,
    height: 24,
    marginBottom: 2,
  },
  brandTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 17,
    letterSpacing: 2.2,
    color: '#1E1B18',
  },
  brandSub: {
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: '#8A7F75',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.subtle,
  },
  topNotifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C53030',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  topNotifBadgeText: {
    fontFamily: typography.fontSansBold,
    fontSize: 8.5,
    color: '#FFFFFF',
    lineHeight: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAE2',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: '#1E1B18',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  /* ── MEMBER CARD (Authenticated) ── */
  memberCard: {
    backgroundColor: '#1E1B18',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...shadows.elevated,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6B4E37',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: typography.fontSansBold,
    fontSize: 20,
    color: '#FAF8F5',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  memberInfo: {
    flex: 1,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  tierPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#D4AF37',
  },
  userName: {
    fontFamily: typography.fontSansBold,
    fontSize: 17,
    color: '#FAF8F5',
    letterSpacing: 0.2,
  },
  userEmail: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: '#A3998F',
    marginTop: 1,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Stats Ribbon */
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontFamily: typography.fontSansBold,
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: '#D8CEBF',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* ── GUEST CARD ── */
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    ...shadows.card,
  },
  guestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guestTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: '#7D726A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 48,
    borderRadius: 24,
    gap: 10,
    ...shadows.card,
  },
  googleIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  emailSignInBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  emailSignInBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 12.5,
    color: '#6B4E37',
  },

  /* ── SECTIONS & MENU ITEMS ── */
  sectionWrap: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: '#8A7F75',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE4DC',
    overflow: 'hidden',
    ...shadows.subtle,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuIconBg: {
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
  menuRowTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
    color: '#1E1B18',
  },
  menuRowSub: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#8A7F75',
    marginTop: 1.5,
  },
  menuLineDivider: {
    height: 1,
    backgroundColor: '#F3EDE6',
    marginLeft: 66,
  },
  countPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAE2D8',
    marginRight: 4,
  },
  countPillText: {
    fontFamily: typography.fontSansBold,
    fontSize: 11,
    color: '#6B4E37',
  },

  /* ── SIGN OUT BUTTON ── */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF2F2',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FBD5D5',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  signOutBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 13,
    color: '#C53030',
    letterSpacing: 0.4,
  },

  /* ── FOOTER BRAND ── */
  footerWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  footerDivider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#EAE4DC',
    marginBottom: 14,
  },
  footerLogo: {
    width: 150,
    height: 26,
    marginBottom: 4,
  },
  footerBrandTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 12,
    letterSpacing: 2,
    color: '#6B4E37',
  },
  footerBrandDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: '#A3998F',
    marginTop: 2,
  },
  footerVersion: {
    fontFamily: typography.fontSans,
    fontSize: 9.5,
    color: '#C4B8AD',
    marginTop: 4,
  },

  /* ── EDIT PROFILE MODAL SHEET ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...shadows.elevated,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8CEBF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 6,
  },
  modalHeading: {
    fontFamily: typography.fontSansBold,
    fontSize: 18,
    color: '#1E1B18',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: '#7D726A',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE4DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.fontSans,
    fontSize: 14,
    color: '#1E1B18',
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4E37',
    height: 50,
    borderRadius: 25,
    gap: 8,
    marginTop: 22,
    ...shadows.card,
  },
  saveProfileBtnText: {
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
