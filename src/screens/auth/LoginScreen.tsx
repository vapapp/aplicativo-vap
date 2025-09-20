import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { Colors, Sizes } from '../../utils/constants';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../stores/authStore';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      if (data?.user) {
        // Buscar dados completos do usuário
        const { data: userData } = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          Alert.alert('Sucesso', 'Login realizado com sucesso!');
          // TODO: Navegar para tela principal
        }
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h3" color="inverse" align="center">
          Bem-vindo
        </Typography>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Typography variant="h4" color="primary" align="center" style={styles.title}>
              Fazer login
            </Typography>

            <View style={styles.form}>
              <Input
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                onClearError={() => clearError('email')}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                onClearError={() => clearError('password')}
                placeholder="Senha"
                isPassword
                error={errors.password}
              />

              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Typography color="primary" style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Typography>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <Button
                  title="Entrar"
                  onPress={handleLogin}
                  loading={isLoading}
                  size="lg"
                  fullWidth
                  variant="secondary"
                  style={styles.loginButton}
                />

                <Button
                  title="Voltar"
                  onPress={handleGoBack}
                  size="lg"
                  fullWidth
                  variant="primary"
                  style={styles.backButton}
                />
              </View>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: Sizes.spacing['2xl'],
    marginTop: Sizes.spacing.xl,
  },
  logoContainer: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.vapapp.white,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    marginTop: Sizes.spacing.lg,
  },
  title: {
    marginBottom: Sizes.spacing.xl,
    color: Colors.vapapp.teal,
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
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: Sizes.spacing.xl,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  buttonContainer: {
    gap: Sizes.spacing.md,
  },
  loginButton: {
    marginBottom: Sizes.spacing.sm,
  },
  backButton: {
    marginTop: Sizes.spacing.sm,
  },
});