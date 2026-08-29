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
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from your atelier account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const PROFILE_MENU = [
    {
      id: 'wishlist',
      title: 'Saved Items & Wishlist',
      subtitle: `${wishlistCount} curated pieces`,
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: 'track',
      title: 'Track Orders & Shipments',
      subtitle: 'Real-time delivery milestones',
      icon: 'location-outline',
      onPress: () => navigation.navigate('OrderTracking'),
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      subtitle: 'Complimentary 7-day pickup',
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
      subtitle: 'Order help & product inquiries',
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
                <Text style={styles.memberBadge}>HUMMING TONE MEMBER</Text>
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
            />
          </View>
        ) : (
          <View style={styles.authCtaBox}>
            <Button
              title="EDIT PROFILE"
              onPress={() => setEditModalVisible(true)}
              variant="outline"
              size="sm"
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
          <Text style={styles.footerBrandDesc}>Premium Fashion & Custom Apparel</Text>
          <Text style={styles.copyrightText}>© 2026 Humming Tone. All Rights Reserved.</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
    fontSize: 16.5,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberBadge: {
    fontFamily: typography.fontSans,
    fontSize: 9,
    fontWeight: typography.weightBold,
    color: colors.goldMuted,
    letterSpacing: 1,
  },
  authCtaBox: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 14,
  },
  menuSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
  },
  menuHeading: {
    fontFamily: typography.fontSans,
    fontSize: 10.5,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontFamily: typography.fontSans,
    fontSize: 13.5,
    color: colors.textPrimary,
    fontWeight: typography.weightSemiBold,
  },
  menuSubtitle: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 4,
  },
  copyrightText: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    color: colors.textMuted,
  },
});

