import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_STORAGE_KEY = '@hummingtone_wishlist_v1';
const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Wishlist from Storage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue);
          if (Array.isArray(parsed)) {
            setWishlistItems(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to load wishlist from storage', e);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  // Save to Storage
  const saveWishlist = async (items) => {
    try {
      setWishlistItems(items);
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save wishlist to storage', e);
    }
  };

  // Toggle item in Wishlist
  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    let updated;
    if (exists) {
      updated = wishlistItems.filter((item) => item.id !== product.id);
    } else {
      updated = [
        {
          id: product.id,
          name: product.name,
          brand: product.brand || 'ATELIER COLLECTION',
          category: product.category || 'Luxury Collection',
          price: parseFloat(product.price) || 0,
          image: product.image || (product.images && product.images[0]),
          gender: product.gender,
          rating: product.rating || 5,
        },
        ...wishlistItems,
      ];
    }
    saveWishlist(updated);
  };

  // Check if item is in Wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Remove single item
  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter((item) => item.id !== productId);
    saveWishlist(updated);
  };

  // Clear Wishlist
  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
