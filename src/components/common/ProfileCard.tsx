import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { Colors, Sizes } from '../../utils/constants';
import { User } from '../../types/user.types';

interface ProfileCardProps {
  user: User | null;
  onEditPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditPress }) => {
  // Extrair apenas o primeiro nome
  const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return 'Usuário';
    return fullName.trim().split(' ')[0];
  };

  const firstName = getFirstName(user?.name || user?.email?.split('@')[0]);

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={32} color={Colors.vapapp.teal} />
            )}
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.profileInfo}>
          <Typography variant="subtitle" style={styles.userName}>
            {firstName}
          </Typography>
          <View style={styles.profileBadge}>
            <Typography variant="caption" style={styles.profileText}>
              {user?.profile || 'cuidador'}
            </Typography>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Typography variant="caption" style={styles.statusText}>
              Online
            </Typography>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Ionicons name="create-outline" size={22} color={Colors.vapapp.teal} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Nível</Typography>
          <Typography variant="subtitle" style={styles.statValue}>
            {user?.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : 'Iniciante'}
          </Typography>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Pontos</Typography>
          <Typography variant="subtitle" style={styles.statValue}>
            {user?.points || 0}
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.xl,
    padding: Sizes.spacing.xl,
    marginBottom: Sizes.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.vapapp.teal,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Sizes.spacing.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.vapapp.teal,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: Sizes.spacing.xs,
    fontWeight: '700',
    color: Colors.neutral[800],
    fontSize: 18,
  },
  profileBadge: {
    backgroundColor: Colors.vapapp.lightGreen,
    paddingHorizontal: Sizes.spacing.md,
    paddingVertical: Sizes.spacing.xs,
    borderRadius: Sizes.radius.full,
    alignSelf: 'flex-start',
    marginBottom: Sizes.spacing.xs,
  },
  profileText: {
    color: Colors.neutral[700],
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: Colors.primary[50],
    padding: Sizes.spacing.md,
    borderRadius: Sizes.radius.full,
    borderWidth: 1,
    borderColor: Colors.vapapp.teal,
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[50],
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: Colors.neutral[500],
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    color: Colors.vapapp.teal,
    fontWeight: '700',
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Sizes.spacing.md,
  },
});