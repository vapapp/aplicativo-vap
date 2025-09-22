import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { WelcomeScreen, LoginScreen, SignUpScreen, ForgotPasswordScreen, ResetPasswordScreen } from '../screens/auth';
import { HomeScreen, EditProfileScreen, EmailUpdatedScreen, TraqueostomiaScreen } from '../screens';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth';
import { Colors } from '../utils/constants';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Home: undefined;
  EditProfile: undefined;
  EmailUpdated: undefined;
  Traqueostomia: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, updateUser } = useAuthStore();

  useEffect(() => {
    checkAuth();

    // Listener para mudanças de autenticação (incluindo confirmação de email)
    let lastEmailSeen = '';
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      console.log('=== AUTH EVENT ===', event, session?.user?.email);

      if (event === 'USER_UPDATED' && session?.user?.email) {
        const currentEmail = session.user.email;

        // Só processar se o email realmente mudou
        if (currentEmail !== lastEmailSeen && lastEmailSeen !== '') {
          console.log('=== EMAIL CONFIRMADO ===', {
            antigo: lastEmailSeen,
            novo: currentEmail
          });

          // Aguardar para garantir que o trigger do Supabase processou
          setTimeout(async () => {
            const { data: updatedUser } = await authService.getCurrentUser();
            if (updatedUser) {
              console.log('=== ATUALIZANDO USUÁRIO APÓS CONFIRMAÇÃO ===', updatedUser);
              updateUser(updatedUser);

              Alert.alert(
                'E-mail confirmado! ✅',
                `Seu e-mail foi atualizado com sucesso para: ${currentEmail}`,
                [{ text: 'OK' }]
              );
            }
          }, 3000); // Aguardar mais tempo para o trigger processar
        }

        lastEmailSeen = currentEmail;
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkAuth, updateUser]);

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  const linking = {
    prefixes: ['vapapp://', 'exp://', 'exps://'],
    config: {
      screens: {
        ResetPassword: 'reset-password',
        EmailUpdated: 'email-updated',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.neutral[50] },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="EmailUpdated" component={EmailUpdatedScreen} />
            <Stack.Screen name="Traqueostomia" component={TraqueostomiaScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};