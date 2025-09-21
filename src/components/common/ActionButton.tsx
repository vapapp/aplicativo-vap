import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface ActionButtonProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: any;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  iconName,
  onPress,
  style
}) => {
  return (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <Ionicons name={iconName} size={24} color={Colors.neutral[700]} />
      <Typography variant="caption" style={styles.buttonText}>
        {title}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: '#B2DFDB',
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    flex: 1,
  },
  buttonText: {
    marginTop: Sizes.spacing.xs,
    textAlign: 'center',
    fontWeight: '500',
    color: Colors.neutral[700],
  },
});