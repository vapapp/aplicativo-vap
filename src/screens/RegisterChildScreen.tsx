import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ChildRegistrationForm } from '../components/forms';
import { Toast } from '../components/ui';
import { Colors } from '../utils/constants';

interface ChildFormData {
  nomeCompleto: string;
  dataNascimento: string;
  genero: 'masculino' | 'feminino' | '';
  numeroSUS: string;
  cidadeEstadoNascimento: string;
  pesoNascer: string;
  semanasPrematuridade: 'menos_28' | '28_36' | '37_41' | 'mais_41' | '';
  complicacoesParto: 'sim' | 'nao' | '';
  complicacoesDetalhes: string;
}

export const RegisterChildScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleFormSubmit = async (data: ChildFormData) => {
    try {
      console.log('=== DADOS DO FORMULÁRIO ===');
      console.log('Nome:', data.nomeCompleto);
      console.log('Data Nascimento:', data.dataNascimento);
      console.log('Gênero:', data.genero);
      console.log('SUS:', data.numeroSUS);
      console.log('Cidade/Estado:', data.cidadeEstadoNascimento);
      console.log('Peso:', data.pesoNascer);
      console.log('Semanas:', data.semanasPrematuridade);
      console.log('Complicações:', data.complicacoesParto);
      if (data.complicacoesDetalhes) {
        console.log('Detalhes:', data.complicacoesDetalhes);
      }

      // TODO: Implementar salvamento no Supabase
      // await childService.createChild(data);

      // Simular salvamento (remover quando implementar API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setToastMessage('Seção 1 salva com sucesso! Continuando...');
      setToastType('success');
      setShowToast(true);

      // TODO: Navegar para próxima seção ou tela de sucesso
      setTimeout(() => {
        Alert.alert(
          'Sucesso',
          'Primeira seção salva com sucesso!\n\nAs próximas seções serão implementadas em breve.',
          [
            {
              text: 'Voltar ao Portal',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      setToastMessage('Erro ao salvar os dados. Tente novamente.');
      setToastType('error');
      setShowToast(true);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Cadastrar Criança" showBackButton />

      <ChildRegistrationForm onSubmit={handleFormSubmit} />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});