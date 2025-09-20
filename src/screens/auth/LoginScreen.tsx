import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { Colors, Sizes } from '../../utils/constants';
import { RootStackParamList } from '../../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementar login com API
      console.log('Login:', formData);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login');
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

      <View style={styles.content}>
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
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Senha"
              isPassword
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
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Sizes.spacing['2xl'],
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