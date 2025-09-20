import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { Colors, Sizes } from '../../utils/constants';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase/client';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute();

  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        Alert.alert(
          'Sessão inválida',
          'Link de redefinição de senha inválido ou expirado.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível validar o link de redefinição.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Nova senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      Alert.alert(
        'Senha redefinida!',
        'Sua senha foi alterada com sucesso. Você pode fazer login com a nova senha.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro inesperado ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="h3" align="center">
            Validando link...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h3" color="inverse" align="center">
          Redefinir Senha
        </Typography>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formSection}>
            <Typography variant="body" color="secondary" align="center" style={styles.description}>
              Digite sua nova senha abaixo
            </Typography>

            <View style={styles.form}>
              <Input
                label="Nova senha"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                onClearError={() => clearError('password')}
                placeholder="Nova senha"
                isPassword
                error={errors.password}
              />

              <Input
                label="Confirmar nova senha"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                onClearError={() => clearError('confirmPassword')}
                placeholder="Confirmar nova senha"
                isPassword
                error={errors.confirmPassword}
              />

              <Button
                title="Redefinir Senha"
                onPress={handleResetPassword}
                loading={isLoading}
                size="lg"
                fullWidth
                variant="primary"
                style={styles.submitButton}
              />

              <Button
                title="Voltar ao Login"
                onPress={() => navigation.navigate('Login')}
                size="lg"
                fullWidth
                variant="outline"
                style={styles.backButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
  },
  header: {
    backgroundColor: Colors.vapapp.teal,
    paddingVertical: Sizes.spacing.lg,
    paddingHorizontal: Sizes.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Sizes.spacing.xl,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    marginBottom: Sizes.spacing.xl,
  },
  form: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius['2xl'],
    padding: Sizes.spacing.xl,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButton: {
    marginTop: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.md,
  },
  backButton: {
    marginTop: Sizes.spacing.sm,
  },
});