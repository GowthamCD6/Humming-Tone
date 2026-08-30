// ================================================================
// SINGLE CONFIGURATION POINT FOR LOCAL BACKEND IP
// Change your PC / Wi-Fi IPv4 address here ONCE, and it applies everywhere:
// ================================================================
export const DEV_DEVICE_IP = 'localhost'; // <- Uses adb reverse tcp:5000 tcp:5000 directly
export const DEV_PORT = 5000;
export const PROD_API_BASE_URL = 'https://api.hummingtone.com';

// Automatically construct base API URL from DEV_DEVICE_IP and DEV_PORT
export const getApiBaseUrl = () => {
  if (__DEV__) {
    const host = DEV_DEVICE_IP || 'localhost';
    return `http://${host}:${DEV_PORT}`;
  }
  return PROD_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// Automatically resolve full image URL using the dynamic API base URL
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
  API_BASE_URL,
  getImageUrl,
  getApiBaseUrl,
};
