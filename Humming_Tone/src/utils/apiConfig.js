// Central API Base URL helper
export const getApiBaseUrl = () => {
  // If running in browser and domain is hummingtone.com or any non-localhost domain (like Vercel)
  if (typeof window !== 'undefined' && window.location.hostname && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
    return 'https://api.hummingtone.com';
  }
  
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

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
  const baseUrl = getApiBaseUrl();
  const cleanBase = baseUrl.replace(/\/+$/, '');
  let cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  
  // If the path doesn't start with uploads/ but is just a products/ or filename
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getImageUrl,
};
