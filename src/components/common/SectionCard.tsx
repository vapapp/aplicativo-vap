import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Typography variant="subtitle" style={styles.cardTitle}>
        {title}
      </Typography>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: Sizes.spacing.md,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
});