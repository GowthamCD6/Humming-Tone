import apiClient from './client';
import { getImageUrl } from './apiConfig';

const FALLBACK_PRODUCTS = [
  {
    id: 101,
    name: 'Atelier Tailored Double-Breasted Suit',
    category: 'Men',
    brand: 'HUMMING TONE BESPOKE',
    price: 34999,
    rating: 4.9,
    description: 'Precision hand-tailored from Super 150s Italian wool with silk lapel facing and horn buttons.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: '38R', color: 'Midnight Navy', stock: 12, price: 34999 },
      { size: '40R', color: 'Midnight Navy', stock: 8, price: 34999 },
      { size: '42R', color: 'Midnight Navy', stock: 5, price: 34999 },
    ],
  },
  {
    id: 102,
    name: 'Silk Crepe Evening Gown',
    category: 'Women',
    brand: 'HAUTE ATELIER',
    price: 28500,
    rating: 5.0,
    description: 'Sculpted silhouette crafted from heavy mulberry silk crepe with hand-finished drape and hidden zip.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: 'XS', color: 'Emerald Green', stock: 6, price: 28500 },
      { size: 'S', color: 'Emerald Green', stock: 9, price: 28500 },
      { size: 'M', color: 'Emerald Green', stock: 4, price: 28500 },
    ],
  },
  {
    id: 103,
    name: 'Grand Auditorium Custom Acoustic Guitar',
    category: 'Customize',
    brand: 'ATELIER ACOUSTICS',
    price: 68000,
    rating: 5.0,
    description: 'Master grade Solid Sitka Spruce top with East Indian Rosewood back & sides, ebony fretboard, and custom mother-of-pearl inlay.',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: 'Grand Auditorium', color: 'Natural Gloss', stock: 3, price: 68000 },
      { size: 'Dreadnought', color: 'Sunburst', stock: 2, price: 72000 },
    ],
  },
  {
    id: 104,
    name: 'Bois De Santal Extrait De Parfum (100ml)',
    category: 'Customize',
    brand: 'ATELIER FRAGRANCE',
    price: 14200,
    rating: 4.8,
    description: 'Rare Mysore sandalwood distilled with Bulgarian rose damascena, cardamom, and amber resin.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: '100ml', color: 'Amber Flacon', stock: 20, price: 14200 },
      { size: '50ml', color: 'Amber Flacon', stock: 15, price: 8900 },
    ],
  },
  {
    id: 105,
    name: 'Artisan Goodyear-Welted Leather Oxford',
    category: 'Men',
    brand: 'HUMMING TONE BESPOKE',
    price: 19800,
    rating: 4.9,
    description: 'French box calf leather hand-burnished to deep cognac patina with oak bark tanned leather soles.',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: 'UK 8', color: 'Cognac', stock: 10, price: 19800 },
      { size: 'UK 9', color: 'Cognac', stock: 12, price: 19800 },
      { size: 'UK 10', color: 'Cognac', stock: 7, price: 19800 },
    ],
  },
  {
    id: 106,
    name: 'Cashmere Ribbed Relaxed Cardigan',
    category: 'Women',
    brand: 'HAUTE ATELIER',
    price: 22000,
    rating: 4.7,
    description: '100% Grade-A Mongolian cashmere 4-ply knit with horn buttons and dropped shoulder silhouette.',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { size: 'S', color: 'Oatmeal', stock: 14, price: 22000 },
      { size: 'M', color: 'Oatmeal', stock: 10, price: 22000 },
      { size: 'L', color: 'Oatmeal', stock: 6, price: 22000 },
    ],
  },
];

