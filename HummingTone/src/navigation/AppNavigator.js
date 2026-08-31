import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators & Screens
import { BottomTabNavigator } from './BottomTabNavigator';
import { CategoryProductsScreen } from '../screens/CategoryProductsScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/OrderSuccessScreen';
import { PaymentFailureScreen } from '../screens/PaymentFailureScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { ReturnRequestScreen } from '../screens/ReturnRequestScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { SplashScreen } from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="PaymentFailure"
          component={PaymentFailureScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

