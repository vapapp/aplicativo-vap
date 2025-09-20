import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { ProfileSelector } from '../../components/forms/ProfileSelector';
import { AddressForm } from '../../components/forms/AddressForm';
import { Colors, Sizes } from '../../utils/constants';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/auth';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profile: string;
  address: {
    cep: string;
    street: string;
    neighborhood: string;
    number: string;
    complement: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
  };
  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profile: '',
    address: {
      cep: '',
      street: '',
      neighborhood: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      latitude: '',
      longitude: '',
    },
    acceptTerms: false,
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Celular é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem!';
    }

    if (!formData.profile) {
      newErrors.profile = 'Selecione um perfil';
    }

    if (!formData.address.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Endereço é obrigatório';
    }

    if (!formData.address.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.address.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    try {
      const signUpData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.phone,
        profile: formData.profile as 'mae' | 'pai' | 'cuidador',
        address: formData.address,
      };

      const { data, error } = await authService.signUp(signUpData);

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      Alert.alert(
        'Cadastro realizado!', 
        'Sua conta foi criada com sucesso. Agora você pode fazer login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Erro', 'Erro inesperado ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.neutral[0]} />
        </TouchableOpacity>
        <Typography variant="h4" color="inverse">
          Cadastro de usuário
        </Typography>
        <View style={styles.placeholder} />
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
          <View style={styles.section}>
            <Typography variant="subtitle" style={styles.sectionTitle}>
              Dados pessoais
            </Typography>

            <Input
              label="Nome completo"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              onClearError={() => clearError('fullName')}
              placeholder="Nome completo"
              error={errors.fullName}
              rightIcon="person"
            />

            <Input
              label="E-mail"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onClearError={() => clearError('email')}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              rightIcon="email"
            />

            <Input
              label="Celular"
              value={formData.phone}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                phone: formatPhone(text) 
              })}
              onClearError={() => clearError('phone')}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={15}
              error={errors.phone}
              rightIcon="phone"
            />

            <Input
              label="Senha"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              onClearError={() => clearError('password')}
              placeholder="Senha"
              isPassword
              error={errors.password}
            />

            <Input
              label="Confirmar senha"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              onClearError={() => clearError('confirmPassword')}
              placeholder="Confirmar senha"
              isPassword
              error={errors.confirmPassword}
            />

            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <View style={styles.validationMessage}>
                <Icon name="close" size={16} color={Colors.error} />
                <Text style={styles.errorText}>As senhas não correspondem!</Text>
              </View>
            )}
            
            <View style={styles.validationMessage}>
              <Icon name="lock" size={16} color={Colors.text.secondary} />
              <Text style={styles.successText}>
                Comprimento mínimo de 6 caracteres, contendo letras maiúsculas, minúsculas e dígitos
              </Text>
            </View>
          </View>

          <ProfileSelector
            selectedProfile={formData.profile}
            onProfileSelect={(profile) => setFormData({ ...formData, profile })}
            error={errors.profile}
          />

          <AddressForm
            addressData={formData.address}
            onAddressChange={(address) => setFormData({ ...formData, address })}
            errors={errors}
            onClearError={clearError}
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ 
                ...formData, 
                acceptTerms: !formData.acceptTerms 
              })}
            >
              <View style={[
                styles.checkboxBox,
                formData.acceptTerms && styles.checkboxChecked
              ]}>
                {formData.acceptTerms && (
                  <Icon name="check" size={14} color={Colors.neutral[0]} />
                )}
              </View>
              <Text style={styles.termsText}>
                Ao continuar, você concorda com nossos{' '}
                <Text style={styles.termsLink}>"termos de uso e política de privacidade"</Text>.
              </Text>
            </TouchableOpacity>
            {errors.acceptTerms && (
              <Text style={styles.termsError}>{errors.acceptTerms}</Text>
            )}
          </View>

          <Button
            title="Cadastrar"
            onPress={handleSubmit}
            loading={isLoading}
            size="lg"
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.vapapp.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
  },
  backButton: {
    padding: Sizes.spacing.sm,
  },
  placeholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.lg,
    paddingTop: Sizes.spacing.lg,
  },
  scrollContent: {
    paddingBottom: Sizes.spacing.xl,
  },
  section: {
    marginBottom: Sizes.spacing.lg,
  },
  sectionTitle: {
    color: Colors.vapapp.teal,
    marginBottom: Sizes.spacing.lg,
    textAlign: 'center',
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.sm,
    paddingHorizontal: Sizes.spacing.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    flex: 1,
    marginLeft: Sizes.spacing.sm,
  },
  successText: {
    color: Colors.text.secondary,
    fontSize: 12,
    flex: 1,
    marginLeft: Sizes.spacing.sm,
  },
  termsContainer: {
    marginBottom: Sizes.spacing.xl,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderRadius: 4,
    marginRight: Sizes.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.vapapp.teal,
    borderColor: Colors.vapapp.teal,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.vapapp.teal,
    textDecorationLine: 'underline',
  },
  termsError: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Sizes.spacing.xs,
  },
  submitButton: {
    marginBottom: Sizes.spacing.xl,
  },
});