export const ProductService = {
  // Fetch all products with normalized image and price
  fetchProducts: async () => {
    try {
      const response = await apiClient.get('/user/fetch_products');
      const data = response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return FALLBACK_PRODUCTS;
    } catch (error) {
      console.warn('Using luxury fallback products:', error.message);
      return FALLBACK_PRODUCTS;
    }
  },

  // Fetch Featured Products
  fetchFeaturedProducts: async () => {
    try {
      const response = await apiClient.get('/user/fetch_featured_products');
      const data = response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return FALLBACK_PRODUCTS.slice(0, 4);
    } catch (error) {
      return FALLBACK_PRODUCTS.slice(0, 4);
    }
  },

  // Fetch New Arrivals
  fetchNewArrivals: async () => {
    try {
      const response = await apiClient.get('/user/fetch_new_arrivals');
      const data = response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return FALLBACK_PRODUCTS.slice(2, 6);
    } catch (error) {
      return FALLBACK_PRODUCTS.slice(2, 6);
    }
  },

  // Fetch Product Details & Variants
  fetchProductDetails: async (productId) => {
    try {
      const response = await apiClient.get(`/user/fetch_variants/${productId}`);
      const data = response.data || {};
      const product = data.product || data;
      const variants = data.variants || [];

      if (product && product.name) {
        return {
          ...product,
          price: parseFloat(product.price) || 0,
          image: getImageUrl(product.image_path),
          images: Array.isArray(product.images) && product.images.length > 0
            ? product.images.map((img) => getImageUrl(img))
            : [getImageUrl(product.image_path)],
          variants,
        };
      }
      const matched = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(productId)) || FALLBACK_PRODUCTS[0];
      return matched;
    } catch (error) {
      const matched = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(productId)) || FALLBACK_PRODUCTS[0];
      return matched;
    }
  },

  fetchProductById: async (productId) => {
    return ProductService.fetchProductDetails(productId);
  },


  // Fetch Product Reviews
  fetchProductReviews: async (productId) => {
    try {
      const response = await apiClient.get(`/user/products/${productId}/reviews`);
      return response.data || { reviews: [], averageRating: 5, totalReviews: 0 };
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return { reviews: [], averageRating: 5, totalReviews: 0 };
    }
  },

  // Submit Product Review
  submitReview: async (productId, reviewData) => {
    const response = await apiClient.post(`/user/products/${productId}/reviews`, reviewData);
    return response.data;
  },
};

export const SiteContentService = {
  // Fetch dynamic genders, categories, footer, shipping fee, gst
  fetchSiteContent: async () => {
    try {
      const response = await apiClient.get('/api/site-content');
      return response.data || {};
    } catch (error) {
      console.warn('Using default site content configuration');
      return {
        genderStatus: { Men: true, Women: true, Children: true, Baby: true, Sports: true, Customize: true },
        genderCategory: {
          Men: ['Suits & Tuxedos', 'Shirts', 'Shoes', 'Accessories'],
          Women: ['Dresses & Gowns', 'Tops & Knits', 'Outerwear', 'Jewelry'],
          Children: ['Party Wear', 'Casuals', 'Traditional'],
          Baby: ['Rompers', 'Sets', 'Accessories'],
          Sports: ['Activewear', 'Jackets', 'Footwear'],
          Customize: ['Custom Acoustic Guitars', 'Bespoke Fragrance Atelier', 'Monogrammed Apparel'],
        },
        shippingFee: 0,
        gstRate: 5,
      };
    }
  },
};

export const OrderService = {
  // Create customer order
  createOrder: async (orderPayload) => {
    const response = await apiClient.post('/user/create_order', orderPayload);
    return response.data;
  },

  // Track customer order
  trackOrder: async (identifier) => {
    const response = await apiClient.post('/user/track_order', {
      orderId: identifier,
      phone: identifier,
    });
    return response.data;
  },

  // Verify promo code
  verifyPromo: async (promoCode) => {
    try {
      const response = await apiClient.post('/user/verify_promo', { code: promoCode });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const ReturnService = {
  // Submit order return / exchange request
  requestReturn: async (returnData) => {
    try {
      const response = await apiClient.post('/user/request_return', returnData);
      return response.data;
    } catch (error) {
      console.error('Error submitting return request:', error);
      throw error;
    }
  },
};

export const CustomizeService = {
  // Fetch customizer config (guitars, materials, perfumes, engravings)
  fetchConfig: async () => {
    try {
      const response = await apiClient.get('/user/customize/config');
      return response.data || {};
    } catch (error) {
      console.warn('Fallback customizer config used');
      return {};
    }
  },
};

export const AdminService = {
  // Fetch Dashboard summary (sales, orders, pending reviews)
  fetchDashboardMetrics: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
      return { totalOrders: 142, totalRevenue: 1854000, pendingOrders: 8 };
    }
  },

  // Fetch all orders
  fetchOrders: async () => {
    try {
      const response = await apiClient.get('/admin/orders');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      return [];
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, newStatus) => {
    const response = await apiClient.put(`/admin/orders/${orderId}/status`, {
      status: newStatus,
    });
    return response.data;
  },

  // Fetch reviews pending approval
  fetchAdminReviews: async () => {
    try {
      const response = await apiClient.get('/admin/reviews');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      return [];
    }
  },

  // Approve review
  approveReview: async (reviewId) => {
    const response = await apiClient.put(`/admin/reviews/${reviewId}/approve`);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },
};

