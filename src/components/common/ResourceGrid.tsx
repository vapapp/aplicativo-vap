import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionButton } from './ActionButton';
import { Sizes } from '../../utils/constants';

interface ResourceItem {
  title: string;
  iconName: any;
  onPress: () => void;
}

interface ResourceGridProps {
  resources: ResourceItem[];
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({ resources }) => {
  const renderRow = (items: ResourceItem[], startIndex: number) => (
    <View key={startIndex} style={styles.row}>
      {items.map((item, index) => (
        <ActionButton
          key={startIndex + index}
          title={item.title}
          iconName={item.iconName}
          onPress={item.onPress}
        />
      ))}
    </View>
  );

  const rows = [];
  for (let i = 0; i < resources.length; i += 2) {
    const rowItems = resources.slice(i, i + 2);
    rows.push(renderRow(rowItems, i));
  }

  return <View>{rows}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
    marginBottom: Sizes.spacing.md,
  },
});