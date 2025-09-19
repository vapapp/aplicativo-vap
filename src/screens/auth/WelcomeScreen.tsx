import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Button, Typography } from '../../components/ui';
import { Colors, Sizes } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const handleLogin = (): void => {
    // TODO: Navegar para tela de login
    console.log('Navegando para login');
  };

  const handleSignUp = (): void => {
    // TODO: Navegar para tela de cadastro
    console.log('Navegando para cadastro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* TODO: Adicionar logo real */}
            <View style={styles.logoPlaceholder}>
              <Typography variant="h2" color="inverse" weight="bold">
                VAP
              </Typography>
              <Typography variant="caption" color="inverse">
                VIA AÉREA PEDIÁTRICA
              </Typography>
            </View>
          </View>
          
          <Typography variant="h2" color="inverse" align="center" style={styles.title}>
            VAP - Via Aérea Pediátrica
          </Typography>
          
          <Typography variant="body" color="inverse" align="center" style={styles.subtitle}>
            Vamos começar sua jornada para uma saúde melhor.
          </Typography>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <View style={styles.card}>
            <Typography variant="subtitle" align="center" style={styles.cardTitle}>
              Já possui uma conta?
            </Typography>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Fazer login"
                onPress={handleLogin}
                variant="primary"
                size="lg"
                fullWidth
              />
              
              <Button
                title="Criar conta"
                onPress={handleSignUp}
                variant="secondary"
                size="lg"
                fullWidth
                style={styles.secondaryButton}
              />
            </View>
            
            <Typography variant="caption" color="secondary" align="center" style={styles.terms}>
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </Typography>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.spacing.lg,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.1,
  },
  logoContainer: {
    marginBottom: Sizes.spacing.xl,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.vapapp.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: Sizes.spacing.md,
    paddingHorizontal: Sizes.spacing.lg,
  },
  subtitle: {
    opacity: 0.9,
    paddingHorizontal: Sizes.spacing.xl,
  },
  actionSection: {
    paddingBottom: Sizes.spacing.xl,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: Sizes.radius['2xl'],
    padding: Sizes.spacing.xl,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    marginBottom: Sizes.spacing.xl,
    color: Colors.vapapp.teal,
  },
  buttonContainer: {
    gap: Sizes.spacing.md,
    marginBottom: Sizes.spacing.lg,
  },
  secondaryButton: {
    marginTop: Sizes.spacing.sm,
  },
  terms: {
    lineHeight: 18,
    paddingHorizontal: Sizes.spacing.sm,
  },
});