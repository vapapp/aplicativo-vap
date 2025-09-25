import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ChildRegistrationForm, ChildRegistrationIntro, ChildRegistrationSuccess } from '../components/forms';
import { Toast, Typography } from '../components/ui';
import { childrenService } from '../services';
import { Colors, Sizes } from '../utils/constants';

interface ChildFormData {
  // Seção 1: Informações da Criança
  nomeCompleto: string;
  dataNascimento: string;
  genero: 'masculino' | 'feminino' | '';
  numeroSUS: string;
  estadoNascimento: string;
  cidadeNascimento: string;
  pesoNascer: string;
  semanasPrematuridade: 'menos_28' | '28_36' | '37_41' | 'mais_41' | '';
  complicacoesParto: 'sim' | 'nao' | '';
  complicacoesDetalhes: string;

  // Seção 2: Informações dos Pais ou Responsáveis
  nomePai: string;
  nomeMae: string;
  nomeResponsavel: string;
  parentesco: 'pai' | 'mae' | 'avo' | 'tio' | 'outro' | 'cuidador' | '';
  outroParentesco: string;
  dataNascimentoResponsavel: string;
  telefoneContato: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidadeEndereco: string;
  estadoEndereco: string;
  nivelEstudo: 'nao_estudei' | 'fundamental_incompleto' | 'fundamental_completo' | 'medio_incompleto' | 'medio_completo' | 'superior_incompleto' | 'superior_completo' | 'pos_graduacao' | '';

  // Seção 3: Informação sobre a Gestação e o Parto
  gravidezPlanejada: 'sim' | 'nao' | 'nao_sei' | '';
  acompanhamentoPreNatal: 'sim' | 'nao' | '';
  quantidadeConsultas: 'nenhuma' | 'menos_5' | 'entre_5_7' | '8_ou_mais' | '';
  problemasGravidez: string[];
  outrosProblemasGravidez: string;
  tipoParto: 'normal' | 'cesarea' | 'forceps' | 'nao_sei' | '';
  ajudaEspecialRespiracao: 'sim' | 'nao' | 'nao_sei' | '';
  tiposAjudaSalaParto: string[];

  // Seção 4: Condição Clínica da Criança e Traqueostomia
  idadeTraqueostomia: 'nascimento' | 'primeiro_mes' | 'primeiros_6_meses' | 'primeiro_ano' | 'apos_primeiro_ano' | 'nao_sei' | '';
  motivosTraqueostomia: string[];
  outroMotivoTraqueostomia: string;
  tipoTraqueostomia: 'permanente' | 'temporaria' | 'nao_sei_tipo' | '';
  equipamentosMedicos: string[];
  outrosEquipamentos: string;

  // Seção 5: Acompanhamento Médico e Dificuldades
  internacoesPosTraqueostomia: 'nenhuma' | '1_a_5' | 'mais_de_5' | 'nao_sei_internacoes' | '';
  acompanhamentoMedico: string[];
  outroEspecialista: string;
  dificuldadesAtendimento: string[];
  outraDificuldade: string;

  // Seção 6: Cuidados Diários em Casa
  principalCuidador: 'pai' | 'mae' | 'outro_familiar' | 'cuidador_profissional' | '';
  horasCuidadosDiarios: 'menos_1_hora' | 'entre_1_3_horas' | 'mais_3_horas' | '';
  treinamentoHospital: 'sim_seguro' | 'sim_com_duvidas' | 'nao_suficiente' | 'nao_recebi' | '';

  // Seção 7: Acesso a Recursos e Suporte Social
  beneficioFinanceiro: 'sim' | 'nao' | '';
  qualBeneficio: string;
  acessoMateriais: 'sempre_conseguimos' | 'as_vezes' | 'muita_dificuldade' | 'nao_conseguimos' | '';

  // Seção 8: Observações Adicionais
  observacoesAdicionais: string;
}

