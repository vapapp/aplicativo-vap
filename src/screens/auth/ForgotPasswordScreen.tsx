import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { Colors, Sizes } from '../../utils/constants';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu e-mail');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erro', 'Digite um e-mail válido');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementar recuperação de senha com API
      console.log('Recuperar senha para:', email);
      Alert.alert(
        'E-mail enviado!', 
        'Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar e-mail de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.neutral[0]} />
        </TouchableOpacity>
        <Typography variant="h4" color="inverse">
          Recuperar senha
        </Typography>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Typography variant="h4" color="primary" align="center" style={styles.title}>
            Digite seu e-mail para redefinir sua senha
          </Typography>

          <Typography variant="body" color="secondary" align="center" style={styles.description}>
            Enviaremos, no e-mail informado, um link para redefinir sua senha.
          </Typography>

          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            rightIcon="email"
            style={styles.input}
          />

          <Button
            title="Enviar e-mail"
            onPress={handleSendEmail}
            loading={isLoading}
            size="lg"
            fullWidth
            variant="primary"
            style={styles.sendButton}
          />
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Typography variant="h4" color="primary" align="center" style={styles.helpTitle}>
            Precisa de Ajuda?
          </Typography>

          <Typography variant="body" color="secondary" align="center" style={styles.helpDescription}>
            Se você não receber o e-mail em alguns minutos:
          </Typography>

          <View style={styles.helpList}>
            <View style={styles.helpItem}>
              <Icon name="check-circle" size={20} color={Colors.vapapp.lightGreen} />
              <Typography variant="body" color="secondary" style={styles.helpText}>
                Verifique sua pasta de spam;
              </Typography>
            </View>

            <View style={styles.helpItem}>
              <Icon name="check-circle" size={20} color={Colors.vapapp.lightGreen} />
              <Typography variant="body" color="secondary" style={styles.helpText}>
                Confirme se digitou o e-mail corretamente;
              </Typography>
            </View>

            <View style={styles.helpItem}>
              <Icon name="check-circle" size={20} color={Colors.vapapp.lightGreen} />
              <Typography variant="body" color="secondary" style={styles.helpText}>
                Tente novamente em alguns minutos.
              </Typography>
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
  content: {
    flex: 1,
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.xl,
    gap: Sizes.spacing.lg,
  },
  mainCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius['2xl'],
    padding: Sizes.spacing.xl,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    marginBottom: Sizes.spacing.lg,
    color: Colors.vapapp.teal,
    lineHeight: 28,
  },
  description: {
    marginBottom: Sizes.spacing.xl,
    lineHeight: 22,
  },
  input: {
    marginBottom: Sizes.spacing.lg,
  },
  sendButton: {
    marginTop: Sizes.spacing.sm,
  },
  helpCard: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius['2xl'],
    padding: Sizes.spacing.xl,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  helpTitle: {
    marginBottom: Sizes.spacing.md,
    color: Colors.vapapp.teal,
  },
  helpDescription: {
    marginBottom: Sizes.spacing.lg,
    lineHeight: 22,
  },
  helpList: {
    gap: Sizes.spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Sizes.spacing.sm,
  },
  helpText: {
    flex: 1,
    lineHeight: 20,
  },
});