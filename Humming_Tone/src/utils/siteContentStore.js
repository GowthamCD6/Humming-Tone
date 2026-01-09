const API_URL = 'http://localhost:5000/api/site-content';

export const defaultSiteContent = {
  footer: {
    brandName: 'Humming & Tone',
    description:
      'Your premier destination for stylish and affordable fashion. Discover the latest trends in clothing for men, women, and kids.',
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      pinterest: '',
    },
    shopLinks: [
      { label: 'Featured Products', href: '/featured', active: true },
      { label: 'Men', href: '/mens', active: true },
      { label: 'Women', href: '/womens', active: true },
      { label: 'Baby', href: '/baby', active: true },
      { label: 'Kids', href: '/kids', active: true },
      { label: 'Children', href: '/childrens', active: true },
    ],
    supportLinks: [
      { label: 'Contact Us', href: '/usertab/contact_us', active: true },
      { label: 'Shipping Info', href: '/usertab/shipping_info', active: true },
      { label: 'Returns & Exchanges', href: '/usertab/return_&_exchange', active: true },
    ],
    company: {
      email: 'fashionandmore.md@gmail.com',
      phone: '+91 80729 77025',
      address: '49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.',
    },
    legal: {
      copyright: '© 2025 humming tone | All rights reserved.',
      privacyPolicyLabel: 'Privacy Policy',
      privacyPolicyHref: '/usertab/privacy_policy',
      termsLabel: 'Terms of Service',
      termsHref: '/usertab/terms_of_service',
    },
  },
  genderCategory: {
    Men: ['All Categories', 'Shirts', 'Pants', 'Jackets', 'Shoes', 'Accessories'],
    Children: ['All Categories', 'Tops', 'Bottoms', 'Winter sets'],
    Baby: ['All Categories', 'Baby Sets', 'Winter sets'],
    Sports: ['All Categories', 'Running', 'Training', 'Outdoor', 'Shoes', 'Accessories'],
    Customize: ['All Categories', 'Printed', 'Embroidery'],
  },
  genderStatus: {
    Men: true,
    Children: true,
    Baby: true,
    Sports: true,
    Customize: true,
  },
  customize: {
    productCategories: [
      { id: 'tshirts', name: 'T-SHIRTS', description: 'Classic cotton essentials', image: null, variants: [
        { id: 'round', name: 'Round Neck', image: null },
        { id: 'vneck', name: 'V-Neck', image: null },
        { id: 'collar', name: 'Collar/Polo', image: null },
        { id: 'henley', name: 'Henley', image: null },
        { id: 'scoop', name: 'Scoop Neck', image: null },
        { id: 'sleeveless_t', name: 'Sleeveless', image: null },
      ]},
      { id: 'hoodies', name: 'HOODIES', description: 'Cozy & stylish outerwear', image: null, variants: [
        { id: 'pullover', name: 'Pullover', image: null },
        { id: 'zipup', name: 'Zip-Up', image: null },
        { id: 'sleeveless_h', name: 'Sleeveless/Gilet', image: null },
        { id: 'oversized', name: 'Oversized', image: null },
        { id: 'cropped_h', name: 'Cropped', image: null },
        { id: 'crop_hoodie', name: 'Crop Hoodie', image: null },
      ]},
      { id: 'sweatshirts', name: 'SWEATSHIRTS', description: 'Premium crew neck comfort', image: null, variants: [
        { id: 'crew', name: 'Crew Neck Standard', image: null },
      ]},
      { id: 'sportswear', name: 'SPORTSWEAR', description: 'High performance gear', image: null, variants: [
        { id: 'dryfit', name: 'Dry-fit Jersey T-Shirts', image: null },
        { id: 'athletic', name: 'Athletic Tops', image: null },
      ]},
    ],
    colors: [
      { id: 'white', name: 'White', hex: '#FFFFFF' },
      { id: 'black', name: 'Black', hex: '#000000' },
      { id: 'navy', name: 'Navy Blue', hex: '#001F3F' },
      { id: 'red', name: 'Red', hex: '#FF4136' },
      { id: 'green', name: 'Green', hex: '#2ECC40' },
      { id: 'gray', name: 'Gray', hex: '#AAAAAA' },
      { id: 'yellow', name: 'Yellow', hex: '#FFDC00' },
      { id: 'purple', name: 'Purple', hex: '#B10DC9' },
      { id: 'orange', name: 'Orange', hex: '#FF851B' },
      { id: 'pink', name: 'Pink', hex: '#F012BE' },
      { id: 'brown', name: 'Brown', hex: '#8B4513' },
      { id: 'custom', name: 'Custom Color', hex: null },
    ],
    materials: [
      { id: 'cotton', name: 'Pure Cotton', desc: 'Soft & Breathable', image: null },
      { id: 'polyester', name: 'Polyester', desc: 'Durable & Quick-dry', image: null },
      { id: 'blend', name: 'Cotton Blend', desc: 'Best of Both', image: null },
      { id: 'premium', name: 'Premium Cotton', desc: 'Luxury Feel', image: null },
      { id: 'organic', name: 'Organic Cotton', desc: '100% Natural', image: null },
      { id: 'bamboo', name: 'Bamboo Fabric', desc: 'Eco-friendly', image: null },
    ],
    sizes: [
      { id: 'XS', name: 'XS', chest: '32-34"', icon: 'looks_one' },
      { id: 'S', name: 'S', chest: '35-37"', icon: 'looks_two' },
      { id: 'M', name: 'M', chest: '38-40"', icon: 'looks_3' },
      { id: 'L', name: 'L', chest: '41-43"', icon: 'looks_4' },
      { id: 'XL', name: 'XL', chest: '44-46"', icon: 'looks_5' },
      { id: 'XXL', name: 'XXL', chest: '47-49"', icon: 'looks_6' },
      { id: '3XL', name: '3XL', chest: '50-52"', icon: 'exposure_plus_1' },
    ],
    galleryDesigns: [
      { id: 'design1', name: 'Abstract Art', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop' },
      { id: 'design2', name: 'Geometric', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop' },
      { id: 'design3', name: 'Nature', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop' },
      { id: 'design4', name: 'Typography', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop' },
      { id: 'design5', name: 'Minimal', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop' },
      { id: 'design6', name: 'Vintage', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { id: 'design7', name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop' },
      { id: 'design8', name: 'Music', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
    ],
  },
};

// In-memory cache
let cachedContent = null;
let isInitialized = false;

// Fetch content from API
export async function fetchSiteContent() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Merge with defaults to ensure all fields exist
    cachedContent = {
      ...defaultSiteContent,
      ...data,
      footer: { ...defaultSiteContent.footer, ...(data.footer || {}) },
      genderCategory: { ...defaultSiteContent.genderCategory, ...(data.genderCategory || {}) },
      genderStatus: { ...defaultSiteContent.genderStatus, ...(data.genderStatus || {}) },
    };
    
    isInitialized = true;
    return cachedContent;
  } catch (error) {
    console.error('Error fetching site content:', error);
    // Return default content on error
    cachedContent = defaultSiteContent;
    isInitialized = true;
    return defaultSiteContent;
  }
}

// Get site content synchronously (returns cached or default)
export function getSiteContent() {
  if (!isInitialized) {
    // Initialize with default and trigger async fetch
    cachedContent = defaultSiteContent;
    fetchSiteContent().catch(console.error);
  }
  return cachedContent || defaultSiteContent;
}

// Update footer in database
export async function updateFooter(partialFooter) {
  try {
    const response = await fetch(`${API_URL}/footer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialFooter)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update footer');
    }
    
    // Refresh cache from server
    await fetchSiteContent();
    return cachedContent;
  } catch (error) {
    console.error('Error updating footer:', error);
    throw error;
  }
}

// Update gender category mapping in database
export async function updateGenderCategory(partialGenderCategory) {
  try {
    const response = await fetch(`${API_URL}/gender-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialGenderCategory)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update gender categories');
    }
    
    // Refresh cache from server
    await fetchSiteContent();
    return cachedContent;
  } catch (error) {
    console.error('Error updating gender categories:', error);
    throw error;
  }
}

// Update gender visibility status in database
export async function updateGenderStatus(genderStatusMap) {
  try {
    const response = await fetch(`${API_URL}/gender-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genderStatusMap)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update gender status');
    }
    
    // Refresh cache from server
    await fetchSiteContent();
    return cachedContent;
  } catch (error) {
    console.error('Error updating gender status:', error);
    throw error;
  }
}

// Update customize content in database
export async function updateCustomize(customizeData) {
  try {
    const response = await fetch(`${API_URL}/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customizeData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update customize content');
    }
    
    // Refresh cache from server
    await fetchSiteContent();
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