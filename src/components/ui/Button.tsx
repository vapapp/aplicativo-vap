import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors, Typography, Sizes } from '../../utils/constants';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? Colors.vapapp.teal : Colors.neutral[0]} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Sizes.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Sizes.spacing.lg,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.vapapp.teal,
  },
  secondary: {
    backgroundColor: Colors.vapapp.blue,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.vapapp.teal,
  },
  
  // Sizes
  sm: {
    height: Sizes.button.sm,
    paddingHorizontal: Sizes.spacing.md,
  },
  md: {
    height: Sizes.button.md,
  },
  lg: {
    height: Sizes.button.lg,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryText: {
    color: Colors.text.onPrimary,
    fontSize: Typography.fontSize.base,
  },
  secondaryText: {
    color: Colors.text.onPrimary,
    fontSize: Typography.fontSize.base,
  },
  outlineText: {
    color: Colors.vapapp.teal,
    fontSize: Typography.fontSize.base,
  },
  
  // Size text
  smText: {
    fontSize: Typography.fontSize.sm,
  },
  mdText: {
    fontSize: Typography.fontSize.base,
  },
  lgText: {
    fontSize: Typography.fontSize.lg,
  },
});