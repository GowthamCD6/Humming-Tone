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
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { colors, shadows } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from your Humming Tone account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveProfile = () => {
    setEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
  };

  const PROFILE_MENU = [
    {
      id: 'wishlist',
      title: 'Saved Items & Wishlist',
      subtitle: `${wishlistCount} curated items`,
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: 'track',
      title: 'Track Orders & Shipments',
      subtitle: 'Real-time delivery status & history',
      icon: 'location-outline',
      onPress: () => navigation.navigate('OrderTracking'),
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      subtitle: 'Easy 7-day pickup assistance',
      icon: 'repeat-outline',
      onPress: () => navigation.navigate('ReturnRequest'),
    },
    {
      id: 'customize',
      title: 'Customize Apparel',
      subtitle: 'Create personalized custom garments',
      icon: 'color-palette-outline',
      onPress: () => navigation.navigate('CustomizeTab'),
    },
    {
      id: 'support',
      title: 'Customer Care & WhatsApp',
      subtitle: 'Order help & instant support',
      icon: 'chatbubble-ellipses-outline',
      onPress: () => navigation.navigate('Support'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Account" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {isAuthenticated ? (user.name || 'U')[0].toUpperCase() : <Ionicons name="person" size={24} color={colors.textInverse} />}
            </Text>
          </View>

          <View style={styles.userInfo}>
            {isAuthenticated ? (
              <>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.memberBadgeWrap}>
                  <Text style={styles.memberBadge}>HUMMING TONE PATRON</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.userName}>Welcome to Humming Tone</Text>
                <Text style={styles.userEmail}>Sign in to manage orders & saved items</Text>
              </>
            )}
          </View>
        </View>

        {/* Auth CTA if not logged in */}
        {!isAuthenticated ? (
          <View style={styles.authCtaBox}>
            <Button
              title="SIGN IN / REGISTER"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              size="md"
              style={styles.authBtn}
            />
          </View>
        ) : (
          <View style={styles.authCtaBox}>
            <Button
              title="EDIT PROFILE"
              onPress={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditModalVisible(true);
              }}
              variant="outline"
              size="sm"
              style={styles.editBtn}
            />
          </View>
        )}

        {/* Navigation Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>SERVICES & SETTINGS</Text>

          {PROFILE_MENU.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>

              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        )}

        {/* Footer Brand Info */}
        <View style={styles.footerBrand}>
          <Text style={styles.footerBrandName}>HUMMING TONE</Text>
          <Text style={styles.footerBrandDesc}>Premium Apparel & Custom Print Studio</Text>
          <Text style={styles.copyrightText}>© 2026 Humming Tone. All Rights Reserved.</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <Button
              title="SAVE CHANGES"
              onPress={handleSaveProfile}
              variant="primary"
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  avatarText: {
    fontFamily: typography.fontSans,
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.textInverse,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.fontSerif,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberBadgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberBadge: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    fontWeight: typography.weightBold,
    letterSpacing: 1.2,
    color: colors.goldDark,
  },
  authCtaBox: {
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  authBtn: {
    borderRadius: 8,
  },
  editBtn: {
    borderRadius: 8,
  },
  menuSection: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 8,
  },
  menuHeading: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.goldDark,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: spacing.screenPadding,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.errorLight,
  },
  logoutText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightBold,
    letterSpacing: 1.2,
    color: colors.error,
  },
  footerBrand: {
    alignItems: 'center',
    marginTop: 36,
    paddingHorizontal: spacing.screenPadding,
  },
  footerBrandName: {
    fontFamily: typography.fontSerif,
    fontSize: 15,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  footerBrandDesc: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  copyrightText: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: colors.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  inputLabel: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: typography.fontSans,
  },
});
