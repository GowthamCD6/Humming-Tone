// Central API Base URL helper
const getEnvApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api.hummingtone.com';
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getEnvApiUrl();

export const getApiUrl = (path = '') => {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getImageUrl,
};
