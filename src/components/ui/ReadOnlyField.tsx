import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Colors, Sizes } from '../../utils/constants';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon?: string;
}

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
}) => {
  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      <Typography variant="body" style={styles.value}>
        {value || '-'}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.spacing.lg,
  },
  label: {
    color: Colors.neutral[700],
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
    marginLeft: 4,
  },
  value: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Sizes.radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
    color: Colors.neutral[800],
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'center',
  },
});