export const RegisterChildScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showIntro, setShowIntro] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedChild, setSavedChild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingChild, setHasExistingChild] = useState(false);

  // Verificar se já existe criança cadastrada ao carregar a tela
  useEffect(() => {
    const checkExistingChild = async () => {
      try {
        setIsLoading(true);
        console.log('=== VERIFICANDO CRIANÇA EXISTENTE ===');

        const { data: children, error } = await childrenService.getChildren();

        if (error) {
          console.error('Erro ao buscar crianças:', error);
          setIsLoading(false);
          return;
        }

        console.log('Crianças encontradas:', children);

        // Se tem pelo menos uma criança, mostrar tela de sucesso
        if (children && children.length > 0) {
          const firstChild = children[0];
          console.log('Criança já cadastrada encontrada:', firstChild);

          setHasExistingChild(true);
          setSavedChild(firstChild);
          setShowSuccess(true);
          setShowIntro(false);
        } else {
          console.log('Nenhuma criança cadastrada, permitir novo cadastro');
          setHasExistingChild(false);
        }

      } catch (error) {
        console.error('Erro ao verificar criança existente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingChild();
  }, []);

  const handleFormSubmit = async (data: ChildFormData) => {
    try {
      console.log('=== INICIANDO SALVAMENTO NO SUPABASE ===');
      console.log('Dados do formulário completo:', data);

      // Mostrar feedback de carregamento
      setToastMessage('Salvando dados da criança...');
      setToastType('success');
      setShowToast(true);

      // Salvar dados no Supabase
      const { data: savedChild, error } = await childrenService.createChild(data);

      if (error) {
        throw new Error(error);
      }

      if (!savedChild) {
        throw new Error('Erro inesperado: dados não foram salvos');
      }

      console.log('=== CRIANÇA SALVA COM SUCESSO ===', savedChild);

      // Salvar dados para tela de sucesso
      setSavedChild(savedChild);

      // Mostrar tela de sucesso
      setShowSuccess(true);

    } catch (error: any) {
      console.error('=== ERRO NO CADASTRO ===', error);

      // Mapear erros comuns para mensagens mais amigáveis
      let errorMessage = 'Erro inesperado ao cadastrar criança';

      if (error.message) {
        if (error.message.includes('número do SUS')) {
          errorMessage = 'Já existe uma criança cadastrada com este número do SUS';
        } else if (error.message.includes('Usuário não autenticado')) {
          errorMessage = 'Sessão expirada. Faça login novamente';
        } else if (error.message.includes('obrigatório')) {
          errorMessage = 'Campos obrigatórios não preenchidos corretamente';
        } else {
          errorMessage = error.message;
        }
      }

      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);

      // Se o erro for de autenticação, navegar para login
      if (error.message?.includes('Usuário não autenticado')) {
        setTimeout(() => {
          Alert.alert(
            'Sessão Expirada',
            'Sua sessão expirou. Você será redirecionado para a tela de login.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // TODO: Implementar logout e navegação para login
                  navigation.goBack();
                },
              },
            ]
          );
        }, 3000);
      }

      throw error;
    }
  };

  const handleStartForm = () => {
    // Se já tem criança cadastrada, não permitir novo formulário
    if (hasExistingChild) {
      setToastMessage('Você já possui uma criança cadastrada no sistema');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setShowIntro(false);
  };

  const handleCancelForm = () => {
    navigation.goBack();
  };

  const handleBackToHome = () => {
    navigation.goBack();
  };

  // Mostrar loading enquanto verifica se existe criança
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Cadastrar Criança" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.vapapp.teal} />
          <Typography variant="body" style={styles.loadingText}>
            Verificando dados existentes...
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Cadastrar Criança" showBackButton />

      {showSuccess ? (
        <ChildRegistrationSuccess
          childName={savedChild?.nome_completo || 'Criança'}
          childId={savedChild?.id || 'N/A'}
          onBackToHome={handleBackToHome}
        />
      ) : showIntro ? (
        <ChildRegistrationIntro
          onStart={handleStartForm}
          onCancel={handleCancelForm}
        />
      ) : (
        <ChildRegistrationForm onSubmit={handleFormSubmit} />
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.lg,
  },
  loadingText: {
    marginTop: Sizes.spacing.md,
    textAlign: 'center',
    color: Colors.text.secondary,
  },
});