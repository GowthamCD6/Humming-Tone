import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from './Icons';
import { typography } from '../theme/typography';
import { shadows } from '../theme/colors';
import { performGoogleSignIn } from '../services/googleAuth';
import { useAuth } from '../context/AuthContext';

export const GoogleAuthModal = ({
  visible,
  onClose,
  onSuccess,
  title = 'Sign In to Complete Purchase',
  subtitle = 'Sign in with your Google account to auto-fill delivery details, track orders, and secure checkout.',
}) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGooglePress = async () => {
    setLoading(true);
    try {
      const res = await performGoogleSignIn();
      if (res.success && res.user) {
        await login(res.user, res.token);
        onClose();
        if (onSuccess) {
          onSuccess(res.user);
        }
      } else if (!res.cancelled && res.message) {
        Alert.alert('Sign In Failed', res.message);
      }
    } catch (e) {
      Alert.alert('Authentication Error', 'Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max((insets.bottom || 0) + 20, 28) },
          ]}
        >
          {/* Header Drag Handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#6B5E55" />
          </TouchableOpacity>

          {/* Google Icon Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="logo-google" size={32} color="#6B4E37" />
          </View>

          {/* Title & Description */}
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{subtitle}</Text>

          {/* Google Sign-In Action Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGooglePress}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.googleIconBg}>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Guarantee Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={14} color="#38A169" />
            <Text style={styles.securityNoteText}>
              Official 256-Bit SSL Encrypted Authentication
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
    ...shadows.elevated,
  },
  handleWrap: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#D8CEBF',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAE4DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 14,
    ...shadows.card,
  },
  modalTitle: {
    fontFamily: typography.fontSansBold,
    fontSize: 20,
    color: '#1E1B18',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modalSub: {
    fontFamily: typography.fontSans,
    fontSize: 13,
    color: '#8A7F75',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1B18',
    height: 52,
    borderRadius: 26,
    gap: 12,
    ...shadows.card,
  },
  googleIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontFamily: typography.fontSansBold,
    fontSize: 14.5,
    letterSpacing: 0.4,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityNoteText: {
    fontFamily: typography.fontSans,
    fontSize: 11.5,
    color: '#6B6259',
  },
});
