import { Platform } from 'react-native';

// ================================================================
// DYNAMIC MULTI-HOST AUTO-DISCOVERY CONFIGURATION
// Auto-detects and connects to whichever IP/port is live
// ================================================================
export const DEV_DEVICE_IP = '10.10.180.0';
export const DEV_PORT = 5000;
export const PROD_API_BASE_URL = 'https://api.hummingtone.com';

// Candidate endpoints tested in priority order during development
export const CANDIDATE_HOSTS = [
  `http://localhost:${DEV_PORT}`,
  `http://127.0.0.1:${DEV_PORT}`,
  `http://10.0.2.2:${DEV_PORT}`,
  `http://${DEV_DEVICE_IP}:${DEV_PORT}`,
  `http://192.168.137.1:${DEV_PORT}`,
  `http://10.150.254.249:${DEV_PORT}`,
  `http://172.16.0.2:${DEV_PORT}`,
];

let activeBaseUrl = __DEV__ ? `http://localhost:${DEV_PORT}` : PROD_API_BASE_URL;

export const setActiveApiBaseUrl = (url) => {
  if (url && typeof url === 'string') {
    activeBaseUrl = url.replace(/\/+$/, '');
  }
};

export const getApiBaseUrl = () => {
  return activeBaseUrl;
};

export const API_BASE_URL = activeBaseUrl;

// Automatically resolve full image URL using the active base URL
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
  DEV_DEVICE_IP,
  DEV_PORT,
  CANDIDATE_HOSTS,
  API_BASE_URL,
  getImageUrl,
  getApiBaseUrl,
  setActiveApiBaseUrl,
};