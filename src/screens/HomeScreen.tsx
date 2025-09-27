import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Typography } from '../components/ui';
import { ProfileCard, SectionCard, ActionButton, ResourceGrid } from '../components/common';
import { useAuthStore } from '../stores/authStore';
import { Colors, Sizes } from '../utils/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer logout. Tente novamente.');
    }
  };

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case 'Assistente vap':
        navigation.navigate('VAPAssistant');
        break;
      default:
        // TODO: Implementar navegação para outras telas
        Alert.alert('Navegação', `Navegar para: ${screen}`);
        break;
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const resourcesData = [
    {
      title: 'Aulas',
      iconName: 'play-circle-outline' as const,
      onPress: () => handleNavigation('Aulas'),
    },
    {
      title: 'Quiz',
      iconName: 'school-outline' as const,
      onPress: () => handleNavigation('Quiz'),
    },
    {
      title: 'Mercado de compras',
      iconName: 'cart-outline' as const,
      onPress: () => handleNavigation('Mercado de compras'),
    },
    {
      title: 'E-books',
      iconName: 'book-outline' as const,
      onPress: () => handleNavigation('E-books'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h3" style={styles.headerTitle}>
          Portal - pais e cuidadores
        </Typography>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de Perfil do Usuário */}
        <ProfileCard user={user} onEditPress={handleEditProfile} />

        {/* Card Gestão de Cuidados */}
        <SectionCard title="Gestão de cuidados:">
          <View style={styles.buttonRow}>
            <ActionButton
              title="Cadastrar crianças"
              iconName="happy-outline"
              onPress={() => navigation.navigate('RegisterChild')}
            />
            <ActionButton
              title="Calculadora de cânulas"
              iconName="calculator"
              onPress={() => navigation.navigate('Traqueostomia')}
            />
          </View>
        </SectionCard>

        {/* Card Suporte */}
        <SectionCard title="Suporte:">
          <View style={styles.buttonRow}>
            <ActionButton
              title="Tirar dúvidas"
              iconName="help-circle-outline"
              onPress={() => handleNavigation('Tirar dúvidas')}
            />
            <ActionButton
              title="Assistente vap"
              iconName="chatbubble-outline"
              onPress={() => handleNavigation('Assistente vap')}
            />
          </View>
        </SectionCard>

        {/* Card Recursos */}
        <SectionCard title="Recursos:">
          <ResourceGrid resources={resourcesData} />
        </SectionCard>

        {/* Botão Logout */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2A7F7E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Sizes.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Sizes.spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
  },
  logoutContainer: {
    marginTop: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.xl,
  },
});