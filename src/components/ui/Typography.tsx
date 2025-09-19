import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography as TypographyConstants } from '../../utils/constants';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'subtitle';
  color?: keyof typeof Colors.text;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof TypographyConstants.fontWeight;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    { color: Colors.text[color] },
    { textAlign: align },
    weight && { fontWeight: TypographyConstants.fontWeight[weight] },
    style,
  ];

  return <Text style={textStyle}>{children}</Text>;
};

const styles = StyleSheet.create({
  base: {
    fontFamily: TypographyConstants.fontFamily.regular,
  },
  h1: {
    fontSize: TypographyConstants.fontSize['4xl'],
    fontWeight: TypographyConstants.fontWeight.bold,
    lineHeight: TypographyConstants.lineHeight['4xl'],
  },
  h2: {
    fontSize: TypographyConstants.fontSize['3xl'],
    fontWeight: TypographyConstants.fontWeight.bold,
    lineHeight: TypographyConstants.lineHeight['3xl'],
  },
  h3: {
    fontSize: TypographyConstants.fontSize['2xl'],
    fontWeight: TypographyConstants.fontWeight.semibold,
    lineHeight: TypographyConstants.lineHeight['2xl'],
  },
  h4: {
    fontSize: TypographyConstants.fontSize.xl,
    fontWeight: TypographyConstants.fontWeight.semibold,
    lineHeight: TypographyConstants.lineHeight.xl,
  },
  subtitle: {
    fontSize: TypographyConstants.fontSize.lg,
    fontWeight: TypographyConstants.fontWeight.medium,
    lineHeight: TypographyConstants.lineHeight.lg,
  },
  body: {
    fontSize: TypographyConstants.fontSize.base,
    lineHeight: TypographyConstants.lineHeight.base,
  },
  caption: {
    fontSize: TypographyConstants.fontSize.sm,
    lineHeight: TypographyConstants.lineHeight.sm,
  },
});