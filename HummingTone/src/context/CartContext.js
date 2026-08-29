import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSiteContent } from './SiteContentContext';

const CART_STORAGE_KEY = '@hummingtone_cart_v1';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discountPercent, discountAmount }
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
      setCartItems(items);
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  };

  // Add Item to Cart
  const addToCart = (product, selectedVariant = null, quantity = 1) => {
    const cartItemId = `${product.id}-${selectedVariant?.size || 'default'}-${selectedVariant?.color || 'default'}`;
    const existingIndex = cartItems.findIndex((item) => item.cartItemId === cartItemId);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      const maxStock = selectedVariant?.stock || product.stock || 999;
      updatedCart[existingIndex].quantity = Math.min(newQty, maxStock);
    } else {
      const newItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        brand: product.brand || 'ATELIER COLLECTION',
        category: product.category || 'Luxury Collection',
        price: parseFloat(selectedVariant?.price || product.price),
        image: product.image || (product.images && product.images[0]),
        size: selectedVariant?.size || 'Standard',
        color: selectedVariant?.color || '',
        stock: selectedVariant?.stock || product.stock || 999,
        quantity,
      };
      updatedCart = [newItem, ...cartItems];
    }
    saveCart(updatedCart);
  };

  // Update Quantity
  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const updated = cartItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        const maxStock = item.stock || 999;
        return { ...item, quantity: Math.min(newQty, maxStock) };
      }
      return item;
    });
    saveCart(updated);
  };

  // Remove Item
  const removeFromCart = (cartItemId) => {
    const filtered = cartItems.filter((item) => item.cartItemId !== cartItemId);
    saveCart(filtered);
  };

  // Clear Cart
  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
  };

  // Apply Promo Code
  const applyCoupon = (code, discountPercent = 10) => {
    const upperCode = (code || '').trim().toUpperCase();
    if (upperCode === 'HUMMING10' || upperCode === 'WELCOME10') {
      setCoupon({ code: upperCode, discountPercent: 10 });
      return { success: true, message: '10% atelier promo applied!' };
    }
    if (upperCode === 'LUXURY20') {
      setCoupon({ code: upperCode, discountPercent: 20 });
      return { success: true, message: '20% VIP privilege applied!' };
    }
    return { success: false, message: 'Invalid promo code' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round((discountedSubtotal * (gstRate || 5)) / 100);
  const finalTotal = discountedSubtotal + (shippingFee || 0) + gstAmount;

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
