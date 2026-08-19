import { getApiBaseUrl } from './apiConfig';

const getSiteContentUrl = () => `${getApiBaseUrl()}/api/site-content`;

// Minimal fallback defaults — only shopLinks and supportLinks are hardcoded.
// Everything else (brandName, description, company, social, legal,
// genderCategory, genderStatus, customize) comes from the database.
export const defaultSiteContent = {
  footer: {
    brandName: '',
    description: '',
    shippingFee: 0,
    gstRate: 5,
    social: {},
    shopLinks: [
      { label: 'New Arrival', href: '/usertab/home#new-arrivals', active: true },
      { label: 'Featured Products', href: '/usertab/home#featured-products', active: true },
      { label: 'Mens Collection', href: '/usertab/men', active: true },
      { label: 'Women Collection', href: '/usertab/women', active: true },
      { label: 'Children Collection', href: '/usertab/children', active: true },
      { label: 'Kids Collection', href: '/usertab/baby', active: true },
      { label: 'Sports Collection', href: '/usertab/sports', active: true },
    ],
    supportLinks: [
      { label: 'Contact Us', href: '/usertab/contact_us', active: true },
      { label: 'Shipping Info', href: '/usertab/shipping_info', active: true },
      { label: 'Returns & Exchanges', href: '/usertab/return_&_exchange', active: true },
    ],
    company: {
      email: '',
      phone: '',
      address: '',
    },
    legal: {
      copyright: '',
      privacyPolicyLabel: 'Privacy Policy',
      privacyPolicyHref: '/usertab/privacy_policy',
      termsLabel: 'Terms of Service',
      termsHref: '/usertab/terms_of_service',
    },
  },
  shippingFee: 0,
  gstRate: 5,
  genderCategory: {},
  genderStatus: {},
  customize: {
    productCategories: [],
    colors: [],
    materials: [],
    sizes: [],
    galleryDesigns: [],
  },
};

// In-memory cache with TTL
let cachedContent = null;
let isInitialized = false;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Invalidate cache (call after admin saves changes)
export function invalidateCache() {
  cachedContent = null;
  isInitialized = false;
  cacheTimestamp = 0;
}

// Check if cache is still valid
function isCacheValid() {
  return cachedContent && isInitialized && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
}

// Fetch content from API
export async function fetchSiteContent(forceRefresh = false) {
  // Return cached content if valid and not forced
  if (!forceRefresh && isCacheValid()) {
    return cachedContent;
  }

  try {
    const response = await fetch(getSiteContentUrl());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Use API data as primary, only fall back to defaults for missing fields
    const parsedFee = Number(data.shippingFee != null ? data.shippingFee : (data.footer?.shippingFee != null ? data.footer.shippingFee : 0));
    const parsedGst = Number(data.gstRate != null ? data.gstRate : (data.footer?.gstRate != null ? data.footer.gstRate : 5));
    cachedContent = {
      footer: {
        brandName: data.footer?.brandName || defaultSiteContent.footer.brandName,
        description: data.footer?.description || defaultSiteContent.footer.description,
        shippingFee: parsedFee,
        gstRate: parsedGst,
        social: data.footer?.social || defaultSiteContent.footer.social,
        company: data.footer?.company || defaultSiteContent.footer.company,
        legal: data.footer?.legal || defaultSiteContent.footer.legal,
        // shopLinks and supportLinks: use DB data if available, else hardcoded fallback
        shopLinks: (data.footer?.shopLinks && data.footer.shopLinks.length > 0)
          ? data.footer.shopLinks
          : defaultSiteContent.footer.shopLinks,
        supportLinks: (data.footer?.supportLinks && data.footer.supportLinks.length > 0)
          ? data.footer.supportLinks
          : defaultSiteContent.footer.supportLinks,
      },
      shippingFee: parsedFee,
      gstRate: parsedGst,
      genderCategory: data.genderCategory || defaultSiteContent.genderCategory,
      genderStatus: data.genderStatus || defaultSiteContent.genderStatus,
      customize: data.customize || defaultSiteContent.customize,
    };
    
    isInitialized = true;
    cacheTimestamp = Date.now();
    return cachedContent;
  } catch (error) {
    console.error('Error fetching site content:', error);
    // Return default content on error
    cachedContent = defaultSiteContent;
    isInitialized = true;
    cacheTimestamp = Date.now();
    return defaultSiteContent;
  }
}

// Get site content synchronously (returns cached or default)
export function getSiteContent() {
  if (!isInitialized) {
    cachedContent = defaultSiteContent;
    fetchSiteContent().catch(console.error);
  }
  return cachedContent || defaultSiteContent;
}

// Update footer in database
export async function updateFooter(partialFooter) {
  try {
    const response = await fetch(`${getSiteContentUrl()}/footer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialFooter)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update footer');
    }
    
    // Refresh cache from server
    await fetchSiteContent(true);
    return cachedContent;
  } catch (error) {
    console.error('Error updating footer:', error);
    throw error;
  }
}

// Update gender category mapping in database
export async function updateGenderCategory(partialGenderCategory) {
  try {
    const response = await fetch(`${getSiteContentUrl()}/gender-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialGenderCategory)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update gender categories');
    }
    
    // Refresh cache from server
    await fetchSiteContent(true);
    return cachedContent;
  } catch (error) {
    console.error('Error updating gender categories:', error);
    throw error;
  }
}

// Update gender visibility status in database
export async function updateGenderStatus(genderStatusMap) {
  try {
    const response = await fetch(`${getSiteContentUrl()}/gender-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genderStatusMap)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update gender status');
    }
    
    // Refresh cache from server
    await fetchSiteContent(true);
    return cachedContent;
  } catch (error) {
    console.error('Error updating gender status:', error);
    throw error;
  }
}

// Update customize content in database
export async function updateCustomize(customizeData) {
  try {
    const response = await fetch(`${getSiteContentUrl()}/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customizeData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update customize content');
    }
    
    // Refresh cache from server
    await fetchSiteContent(true);
    return cachedContent;
  } catch (error) {
    console.error('Error updating customize content:', error);
    throw error;
  }
}

// Reset to defaults (client-side only - for UI reset)
export function resetSiteContent() {
  cachedContent = JSON.parse(JSON.stringify(defaultSiteContent));
  return cachedContent;
}

// Get active gender options
export function getGenderOptions() {
  const content = getSiteContent();
  const allGenders = Object.keys(content.genderCategory);
  const genderStatus = content.genderStatus || {};
  
  // Filter to only return active genders
  return allGenders.filter(gender => genderStatus[gender] !== false);
}

// Get category options for a specific gender
export function getCategoryOptionsForGender(gender) {
  const map = getSiteContent().genderCategory;
  if (map?.[gender] && Array.isArray(map[gender])) return map[gender];
  return ['All Categories'];
}

// Initialize content on module load
fetchSiteContent().catch(console.error);