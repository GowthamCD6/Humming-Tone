import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing } from '../theme/typography';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'gold'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon = null,
}) => {
  const getContainerStyle = () => {
    const base = [styles.button, styles[`btn_${size}`]];
    if (variant === 'primary') base.push(styles.btnPrimary);
    if (variant === 'secondary') base.push(styles.btnSecondary);
    if (variant === 'outline') base.push(styles.btnOutline);
    if (variant === 'gold') base.push(styles.btnGold);
    if (disabled) base.push(styles.btnDisabled);
    if (style) base.push(style);
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`text_${size}`]];
    if (variant === 'primary' || variant === 'secondary' || variant === 'gold') {
      base.push(styles.textInverse);
    } else {
      base.push(styles.textPrimary);
    }
    if (disabled) base.push(styles.textDisabled);
    if (textStyle) base.push(textStyle);
    return base;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : colors.textInverse}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btn_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  btn_md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  btn_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.primaryLight,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnGold: {
    backgroundColor: colors.goldMuted,
  },
  btnDisabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  text: {
    fontFamily: typography.fontSans,
    fontWeight: typography.weightBold,
    letterSpacing: typography.spacingWide,
    textTransform: 'uppercase',
  },
  text_sm: {
    fontSize: 11,
  },
  text_md: {
    fontSize: 12.5,
  },
  text_lg: {
    fontSize: 14,
  },
  textInverse: {
    color: colors.textInverse,
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textDisabled: {
    color: colors.textMuted,
  },
});
