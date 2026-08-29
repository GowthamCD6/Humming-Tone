import { Platform } from 'react-native';

export const typography = {
  // Font Families
  fontSerif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  fontSans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  fontSansMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
  
  // Font Sizes
  sizeHero: 32,
  sizeH1: 26,
  sizeH2: 22,
  sizeH3: 18,
  sizeSubhead: 16,
  sizeBody: 14,
  sizeCaption: 12,
  sizeMicro: 10,
  
  // Font Weights
  weightLight: '300',
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  
  // Letter Spacing
  spacingTight: -0.5,
  spacingNormal: 0,
  spacingWide: 1.2,
  spacingWidest: 2.5,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 16,
};
