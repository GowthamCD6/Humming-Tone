import apiClient from './client';
import { getImageUrl } from './apiConfig';

export const ProductService = {
  // Fetch all products directly from backend
  fetchProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/user/fetch_products', { params });
      const data = response.data || [];
      if (Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching products from backend:', error.message);
      return [];
    }
  },

  // Fetch Featured Products directly from backend
  fetchFeaturedProducts: async () => {
    try {
      const response = await apiClient.get('/user/fetch_featured_products');
      const data = response.data || [];
      if (Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching featured products from backend:', error.message);
      return [];
    }
  },

  // Fetch New Arrivals directly from backend
  fetchNewArrivals: async () => {
    try {
      const response = await apiClient.get('/user/fetch_new_arrivals');
      const data = response.data || [];
      if (Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          image: getImageUrl(item.image_path),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching new arrivals from backend:', error.message);
      return [];
    }
  },

  // Fetch Product Details & Variants directly from backend
  fetchProductDetails: async (productId) => {
    try {
      const response = await apiClient.get(`/user/fetch_variants/${productId}`);
      const data = response.data || {};
      const product = data.product || data;
      const rawVariants = data.variants || product.variants || [];

      if (product && (product.id || product.name)) {
        // Normalize gallery images
        let normalizedImages = [];
        if (Array.isArray(product.images) && product.images.length > 0) {
          normalizedImages = product.images
            .map((img) => {
              const p = typeof img === 'object' ? (img.image_path || img.image) : img;
              return p ? getImageUrl(p) : null;
            })
            .filter(Boolean);
        }
        if (normalizedImages.length === 0 && product.image_path) {
          normalizedImages = [getImageUrl(product.image_path)];
        }

        // Normalize variants
        const variants = Array.isArray(rawVariants)
          ? rawVariants.map((v) => ({
              ...v,
              price: parseFloat(v.price) || 0,
              original_price: parseFloat(v.original_price) || parseFloat(v.price) || 0,
              stock_quantity: parseInt(v.stock_quantity, 10) || 0,
            }))
          : [];

        const defaultPrice = variants.length > 0 ? variants[0].price : parseFloat(product.price) || 0;
        const defaultOriginalPrice = variants.length > 0 ? variants[0].original_price : parseFloat(product.original_price) || defaultPrice;

        return {
          ...product,
          price: defaultPrice,
          original_price: defaultOriginalPrice,
          image: normalizedImages[0] || getImageUrl(product.image_path),
          images: normalizedImages,
          variants,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product details for ${productId}:`, error.message);
      return null;
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

  // Verify payment status / signature with backend
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/user/get_payment_status', paymentData);
      return response.data;
    } catch (error) {
      console.warn('Payment verification notice:', error.response?.data || error.message);
      return { success: false, message: error.message };
    }
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

export const PromoService = {
  validatePromo: async (code, orderAmount = 0) => {
    try {
      const response = await apiClient.post('/user/validate_promo', {
        code: code.trim(),
        order_amount: orderAmount,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired promo code.';
      return { success: false, message: msg };
    }
  },
};

export const NotificationService = {
  fetchNotifications: async () => {
    try {
      const response = await apiClient.get('/user/notifications');
      const data = response.data;
      if (data && data.notifications) {
        return {
          notifications: data.notifications.map((n) => ({
            ...n,
            image_url: getImageUrl(n.image_url),
          })),
          unreadCount: data.unread_count || 0,
        };
      }
      return { notifications: [], unreadCount: 0 };
    } catch (error) {
      console.warn('Error fetching notifications:', error.message);
      return { notifications: [], unreadCount: 0 };
    }
  },

  markAsRead: async (id = null) => {
    try {
      const response = await apiClient.post('/user/notifications/mark_read', { id });
      return response.data;
    } catch (error) {
      console.warn('Error marking notifications as read:', error.message);
      return { success: false };
    }
  },
};


