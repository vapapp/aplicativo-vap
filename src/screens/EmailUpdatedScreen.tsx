import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth';
import { Colors, Sizes } from '../utils/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';

type EmailUpdatedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmailUpdated'>;

export const EmailUpdatedScreen: React.FC = () => {
  const { updateUser } = useAuthStore();
  const navigation = useNavigation<EmailUpdatedScreenNavigationProp>();

  useEffect(() => {
    const refreshUserData = async () => {
      console.log('=== EMAIL CONFIRMADO - ATUALIZANDO DADOS ===');

      // Aguardar um pouco para garantir que o Supabase processou a mudança
      setTimeout(async () => {
        const { data: updatedUser } = await authService.getCurrentUser();
        if (updatedUser) {
          console.log('=== DADOS ATUALIZADOS ===', updatedUser);
          updateUser(updatedUser);
        }
      }, 2000);
    };

    refreshUserData();
  }, [updateUser]);

  const handleContinue = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        </View>

        {/* Title */}
        <Typography variant="h2" style={styles.title}>
          E-mail Confirmado!
        </Typography>

        {/* Message */}
        <Typography variant="body" style={styles.message}>
          Seu novo endereço de e-mail foi confirmado e atualizado com sucesso.
          Agora você pode usar o novo e-mail para fazer login.
        </Typography>

        {/* Continue Button */}
        <Button
          title="Continuar"
          onPress={handleContinue}
          fullWidth
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    padding: Sizes.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: Sizes.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Sizes.spacing.lg,
    color: Colors.neutral[800],
  },
  message: {
    textAlign: 'center',
    marginBottom: Sizes.spacing.xxl,
    color: Colors.neutral[600],
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: Colors.vapapp.teal,
  },
});