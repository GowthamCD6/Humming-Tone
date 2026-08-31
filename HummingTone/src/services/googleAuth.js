import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import apiClient from '../api/client';

// Web Client ID used by Google Play Services to generate the ID token for the backend
export const GOOGLE_WEB_CLIENT_ID = '957475387630-utdc491trqgmh8g4he1uju4o0mdpi1b7.apps.googleusercontent.com';

let isConfigured = false;

export const configureGoogleSignIn = () => {
  if (isConfigured) return;
  try {
    if (GoogleSignin && typeof GoogleSignin.configure === 'function') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        scopes: ['profile', 'email'],
      });
      isConfigured = true;
    }
  } catch (e) {
    console.warn('GoogleSignin configure error:', e?.message);
  }
};

/**
 * Perform Native Google Sign-In and authenticate with backend
 */
export const performGoogleSignIn = async () => {
  try {
    configureGoogleSignIn();

    if (!GoogleSignin || typeof GoogleSignin.hasPlayServices !== 'function') {
      throw new Error('Google Play Services is initializing. Please try again in a moment.');
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // In v13+, signIn() returns { data: { idToken, user, ... } } or { idToken, user, ... }
    const response = await GoogleSignin.signIn();

    const googleUser = response?.data?.user || response?.user || response?.data || response;
    const idToken = response?.data?.idToken || response?.idToken || '';

    if (!googleUser || (!googleUser.email && !googleUser.name)) {
      throw new Error('Could not retrieve Google profile data. Please try again.');
    }

    let backendUser = {
      id: googleUser.id || 'usr_' + Date.now(),
      name: googleUser.name || 'Humming Tone Member',
      email: (googleUser.email || '').toLowerCase().trim(),
      avatar_url: googleUser.photo || null,
      phone: '',
    };
    let authToken = idToken || 'google-token-' + Date.now();

    // Sync with backend API
    try {
      if (idToken) {
        const backendRes = await apiClient.post('/api/auth/google/user', {
          credential: idToken,
        });
        if (backendRes.data && backendRes.data.user) {
          backendUser = {
            ...backendRes.data.user,
            avatar_url: backendRes.data.user.avatar_url || googleUser.photo,
          };
          authToken = backendRes.data.token || authToken;
        }
      }
    } catch (apiErr) {
      console.warn('Backend Google Auth sync fallback:', apiErr.message);
    }

    return {
      success: true,
      user: backendUser,
      token: authToken,
    };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true, message: 'Google sign in was cancelled.' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, message: 'Google sign in is already in progress.' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, message: 'Google Play Services is not available or outdated on this device.' };
    }
    console.error('Google Sign In Error:', error);
    return {
      success: false,
      message: error.message || 'Unable to sign in with Google.',
    };
  }
};

/**
 * Sign out of Google session
 */
export const performGoogleSignOut = async () => {
  try {
    configureGoogleSignIn();
    await GoogleSignin.signOut();
  } catch (e) {
    console.warn('Google Signout error:', e);
  }
};
