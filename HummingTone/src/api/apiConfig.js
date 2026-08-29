import { Platform } from 'react-native';

// When running with `adb reverse tcp:5000 tcp:5000`, 'localhost:5000' works on physical Android devices, emulators, and iOS
const DEV_HOST = 'localhost'; 

export const getApiBaseUrl = () => {
  if (__DEV__) {
    return `http://${DEV_HOST}:5000`;
  }
  return 'https://api.hummingtone.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  }

  if (typeof imagePath === 'string' && imagePath.includes('cloudinary.com')) {
    if (!imagePath.includes('/f_auto') && !imagePath.includes('/q_auto')) {
      return imagePath.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    }
    return imagePath;
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  let cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${baseUrl}/${cleanPath}`;
};

export default {
  API_BASE_URL,
  getImageUrl,
  getApiBaseUrl,
};
