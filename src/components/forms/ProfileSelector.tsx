// src/components/forms/ProfileSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Sizes } from '../../utils/constants';

interface ProfileSelectorProps {
  selectedProfile: string;
  onProfileSelect: (profile: string) => void;
  error?: string;
}

const profiles = [
  { id: 'mae', label: 'Mãe' },
  { id: 'pai', label: 'Pai' },
  { id: 'cuidador', label: 'Cuidador' },
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  selectedProfile,
  onProfileSelect,
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione o seu perfil</Text>
      {error && <Text style={styles.required}>Campo obrigatório</Text>}
      
      <View style={styles.profileContainer}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={[
              styles.profileButton,
              selectedProfile === profile.id && styles.profileButtonSelected,
            ]}
            onPress={() => onProfileSelect(profile.id)}
          >
            <Text
              style={[
                styles.profileText,
                selectedProfile === profile.id && styles.profileTextSelected,
              ]}
            >
              {profile.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.vapapp.teal,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
  },
  required: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Sizes.spacing.sm,
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Sizes.spacing.sm,
  },
  profileButton: {
    flex: 1,
    paddingVertical: Sizes.spacing.md,
    paddingHorizontal: Sizes.spacing.sm,
    borderRadius: Sizes.radius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.neutral[0],
    alignItems: 'center',
  },
  profileButtonSelected: {
    borderColor: Colors.vapapp.lightGreen,
    backgroundColor: Colors.vapapp.lightGreen,
  },
  profileText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  profileTextSelected: {
    color: Colors.neutral[0],
    fontWeight: Typography.fontWeight.semibold,
  },
});