// Central API Base URL helper
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
