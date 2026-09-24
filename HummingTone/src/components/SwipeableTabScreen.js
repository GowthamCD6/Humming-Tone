import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';

const TAB_ROUTES = ['HomeTab', 'ExploreTab', 'CustomizeTab', 'CartTab', 'ProfileTab'];

export const SwipeableTabScreen = ({ routeName, navigation, children, style }) => {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture clear, deliberate horizontal swipes (horizontal movement significantly greater than vertical)
        const isHorizontal =
          Math.abs(gestureState.dx) > 35 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2.2;
        return isHorizontal;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentIndex = TAB_ROUTES.indexOf(routeName);
        if (currentIndex === -1) return;

        // Swipe Left -> Next Tab (Home -> Explore -> Customize -> Cart -> Profile)
        if (gestureState.dx < -45 && (Math.abs(gestureState.vx) > 0.1 || Math.abs(gestureState.dx) > 70)) {
          if (currentIndex < TAB_ROUTES.length - 1) {
            navigation.navigate(TAB_ROUTES[currentIndex + 1]);
          }
        }
        // Swipe Right -> Previous Tab (Profile -> Cart -> Customize -> Explore -> Home)
        else if (gestureState.dx > 45 && (Math.abs(gestureState.vx) > 0.1 || Math.abs(gestureState.dx) > 70)) {
          if (currentIndex > 0) {
            navigation.navigate(TAB_ROUTES[currentIndex - 1]);
          }
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
