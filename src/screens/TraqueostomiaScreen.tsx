import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TraqueostomiaCalculator } from '../components/calculators';
import { Header } from '../components/common';
import { Colors } from '../utils/constants';

export const TraqueostomiaScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header title="Calculadora de Cânulas" showBackButton />
      <TraqueostomiaCalculator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});