import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from './Icons';
import { colors } from '../theme/colors';

export const StarRating = ({ rating = 5, size = 14, maxStars = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starNumber = index + 1;
        let iconName = 'star';
        if (rating >= starNumber) {
          iconName = 'star';
        } else if (rating >= starNumber - 0.5) {
          iconName = 'star-half';
        } else {
          iconName = 'star-outline';
        }

        return (
          <Ionicons
            key={index}
            name={iconName}
            size={size}
            color={colors.gold}
            style={styles.star}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
