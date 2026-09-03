import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSiteContent } from './SiteContentContext';
import { PromoService } from '../api/services';

const CART_STORAGE_KEY = '@hummingtone_cart_v1';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { id, code, discount_type, discount_value, discount_amount, label }
  const [loading, setLoading] = useState(true);
  const { shippingFee = 0, gstRate = 5 } = useSiteContent() || {};

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load cart from storage', e);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart whenever items change
  const saveCart = async (items) => {
    try {
      const safeItems = Array.isArray(items) ? items : [];
      setCartItems(safeItems);
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(safeItems));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  };

  // Add Item to Cart (Flexible parameter support)
  const addToCart = (product, selectedVariantOrSize = null, quantity = 1, extraVariant = null) => {
    if (!product) return;

    let size = 'Standard';
    let color = product.color || 'Default';
    let price = parseFloat(product.price || 0);
    let stock = product.stock || product.stock_quantity || 999;
    let actualQty = 1;

    // Handle flexible signatures: (product, 'M', 1), (product, variantObj, 1), or (product, 'M', 1, variantObj)
    if (typeof selectedVariantOrSize === 'object' && selectedVariantOrSize !== null) {
      size = selectedVariantOrSize.size || product.size || 'Standard';
      color = selectedVariantOrSize.color || product.color || 'Default';
      if (selectedVariantOrSize.price != null) price = parseFloat(selectedVariantOrSize.price);
      if (selectedVariantOrSize.stock_quantity != null) stock = selectedVariantOrSize.stock_quantity;
      if (selectedVariantOrSize.stock != null) stock = selectedVariantOrSize.stock;
      if (typeof quantity === 'number') actualQty = quantity;
    } else if (typeof selectedVariantOrSize === 'string') {
      size = selectedVariantOrSize;
      if (typeof quantity === 'number') actualQty = quantity;
      if (extraVariant && typeof extraVariant === 'object') {
        if (extraVariant.color) color = extraVariant.color;
        if (extraVariant.price != null) price = parseFloat(extraVariant.price);
        if (extraVariant.stock_quantity != null) stock = extraVariant.stock_quantity;
        if (extraVariant.stock != null) stock = extraVariant.stock;
      }
    } else if (typeof selectedVariantOrSize === 'number') {
      actualQty = selectedVariantOrSize;
    }

    const cartItemId = `${product.id}-${String(size).trim()}-${String(color).trim()}`;
    const existingIndex = cartItems.findIndex((item) => {
      if (item.cartItemId && item.cartItemId === cartItemId) return true;
      if (item.id === product.id && String(item.size).trim().toLowerCase() === String(size).trim().toLowerCase()) return true;
      return false;
    });

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      const newQty = (Number(updatedCart[existingIndex].quantity) || 1) + Number(actualQty || 1);
      updatedCart[existingIndex].quantity = Math.min(newQty, stock);
      updatedCart[existingIndex].cartItemId = cartItemId;
      updatedCart[existingIndex].size = size;
      updatedCart[existingIndex].color = color;
      updatedCart[existingIndex].price = price;
      updatedCart[existingIndex].stock = stock;
    } else {
      const newItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        brand: product.brand || 'ATELIER COLLECTION',
        category: product.category || 'Luxury Collection',
        price,
        image: product.image || (product.images && (product.images[0]?.image_path || product.images[0])) || null,
        size,
        color,
        stock,
        quantity: Math.max(1, Number(actualQty || 1)),
      };
      updatedCart = [newItem, ...cartItems];
    }
    saveCart(updatedCart);
  };

  // Update Quantity
  const updateQuantity = (cartItemIdOrKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemIdOrKey);
      return;
    }
    const updated = cartItems.map((item) => {
      const isMatch = item.cartItemId === cartItemIdOrKey ||
                      String(item.id) === String(cartItemIdOrKey) ||
                      `${item.id}-${item.size || 'std'}` === cartItemIdOrKey ||
                      `${item.id}-${item.size || 'Standard'}-${item.color || 'Default'}` === cartItemIdOrKey ||
                      `${item.id}-${item.size || ''}-${item.color || ''}` === cartItemIdOrKey;
      if (isMatch) {
        const maxStock = item.stock || item.stock_quantity || 999;
        return { ...item, quantity: Math.min(newQty, maxStock) };
      }
      return item;
    });
    saveCart(updated);
  };

  // Remove Item
  const removeFromCart = (cartItemIdOrKey) => {
    const filtered = cartItems.filter((item) => {
      const isMatch = item.cartItemId === cartItemIdOrKey ||
                      String(item.id) === String(cartItemIdOrKey) ||
                      `${item.id}-${item.size || 'std'}` === cartItemIdOrKey ||
                      `${item.id}-${item.size || 'Standard'}-${item.color || 'Default'}` === cartItemIdOrKey ||
                      `${item.id}-${item.size || ''}-${item.color || ''}` === cartItemIdOrKey;
      return !isMatch;
    });
    saveCart(filtered);
  };

  // Clear Cart
  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
  };

  // Current subtotal before discount
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

  // Apply Promo Code via Backend API
  const applyCoupon = async (code) => {
    const upperCode = (code || '').trim().toUpperCase();
    if (!upperCode) {
      return { success: false, message: 'Please enter a promo code.' };
    }

    try {
      // 1. Fetch validation from real backend API
      const res = await PromoService.validatePromo(upperCode, subtotal);
      if (res && res.success && res.promo) {
        const p = res.promo;
        setCoupon({
          id: p.id,
          code: p.code,
          discount_type: p.discount_type || 'percentage',
          discount_value: Number(p.discount_value),
          discount_amount: p.discount_amount,
          label: p.discount_type === 'fixed'
            ? `₹${p.discount_value} Flat Discount`
            : `${p.discount_value}% Privilege Discount`,
        });
        return { success: true, message: res.message || '🎉 Promo code applied successfully!' };
      } else if (res && res.message) {
        return { success: false, message: res.message };
      }
    } catch (e) {
      console.warn('Backend promo validation error:', e);
      return { success: false, message: 'Unable to validate promo code. Please try again.' };
    }

    return { success: false, message: 'Invalid or expired promo code.' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(Number(coupon.discount_value || coupon.discount_amount || 0), subtotal);
    } else {
      discountAmount = Math.round((subtotal * Number(coupon.discount_value || 0)) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round((discountedSubtotal * (gstRate || 5)) / 100);
  const finalTotal = discountedSubtotal + (shippingFee || 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discountAmount,
        discountedSubtotal,
        gstAmount,
        shippingFee,
        gstRate,
        finalTotal,
        coupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
