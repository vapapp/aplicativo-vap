import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Typography } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { Colors, Sizes } from '../utils/constants';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          Bem-vindo!
        </Typography>

        <View style={styles.userInfo}>
          <Typography variant="subtitle" color="secondary" align="center">
            Usuário logado:
          </Typography>
          <Typography variant="body" align="center" style={styles.email}>
            {user?.email}
          </Typography>
        </View>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.xl,
    paddingTop: Sizes.spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Sizes.spacing['3xl'],
    color: Colors.vapapp.teal,
  },
  userInfo: {
    marginBottom: Sizes.spacing['3xl'],
    padding: Sizes.spacing.xl,
    backgroundColor: Colors.background.secondary,
    borderRadius: Sizes.radius.lg,
    width: '100%',
  },
  email: {
    marginTop: Sizes.spacing.sm,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: Sizes.spacing.lg,
  },
});