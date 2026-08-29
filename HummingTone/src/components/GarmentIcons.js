import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from './Icons';

export const GarmentIcon = ({ type, color = '#704F38', size = 26 }) => {
  const iconKey = type?.toLowerCase() || '';

  if (iconKey.includes('men') || iconKey.includes('shirt') || iconKey.includes('tee')) {
    return <Ionicons name="shirt" size={size} color={color} />;
  }

  if (iconKey.includes('women') || iconKey.includes('dress') || iconKey.includes('gown')) {
    return <Ionicons name="woman" size={size} color={color} />;
  }

  if (iconKey.includes('child') || iconKey.includes('kid') || iconKey.includes('pant')) {
    return <Ionicons name="happy" size={size} color={color} />;
  }

  if (iconKey.includes('baby') || iconKey.includes('infant')) {
    return <Ionicons name="heart" size={size} color={color} />;
  }

  if (iconKey.includes('sport') || iconKey.includes('active') || iconKey.includes('jacket')) {
    return <Ionicons name="fitness" size={size} color={color} />;
  }

  if (iconKey.includes('custom') || iconKey.includes('bespoke') || iconKey.includes('studio')) {
    return <Ionicons name="color-palette" size={size} color={color} />;
  }

  return <Ionicons name="sparkles" size={size} color={color} />;
};
