import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Colors, Sizes } from '../../utils/constants';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  sectionTitle: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  sectionTitle,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="caption" style={styles.stepText}>
          Seção {currentStep} de {totalSteps}
        </Typography>
        <Typography variant="caption" style={styles.progressText}>
          {Math.round(progress)}% concluído
        </Typography>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%` }
          ]}
        />
      </View>

      <Typography variant="subtitle" style={styles.sectionTitle}>
        {sectionTitle}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[0],
    padding: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.spacing.sm,
  },
  stepText: {
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  progressText: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    marginBottom: Sizes.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.vapapp.teal,
    borderRadius: 3,
  },
  sectionTitle: {
    color: Colors.neutral[800],
    fontWeight: '600',
    textAlign: 'center',
  },
});