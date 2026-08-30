import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '../components/Icons';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { performGoogleSignIn } from '../services/googleAuth';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await performGoogleSignIn();
      if (res.success && res.user) {
        await login(res.user, res.token);
        navigation.goBack();
      } else if (!res.cancelled && res.message) {
        setError(res.message);
      }
    } catch (e) {
      setError('Unable to complete Google sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!name.trim() && !email.trim()) {
      setError('Please enter your name or email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(
        {
          name: (name || email.split('@')[0] || 'Humming Tone Member').trim(),
          email: email.trim() || 'member@hummingtone.com',
          phone: phone.trim() || '9876543210',
        },
        'customer-token-' + Date.now()
      );
      navigation.goBack();
    } catch (e) {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    await login(
      {
        name: 'Humming Tone Patron',
        email: 'guest@hummingtone.com',
        phone: '',
      },
      'guest-token'
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header title="Member Sign In" showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../assets/title-logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandSub}>OFFICIAL STORE & APP</Text>
            <Text style={styles.brandTagline}>
              Sign in to manage your orders, saved wishlist items, and express checkout.
            </Text>
          </View>

          {/* Error Alert */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Customer Sign In Form */}
          <View style={styles.form}>
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              activeOpacity={0.88}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.googleIconCircle}>
                    <Ionicons name="logo-google" size={16} color="#EA4335" />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN IN WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Julian Montgomery"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (error) setError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="julian@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity
              style={styles.signInActionBtn}
              onPress={handleSignIn}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signInActionBtnText}>Sign In to Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={handleGuestContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Perks Bar */}
          <View style={styles.perksCard}>
            <View style={styles.perkRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
              <Text style={styles.perkText}>Encrypted & Secure Atelier Account</Text>
            </View>
            <View style={styles.perkRow}>
              <Ionicons name="gift-outline" size={18} color={colors.primary} />
              <Text style={styles.perkText}>Exclusive Access to Limited Releases</Text>
            </View>
            <View style={styles.perkRow}>
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <Text style={styles.perkText}>One-on-One Master Artisan Consultations</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroLogo: {
    width: 200,
    height: 36,
    marginBottom: 6,
  },
  brandTitle: {
    fontFamily: typography.fontSerif,
    fontSize: 24,
    fontWeight: typography.weightBold,
    letterSpacing: typography.spacingWidest,
    color: colors.primary,
    marginBottom: 4,
  },
  brandSub: {
    fontFamily: typography.fontSans,
    fontSize: 10,
    fontWeight: typography.weightBold,
    letterSpacing: 2,
    color: colors.goldMuted,
    marginBottom: spacing.sm,
  },
  brandTagline: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: typography.fontSans,
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontSans,
    fontSize: 11,
    fontWeight: typography.weightBold,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 48,
    borderRadius: 24,
    gap: 10,
    marginBottom: spacing.lg,
  },
  googleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    fontFamily: typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  signInActionBtn: {
    backgroundColor: '#6B4E37',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  signInActionBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 13.5,
  },
  guestBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    fontWeight: typography.weightSemiBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  perksCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    gap: spacing.md,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perkText: {
    fontFamily: typography.fontSans,
    fontSize: 12.5,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default LoginScreen;
