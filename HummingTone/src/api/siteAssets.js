/**
 * Centralized Site Assets Configuration for React Native Mobile
 * High-speed Cloudinary CDN URLs with mobile-optimized resolution & auto WebP
 */

export const getOptimizedCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url;
  }

  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }

  const { width, quality = 'auto', format = 'auto' } = options;
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
};

export const SITE_ASSETS = {
  logo: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019114/hummingtone/site-assets/logo_1788019115174.png',
    { width: 300 }
  ),
  titleLogo: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019115/hummingtone/site-assets/title-logo_1788019116197.png',
    { width: 150 }
  ),
  homeHero: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019113/hummingtone/site-assets/home1_1788019104412.png',
    { width: 1000 }
  ),
  craftsmanship: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019101/hummingtone/site-assets/craftsmanship_1788019099963.jpg',
    { width: 800 }
  ),
  aboutHero: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019093/hummingtone/site-assets/about_hero_1788019093351.jpg',
    { width: 800 }
  ),
  aboutDetail: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019091/hummingtone/site-assets/about_detail_1788019091290.jpg',
    { width: 800 }
  ),
  demoProduct: getOptimizedCloudinaryUrl(
    'https://res.cloudinary.com/agoiw3rz/image/upload/v1788019103/hummingtone/site-assets/demo_1788019102849.jpg',
    { width: 600 }
  ),
};

export default SITE_ASSETS;
