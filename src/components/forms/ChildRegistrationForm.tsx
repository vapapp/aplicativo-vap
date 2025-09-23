import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Linking,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography, Input } from '../ui';
import { SUSHelpModal } from '../common/SUSHelpModal';
import { Colors, Sizes } from '../../utils/constants';

// Tipos para API IBGE
interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

// Tipos para o formulário
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
  problemasGravidez: string[]; // Array para múltiplas seleções
  outrosProblemasGravidez: string;
  tipoParto: 'normal' | 'cesarea' | 'forceps' | 'nao_sei' | '';
  ajudaEspecialRespiracao: 'sim' | 'nao' | 'nao_sei' | '';
  tiposAjudaSalaParto: string[]; // Array para múltiplas seleções

  // Seção 4: Condição Clínica da Criança e Traqueostomia
  idadeTraqueostomia: 'nascimento' | 'primeiro_mes' | 'primeiros_6_meses' | 'primeiro_ano' | 'apos_primeiro_ano' | 'nao_sei' | '';
  motivosTraqueostomia: string[]; // Array para múltiplas seleções
  outroMotivoTraqueostomia: string;
  tipoTraqueostomia: 'permanente' | 'temporaria' | 'nao_sei_tipo' | '';
  equipamentosMedicos: string[]; // Array para múltiplas seleções
  outrosEquipamentos: string;

  // Seção 5: Acompanhamento Médico e Dificuldades
  internacoesPosTraqueostomia: 'nenhuma' | '1_a_5' | 'mais_de_5' | 'nao_sei_internacoes' | '';
  acompanhamentoMedico: string[]; // Array para múltiplas seleções
  outroEspecialista: string;
  dificuldadesAtendimento: string[]; // Array para múltiplas seleções
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

// Validação completa do formulário
const formSchema = yup.object().shape({
  // Seção 1: Informações da Criança
  nomeCompleto: yup
    .string()
    .required('Nome completo é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dataNascimento: yup
    .string()
    .required('Data de nascimento é obrigatória')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA'),
  genero: yup
    .string()
    .oneOf(['masculino', 'feminino'], 'Selecione o gênero')
    .required('Gênero é obrigatório'),
  numeroSUS: yup
    .string()
    .required('Número do SUS é obrigatório')
    .matches(/^\d{15}$/, 'Número do SUS deve ter 15 dígitos'),
  estadoNascimento: yup
    .string()
    .required('Estado é obrigatório'),
  cidadeNascimento: yup
    .string()
    .required('Cidade é obrigatória'),
  pesoNascer: yup
    .string()
    .required('Peso ao nascer é obrigatório')
    .matches(/^\d+$/, 'Digite apenas números (em gramas)'),
  semanasPrematuridade: yup
    .string()
    .oneOf(['menos_28', '28_36', '37_41', 'mais_41'], 'Selecione as semanas de gestação')
    .required('Semanas de gestação são obrigatórias'),
  complicacoesParto: yup
    .string()
    .oneOf(['sim', 'nao'], 'Selecione sim ou não')
    .required('Esta informação é obrigatória'),
  complicacoesDetalhes: yup
    .string()
    .when('complicacoesParto', {
      is: 'sim',
      then: (schema) => schema.required('Por favor, explique as complicações'),
      otherwise: (schema) => schema.notRequired(),
    }),

  // Seção 2: Informações dos Pais ou Responsáveis
  nomePai: yup
    .string()
    .test('pelo-menos-um-nome', 'Preencha pelo menos um nome: Pai, Mãe ou Responsável Legal', function(value) {
      const { nomeMae, nomeResponsavel } = this.parent;
      return !!(value || nomeMae || nomeResponsavel);
    }),
  nomeMae: yup
    .string()
    .test('pelo-menos-um-nome', 'Preencha pelo menos um nome: Pai, Mãe ou Responsável Legal', function(value) {
      const { nomePai, nomeResponsavel } = this.parent;
      return !!(value || nomePai || nomeResponsavel);
    }),
  nomeResponsavel: yup
    .string()
    .test('pelo-menos-um-nome', 'Preencha pelo menos um nome: Pai, Mãe ou Responsável Legal', function(value) {
      const { nomePai, nomeMae } = this.parent;
      return !!(value || nomePai || nomeMae);
    }),
  parentesco: yup
    .string()
    .oneOf(['pai', 'mae', 'avo', 'tio', 'outro', 'cuidador'], 'Selecione o parentesco')
    .required('Parentesco é obrigatório'),
  outroParentesco: yup
    .string()
    .when('parentesco', {
      is: 'outro',
      then: (schema) => schema.required('Especifique o parentesco'),
      otherwise: (schema) => schema.notRequired(),
    }),
  dataNascimentoResponsavel: yup
    .string()
    .required('Data de nascimento é obrigatória')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA'),
  telefoneContato: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  cep: yup
    .string()
    .required('CEP é obrigatório')
    .matches(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
  rua: yup.string().required('Rua é obrigatória'),
  numero: yup.string().required('Número é obrigatório'),
  bairro: yup.string().required('Bairro é obrigatório'),
  cidadeEndereco: yup.string().required('Cidade é obrigatória'),
  estadoEndereco: yup.string().required('Estado é obrigatório'),
  nivelEstudo: yup
    .string()
    .oneOf(['nao_estudei', 'fundamental_incompleto', 'fundamental_completo', 'medio_incompleto', 'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao'], 'Selecione o nível de estudo')
    .required('Nível de estudo é obrigatório'),

  // Seção 3: Informação sobre a Gestação e o Parto
  gravidezPlanejada: yup
    .string()
    .oneOf(['sim', 'nao', 'nao_sei'], 'Selecione uma opção')
    .required('Esta informação é obrigatória'),
  acompanhamentoPreNatal: yup
    .string()
    .oneOf(['sim', 'nao'], 'Selecione uma opção')
    .required('Esta informação é obrigatória'),
  quantidadeConsultas: yup
    .string()
    .when('acompanhamentoPreNatal', {
      is: 'sim',
      then: (schema) => schema
        .oneOf(['nenhuma', 'menos_5', 'entre_5_7', '8_ou_mais'], 'Selecione uma opção')
        .required('Informe a quantidade de consultas'),
      otherwise: (schema) => schema.notRequired(),
    }),
  problemasGravidez: yup.array().of(yup.string()).default([]),
  outrosProblemasGravidez: yup
    .string()
    .when('problemasGravidez', {
      is: (value: string[]) => value && value.includes('outros'),
      then: (schema) => schema.required('Especifique os outros problemas'),
      otherwise: (schema) => schema.notRequired(),
    }),
  tipoParto: yup
    .string()
    .oneOf(['normal', 'cesarea', 'forceps', 'nao_sei'], 'Selecione o tipo de parto')
    .required('Tipo de parto é obrigatório'),
  ajudaEspecialRespiracao: yup
    .string()
    .oneOf(['sim', 'nao', 'nao_sei'], 'Selecione uma opção')
    .required('Esta informação é obrigatória'),
  tiposAjudaSalaParto: yup
    .array()
    .of(yup.string())
    .when('ajudaEspecialRespiracao', {
      is: 'sim',
      then: (schema) => schema.min(1, 'Selecione pelo menos um tipo de ajuda'),
      otherwise: (schema) => schema.notRequired(),
    })
    .default([]),

  // Seção 4: Condição Clínica da Criança e Traqueostomia
  idadeTraqueostomia: yup
    .string()
    .oneOf(['nascimento', 'primeiro_mes', 'primeiros_6_meses', 'primeiro_ano', 'apos_primeiro_ano', 'nao_sei'], 'Selecione a idade')
    .required('Idade da traqueostomia é obrigatória'),
  motivosTraqueostomia: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecione pelo menos um motivo')
    .default([]),
  outroMotivoTraqueostomia: yup
    .string()
    .when('motivosTraqueostomia', {
      is: (value: string[]) => value && value.includes('outro_motivo'),
      then: (schema) => schema.required('Especifique o outro motivo'),
      otherwise: (schema) => schema.notRequired(),
    }),
  tipoTraqueostomia: yup
    .string()
    .oneOf(['permanente', 'temporaria', 'nao_sei_tipo'], 'Selecione o tipo')
    .required('Tipo de traqueostomia é obrigatório'),
  equipamentosMedicos: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecione pelo menos um equipamento')
    .default([]),
  outrosEquipamentos: yup
    .string()
    .when('equipamentosMedicos', {
      is: (value: string[]) => value && value.includes('outros_equipamentos'),
      then: (schema) => schema.required('Especifique os outros equipamentos'),
      otherwise: (schema) => schema.notRequired(),
    }),

  // Seção 5: Acompanhamento Médico e Dificuldades
  internacoesPosTraqueostomia: yup
    .string()
    .oneOf(['nenhuma', '1_a_5', 'mais_de_5', 'nao_sei_internacoes'], 'Selecione uma opção')
    .required('Esta informação é obrigatória'),
  acompanhamentoMedico: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecione pelo menos uma opção de acompanhamento médico')
    .default([]),
  outroEspecialista: yup
    .string()
    .when('acompanhamentoMedico', {
      is: (value: string[]) => value && value.includes('outro_especialista'),
      then: (schema) => schema.required('Especifique qual outro especialista'),
      otherwise: (schema) => schema.notRequired(),
    }),
  dificuldadesAtendimento: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecione pelo menos uma dificuldade ou "Não temos dificuldades"')
    .default([]),
  outraDificuldade: yup
    .string()
    .when('dificuldadesAtendimento', {
      is: (value: string[]) => value && value.includes('outra_dificuldade'),
      then: (schema) => schema.required('Especifique qual outra dificuldade'),
      otherwise: (schema) => schema.notRequired(),
    }),

  // Seção 6: Cuidados Diários em Casa
  principalCuidador: yup
    .string()
    .oneOf(['pai', 'mae', 'outro_familiar', 'cuidador_profissional'], 'Selecione quem é o principal cuidador')
    .required('Esta informação é obrigatória'),
  horasCuidadosDiarios: yup
    .string()
    .oneOf(['menos_1_hora', 'entre_1_3_horas', 'mais_3_horas'], 'Selecione quantas horas por dia')
    .required('Esta informação é obrigatória'),
  treinamentoHospital: yup
    .string()
    .oneOf(['sim_seguro', 'sim_com_duvidas', 'nao_suficiente', 'nao_recebi'], 'Selecione uma opção sobre o treinamento')
    .required('Esta informação é obrigatória'),

  // Seção 7: Acesso a Recursos e Suporte Social
  beneficioFinanceiro: yup
    .string()
    .oneOf(['sim', 'nao'], 'Selecione se recebe benefício ou não')
    .required('Esta informação é obrigatória'),
  qualBeneficio: yup
    .string()
    .when('beneficioFinanceiro', {
      is: 'sim',
      then: (schema) => schema.required('Especifique qual benefício recebe'),
      otherwise: (schema) => schema.notRequired(),
    }),
  acessoMateriais: yup
    .string()
    .oneOf(['sempre_conseguimos', 'as_vezes', 'muita_dificuldade', 'nao_conseguimos'], 'Selecione uma opção sobre o acesso aos materiais')
    .required('Esta informação é obrigatória'),

  // Seção 8: Observações Adicionais
  observacoesAdicionais: yup
    .string()
    .notRequired(),
});

interface ChildRegistrationFormProps {
  onSubmit: (data: ChildFormData) => Promise<void>;
}

export const ChildRegistrationForm: React.FC<ChildRegistrationFormProps> = ({
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSUSHelp, setShowSUSHelp] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [searchEstado, setSearchEstado] = useState('');
  const [searchCidade, setSearchCidade] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChildFormData>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      nomeCompleto: '',
      dataNascimento: '',
      genero: '',
      numeroSUS: '',
      estadoNascimento: '',
      cidadeNascimento: '',
      pesoNascer: '',
      semanasPrematuridade: '',
      complicacoesParto: '',
      complicacoesDetalhes: '',
      nomePai: '',
      nomeMae: '',
      nomeResponsavel: '',
      parentesco: '',
      outroParentesco: '',
      dataNascimentoResponsavel: '',
      telefoneContato: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidadeEndereco: '',
      estadoEndereco: '',
      nivelEstudo: '',
      gravidezPlanejada: '',
      acompanhamentoPreNatal: '',
      quantidadeConsultas: '',
      problemasGravidez: [],
      outrosProblemasGravidez: '',
      tipoParto: '',
      ajudaEspecialRespiracao: '',
      tiposAjudaSalaParto: [],
      // Seção 4
      idadeTraqueostomia: '',
      motivosTraqueostomia: [],
      outroMotivoTraqueostomia: '',
      tipoTraqueostomia: '',
      equipamentosMedicos: [],
      outrosEquipamentos: '',
      // Seção 5
      internacoesPosTraqueostomia: '',
      acompanhamentoMedico: [],
      outroEspecialista: '',
      dificuldadesAtendimento: [],
      outraDificuldade: '',
      // Seção 6
      principalCuidador: '',
      horasCuidadosDiarios: '',
      treinamentoHospital: '',
      // Seção 7
      beneficioFinanceiro: '',
      qualBeneficio: '',
      acessoMateriais: '',
      // Seção 8
      observacoesAdicionais: '',
    },
  });

  const watchComplicacoesParto = watch('complicacoesParto');
  const watchEstadoNascimento = watch('estadoNascimento');
  const watchParentesco = watch('parentesco');
  const watchCep = watch('cep');
  const watchAcompanhamentoPreNatal = watch('acompanhamentoPreNatal');
  const watchProblemasGravidez = watch('problemasGravidez');
  const watchAjudaEspecialRespiracao = watch('ajudaEspecialRespiracao');
  // Seção 4
  const watchMotivosTraqueostomia = watch('motivosTraqueostomia');
  const watchEquipamentosMedicos = watch('equipamentosMedicos');
  // Seção 5
  const watchAcompanhamentoMedico = watch('acompanhamentoMedico');
  const watchDificuldadesAtendimento = watch('dificuldadesAtendimento');
  // Seção 7
  const watchBeneficioFinanceiro = watch('beneficioFinanceiro');

  // Buscar estados do IBGE
  const fetchEstados = async () => {
    try {
      setLoadingEstados(true);
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const data: Estado[] = await response.json();
      const estadosOrdenados = data.sort((a, b) => a.nome.localeCompare(b.nome));
      setEstados(estadosOrdenados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os estados. Tente novamente.');
    } finally {
      setLoadingEstados(false);
    }
  };

  // Buscar cidades por estado
  const fetchCidades = async (uf: string) => {
    try {
      setLoadingCidades(true);
      setCidades([]);
      setValue('cidadeNascimento', '');
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data: Cidade[] = await response.json();
      const cidadesOrdenadas = data.sort((a, b) => a.nome.localeCompare(b.nome));
      setCidades(cidadesOrdenadas);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as cidades. Tente novamente.');
    } finally {
      setLoadingCidades(false);
    }
  };

  // Carregar estados ao montar o componente
  useEffect(() => {
    fetchEstados();
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (watchEstadoNascimento) {
      fetchCidades(watchEstadoNascimento);
    }
  }, [watchEstadoNascimento]);

  // Buscar endereço quando CEP mudar
  useEffect(() => {
    if (watchCep && watchCep.length === 9) { // 00000-000
      fetchEnderecoPorCep(watchCep);
    }
  }, [watchCep]);

  // Formatação da data
  const formatDate = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  // Formatação do SUS
  const formatSUS = (text: string) => {
    return text.replace(/\D/g, '').slice(0, 15);
  };

  // Formatação do peso
  const formatPeso = (text: string) => {
    return text.replace(/\D/g, '');
  };

  // Formatação do telefone
  const formatTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Formatação do CEP
  const formatCep = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Buscar endereço pelo CEP
  const fetchEnderecoPorCep = async (cep: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setValue('rua', data.logradouro || '');
          setValue('bairro', data.bairro || '');
          setValue('cidadeEndereco', data.localidade || '');
          setValue('estadoEndereco', data.uf || '');
        }
      }
    } catch (error) {
      console.log('Erro ao buscar CEP:', error);
    }
  };

  const handleFormSubmit = async (data: ChildFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRadioOption = (
    field: any,
    value: string,
    label: string,
    description?: string
  ) => (
    <View style={styles.radioOption}>
      <View style={styles.radioButton}>
        <View
          style={[
            styles.radioCircle,
            field.value === value && styles.radioCircleSelected,
          ]}
          onTouchEnd={() => field.onChange(value)}
        >
          {field.value === value && <View style={styles.radioInner} />}
        </View>
        <View style={styles.radioTextContainer}>
          <Typography variant="body" style={styles.radioLabel}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" style={styles.radioDescription}>
              {description}
            </Typography>
          )}
        </View>
      </View>
    </View>
  );

  const getEstadoNome = (sigla: string) => {
    const estado = estados.find(e => e.sigla === sigla);
    return estado ? estado.nome : '';
  };

  // Funções para lidar com checkboxes (múltiplas seleções)
  const handleCheckboxChange = (fieldName: 'problemasGravidez' | 'tiposAjudaSalaParto', value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues);
  };

  // Renderizar opção de checkbox
  const renderCheckboxOption = (
    value: string,
    label: string,
    currentValues: string[],
    fieldName: 'problemasGravidez' | 'tiposAjudaSalaParto'
  ) => {
    const isSelected = currentValues.includes(value);

    return (
      <TouchableOpacity
        key={value}
        style={styles.checkboxOption}
        onPress={() => handleCheckboxChange(fieldName, value, currentValues)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color={Colors.neutral[0]} />}
        </View>
        <Typography variant="body" style={styles.checkboxLabel}>
          {label}
        </Typography>
      </TouchableOpacity>
    );
  };

  // Filtrar estados pela busca
  const estadosFiltrados = estados.filter(estado =>
    estado.nome.toLowerCase().includes(searchEstado.toLowerCase()) ||
    estado.sigla.toLowerCase().includes(searchEstado.toLowerCase())
  );

  // Filtrar cidades pela busca
  const cidadesFiltradas = cidades.filter(cidade =>
    cidade.nome.toLowerCase().includes(searchCidade.toLowerCase())
  );

  // Limpar busca ao abrir modais
  const abrirModalEstado = () => {
    setSearchEstado('');
    setShowEstadoModal(true);
  };

  const abrirModalCidade = () => {
    setSearchCidade('');
    setShowCidadeModal(true);
  };

  // Abrir busca de CEP dos Correios
  const abrirBuscaCep = async () => {
    const url = 'https://buscacepinter.correios.com.br/app/endereco/index.php';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o site dos Correios');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o site dos Correios');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Título da Seção */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 1: Informações da Criança
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Por favor, preencha todas as informações sobre a criança
            </Typography>
          </View>

          {/* Nome Completo */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Nome completo da criança *
            </Typography>
            <Controller
              control={control}
              name="nomeCompleto"
              render={({ field }) => (
                <Input
                  placeholder="Digite o nome completo"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.nomeCompleto?.message}
                />
              )}
            />
          </View>

          {/* Data de Nascimento */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Data de nascimento da criança *
            </Typography>
            <Controller
              control={control}
              name="dataNascimento"
              render={({ field }) => (
                <Input
                  placeholder="DD/MM/AAAA"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatDate(text))}
                  keyboardType="numeric"
                  style={styles.input}
                  error={errors.dataNascimento?.message}
                  maxLength={10}
                />
              )}
            />
          </View>

          {/* Gênero */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Gênero *
            </Typography>
            <Controller
              control={control}
              name="genero"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'masculino', 'Masculino')}
                  {renderRadioOption(field, 'feminino', 'Feminino')}
                </View>
              )}
            />
            {errors.genero && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.genero.message}
              </Typography>
            )}
          </View>

          {/* Número do SUS */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Número do Cartão do SUS da criança *
            </Typography>
            <Controller
              control={control}
              name="numeroSUS"
              render={({ field }) => (
                <Input
                  placeholder="Digite os 15 dígitos"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatSUS(text))}
                  keyboardType="number-pad"
                  style={styles.input}
                  error={errors.numeroSUS?.message}
                  maxLength={15}
                />
              )}
            />
            <TouchableOpacity
              style={styles.helpButtonBottom}
              onPress={() => setShowSUSHelp(true)}
            >
              <Ionicons name="help-circle-outline" size={18} color={Colors.vapapp.teal} />
              <Typography variant="caption" style={styles.helpTextBottom}>
                Não sabe o que é o Cartão do SUS? Toque aqui para ver exemplo
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Estado */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Estado onde a criança nasceu *
            </Typography>
            <Controller
              control={control}
              name="estadoNascimento"
              render={({ field }) => (
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => !loadingEstados && abrirModalEstado()}
                  disabled={loadingEstados}
                >
                  <Typography
                    variant="body"
                    style={[
                      styles.dropdownText,
                      !field.value && styles.placeholderText
                    ]}
                  >
                    {loadingEstados
                      ? "Carregando estados..."
                      : field.value
                        ? getEstadoNome(field.value)
                        : "Selecione o estado"
                    }
                  </Typography>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={Colors.neutral[500]}
                  />
                </TouchableOpacity>
              )}
            />
            {errors.estadoNascimento && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.estadoNascimento.message}
              </Typography>
            )}
          </View>

          {/* Cidade */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Cidade onde a criança nasceu *
            </Typography>
            <Controller
              control={control}
              name="cidadeNascimento"
              render={({ field }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    (!watchEstadoNascimento || loadingCidades) && styles.dropdownDisabled
                  ]}
                  onPress={() => {
                    if (watchEstadoNascimento && !loadingCidades) {
                      abrirModalCidade();
                    }
                  }}
                  disabled={!watchEstadoNascimento || loadingCidades}
                >
                  <Typography
                    variant="body"
                    style={[
                      styles.dropdownText,
                      !field.value && styles.placeholderText
                    ]}
                  >
                    {!watchEstadoNascimento
                      ? "Primeiro selecione o estado"
                      : loadingCidades
                        ? "Carregando cidades..."
                        : field.value || "Selecione a cidade"
                    }
                  </Typography>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={Colors.neutral[500]}
                  />
                </TouchableOpacity>
              )}
            />
            {errors.cidadeNascimento && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.cidadeNascimento.message}
              </Typography>
            )}
          </View>

          {/* Peso ao Nascer */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Peso da criança ao nascer (em gramas) *
            </Typography>
            <Controller
              control={control}
              name="pesoNascer"
              render={({ field }) => (
                <Input
                  placeholder="Ex: 3200"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatPeso(text))}
                  keyboardType="number-pad"
                  style={styles.input}
                  error={errors.pesoNascer?.message}
                />
              )}
            />
          </View>

          {/* Semanas de Gestação */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quantas semanas de gravidez a mãe tinha quando a criança nasceu? *
            </Typography>
            <Controller
              control={control}
              name="semanasPrematuridade"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(
                    field,
                    'menos_28',
                    'Menos de 28 semanas',
                    'muito prematuro'
                  )}
                  {renderRadioOption(
                    field,
                    '28_36',
                    'Entre 28 e 36 semanas',
                    'prematuro'
                  )}
                  {renderRadioOption(
                    field,
                    '37_41',
                    'Entre 37 e 41 semanas',
                    'no tempo certo'
                  )}
                  {renderRadioOption(
                    field,
                    'mais_41',
                    'Mais de 41 semanas',
                    'após o tempo certo'
                  )}
                </View>
              )}
            />
            {errors.semanasPrematuridade && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.semanasPrematuridade.message}
              </Typography>
            )}
          </View>

          {/* Complicações no Parto */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Houve alguma complicação importante durante o parto da criança? *
            </Typography>
            <Controller
              control={control}
              name="complicacoesParto"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim', 'Sim')}
                  {renderRadioOption(field, 'nao', 'Não')}
                </View>
              )}
            />
            {errors.complicacoesParto && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.complicacoesParto.message}
              </Typography>
            )}
          </View>

          {/* Detalhes das Complicações (condicional) */}
          {watchComplicacoesParto === 'sim' && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Por favor, explique brevemente as complicações *
              </Typography>
              <Controller
                control={control}
                name="complicacoesDetalhes"
                render={({ field }) => (
                  <Input
                    placeholder="Descreva as complicações que ocorreram..."
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    error={errors.complicacoesDetalhes?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Seção 2: Informações dos Pais ou Responsáveis */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 2: Informações dos Pais ou Responsáveis Legais
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Preencha as informações do responsável principal pela criança
            </Typography>
          </View>

          <Typography variant="caption" style={styles.importantNote}>
            * Preencha pelo menos um dos campos abaixo
          </Typography>

          {/* Nome do Pai */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Nome completo do Pai
            </Typography>
            <Controller
              control={control}
              name="nomePai"
              render={({ field }) => (
                <Input
                  placeholder="Digite o nome completo do pai"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.nomePai?.message}
                />
              )}
            />
          </View>

          {/* Nome da Mãe */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Nome completo da Mãe
            </Typography>
            <Controller
              control={control}
              name="nomeMae"
              render={({ field }) => (
                <Input
                  placeholder="Digite o nome completo da mãe"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.nomeMae?.message}
                />
              )}
            />
          </View>

          {/* Nome do Responsável Legal */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Nome completo do Responsável Legal principal (se não for pai ou mãe)
            </Typography>
            <Controller
              control={control}
              name="nomeResponsavel"
              render={({ field }) => (
                <Input
                  placeholder="Digite o nome do responsável legal"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.nomeResponsavel?.message}
                />
              )}
            />
          </View>

          {/* Parentesco */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Qual seu parentesco com a criança? *
            </Typography>
            <Controller
              control={control}
              name="parentesco"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'pai', 'Pai')}
                  {renderRadioOption(field, 'mae', 'Mãe')}
                  {renderRadioOption(field, 'avo', 'Avó(o)')}
                  {renderRadioOption(field, 'tio', 'Tio(a)')}
                  {renderRadioOption(field, 'outro', 'Outro parente')}
                  {renderRadioOption(field, 'cuidador', 'Cuidador(a) profissional / Contratado(a)')}
                </View>
              )}
            />
            {errors.parentesco && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.parentesco.message}
              </Typography>
            )}
          </View>

          {/* Especificar Outro Parentesco (condicional) */}
          {watchParentesco === 'outro' && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Especifique qual é o parentesco *
              </Typography>
              <Controller
                control={control}
                name="outroParentesco"
                render={({ field }) => (
                  <Input
                    placeholder="Ex: Primo(a), Cunhado(a), etc."
                    value={field.value}
                    onChangeText={field.onChange}
                    style={styles.input}
                    error={errors.outroParentesco?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Data de Nascimento do Responsável */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Data de nascimento do Responsável Legal principal *
            </Typography>
            <Controller
              control={control}
              name="dataNascimentoResponsavel"
              render={({ field }) => (
                <Input
                  placeholder="DD/MM/AAAA"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatDate(text))}
                  keyboardType="numeric"
                  style={styles.input}
                  error={errors.dataNascimentoResponsavel?.message}
                  maxLength={10}
                />
              )}
            />
          </View>

          {/* Telefone de Contato */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Número de telefone para contato (com DDD) *
            </Typography>
            <Controller
              control={control}
              name="telefoneContato"
              render={({ field }) => (
                <Input
                  placeholder="(00) 00000-0000"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatTelefone(text))}
                  keyboardType="number-pad"
                  style={styles.input}
                  error={errors.telefoneContato?.message}
                  maxLength={15}
                />
              )}
            />
          </View>

          {/* CEP */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              CEP *
            </Typography>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <Input
                  placeholder="00000-000"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatCep(text))}
                  keyboardType="number-pad"
                  style={styles.input}
                  error={errors.cep?.message}
                  maxLength={9}
                />
              )}
            />
            <Typography variant="caption" style={styles.helpNote}>
              Digite o CEP para preenchimento automático do endereço
            </Typography>
            <TouchableOpacity
              style={styles.helpButtonBottom}
              onPress={abrirBuscaCep}
            >
              <Ionicons name="search-outline" size={18} color={Colors.vapapp.teal} />
              <Typography variant="caption" style={styles.helpTextBottom}>
                Não sabe seu CEP? Clique aqui para buscar no site dos Correios
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Rua */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Rua / Logradouro *
            </Typography>
            <Controller
              control={control}
              name="rua"
              render={({ field }) => (
                <Input
                  placeholder="Nome da rua"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.rua?.message}
                />
              )}
            />
          </View>

          {/* Número */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Número *
            </Typography>
            <Controller
              control={control}
              name="numero"
              render={({ field }) => (
                <Input
                  placeholder="123"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.numero?.message}
                />
              )}
            />
          </View>

          {/* Bairro */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Bairro *
            </Typography>
            <Controller
              control={control}
              name="bairro"
              render={({ field }) => (
                <Input
                  placeholder="Nome do bairro"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.bairro?.message}
                />
              )}
            />
          </View>

          {/* Cidade do Endereço */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Cidade *
            </Typography>
            <Controller
              control={control}
              name="cidadeEndereco"
              render={({ field }) => (
                <Input
                  placeholder="Nome da cidade"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.cidadeEndereco?.message}
                />
              )}
            />
          </View>

          {/* Estado do Endereço */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Estado *
            </Typography>
            <Controller
              control={control}
              name="estadoEndereco"
              render={({ field }) => (
                <Input
                  placeholder="UF"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                  error={errors.estadoEndereco?.message}
                  maxLength={2}
                />
              )}
            />
          </View>

          {/* Nível de Estudo */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Qual seu nível de estudo? *
            </Typography>
            <Controller
              control={control}
              name="nivelEstudo"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'nao_estudei', 'Não estudei')}
                  {renderRadioOption(field, 'fundamental_incompleto', 'Ensino Fundamental incompleto')}
                  {renderRadioOption(field, 'fundamental_completo', 'Ensino Fundamental completo')}
                  {renderRadioOption(field, 'medio_incompleto', 'Ensino Médio incompleto')}
                  {renderRadioOption(field, 'medio_completo', 'Ensino Médio completo')}
                  {renderRadioOption(field, 'superior_incompleto', 'Ensino Superior incompleto')}
                  {renderRadioOption(field, 'superior_completo', 'Ensino Superior completo')}
                  {renderRadioOption(field, 'pos_graduacao', 'Pós-Graduação ou mais')}
                </View>
              )}
            />
            {errors.nivelEstudo && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.nivelEstudo.message}
              </Typography>
            )}
          </View>

          {/* Seção 3: Informação sobre a Gestação e o Parto */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 3: Informação sobre a Gestação e o Parto da Criança
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Informações sobre a gravidez e o nascimento da criança
            </Typography>
          </View>

          {/* A gravidez foi planejada? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              A gravidez foi planejada? *
            </Typography>
            <Controller
              control={control}
              name="gravidezPlanejada"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim', 'Sim')}
                  {renderRadioOption(field, 'nao', 'Não')}
                  {renderRadioOption(field, 'nao_sei', 'Não sei informar')}
                </View>
              )}
            />
            {errors.gravidezPlanejada && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.gravidezPlanejada.message}
              </Typography>
            )}
          </View>

          {/* Acompanhamento pré-natal */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Houve acompanhamento médico (pré-natal) durante a gravidez? *
            </Typography>
            <Controller
              control={control}
              name="acompanhamentoPreNatal"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim', 'Sim')}
                  {renderRadioOption(field, 'nao', 'Não')}
                </View>
              )}
            />
            {errors.acompanhamentoPreNatal && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.acompanhamentoPreNatal.message}
              </Typography>
            )}
          </View>

          {/* Quantidade de consultas (condicional) */}
          {watchAcompanhamentoPreNatal === 'sim' && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Se houve pré-natal, quantas consultas médicas foram feitas, aproximadamente? *
              </Typography>
              <Controller
                control={control}
                name="quantidadeConsultas"
                render={({ field }) => (
                  <View style={styles.radioGroup}>
                    {renderRadioOption(field, 'nenhuma', 'Nenhuma')}
                    {renderRadioOption(field, 'menos_5', 'Menos de 5 consultas')}
                    {renderRadioOption(field, 'entre_5_7', 'Entre 5 e 7 consultas')}
                    {renderRadioOption(field, '8_ou_mais', '8 consultas ou mais')}
                  </View>
                )}
              />
              {errors.quantidadeConsultas && (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.quantidadeConsultas.message}
                </Typography>
              )}
            </View>
          )}

          {/* Problemas durante a gravidez */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Durante a gravidez, a mãe teve algum dos problemas de saúde abaixo? (Pode marcar mais de uma opção)
            </Typography>
            <Controller
              control={control}
              name="problemasGravidez"
              render={({ field }) => (
                <View style={styles.checkboxGroup}>
                  {renderCheckboxOption('pressao_alta', 'Pressão alta (Hipertensão)', field.value, 'problemasGravidez')}
                  {renderCheckboxOption('diabetes', 'Diabetes', field.value, 'problemasGravidez')}
                  {renderCheckboxOption('infeccoes', 'Infecções (Ex: Zika, Rubéola, Toxoplasmose, Sífilis, etc.)', field.value, 'problemasGravidez')}
                  {renderCheckboxOption('substancias', 'Uso de bebidas alcoólicas, cigarro ou drogas ilícitas', field.value, 'problemasGravidez')}
                  {renderCheckboxOption('outros', 'Outros problemas de saúde', field.value, 'problemasGravidez')}
                  {renderCheckboxOption('nenhum', 'Nenhum desses', field.value, 'problemasGravidez')}
                </View>
              )}
            />
          </View>

          {/* Especificar outros problemas (condicional) */}
          {watchProblemasGravidez && watchProblemasGravidez.includes('outros') && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Quais outros problemas de saúde? *
              </Typography>
              <Controller
                control={control}
                name="outrosProblemasGravidez"
                render={({ field }) => (
                  <Input
                    placeholder="Descreva os outros problemas de saúde..."
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={2}
                    error={errors.outrosProblemasGravidez?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Tipo de parto */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Como foi o tipo de parto? *
            </Typography>
            <Controller
              control={control}
              name="tipoParto"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'normal', 'Parto Normal')}
                  {renderRadioOption(field, 'cesarea', 'Parto Cesárea')}
                  {renderRadioOption(field, 'forceps', 'Parto a Fórceps (ajudado por instrumento)')}
                  {renderRadioOption(field, 'nao_sei', 'Não sei informar')}
                </View>
              )}
            />
            {errors.tipoParto && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.tipoParto.message}
              </Typography>
            )}
          </View>

          {/* Ajuda especial para respirar */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              O bebê precisou de alguma ajuda especial para respirar ou para o coração logo após o nascimento (na sala de parto)? *
            </Typography>
            <Controller
              control={control}
              name="ajudaEspecialRespiracao"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim', 'Sim')}
                  {renderRadioOption(field, 'nao', 'Não')}
                  {renderRadioOption(field, 'nao_sei', 'Não sei informar')}
                </View>
              )}
            />
            {errors.ajudaEspecialRespiracao && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.ajudaEspecialRespiracao.message}
              </Typography>
            )}
          </View>

          {/* Tipos de ajuda na sala de parto (condicional) */}
          {watchAjudaEspecialRespiracao === 'sim' && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Qual(is) tipo(s) de ajuda o bebê recebeu na sala de parto? (Pode marcar mais de uma opção) *
              </Typography>
              <Controller
                control={control}
                name="tiposAjudaSalaParto"
                render={({ field }) => (
                  <View style={styles.checkboxGroup}>
                    {renderCheckboxOption('oxigenio', 'Oxigênio (por mangueirinha no nariz ou máscara facial)', field.value, 'tiposAjudaSalaParto')}
                    {renderCheckboxOption('mascara_balao', 'Ajuda para respirar com uma máscara e balão (aparelho que infla o pulmão, às vezes chamado de "ambu")', field.value, 'tiposAjudaSalaParto')}
                    {renderCheckboxOption('intubacao', 'Colocaram um tubo na garganta para ajudar a respirar (chamado de intubação)', field.value, 'tiposAjudaSalaParto')}
                    {renderCheckboxOption('massagem_cardiaca', 'Fizeram massagem no peito (compressões cardíacas)', field.value, 'tiposAjudaSalaParto')}
                    {renderCheckboxOption('medicamentos', 'Deram medicamentos injetados (pelo umbigo, veia ou pela boca)', field.value, 'tiposAjudaSalaParto')}
                    {renderCheckboxOption('nao_sei_detalhes', 'Não sei informar os detalhes', field.value, 'tiposAjudaSalaParto')}
                  </View>
                )}
              />
              {errors.tiposAjudaSalaParto && (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.tiposAjudaSalaParto.message}
                </Typography>
              )}
            </View>
          )}

          {/* Seção 4: Condição Clínica da Criança e Traqueostomia */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 4: Condição Clínica da Criança e Traqueostomia
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Informações sobre a traqueostomia e cuidados médicos necessários
            </Typography>
          </View>

          {/* Com que idade a criança fez a traqueostomia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Com que idade a criança fez a traqueostomia? *
            </Typography>
            <Controller
              control={control}
              name="idadeTraqueostomia"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'nascimento', 'Logo após o nascimento (primeiros dias)')}
                  {renderRadioOption(field, 'primeiro_mes', 'No primeiro mês de vida')}
                  {renderRadioOption(field, 'primeiros_6_meses', 'Nos primeiros 6 meses de vida')}
                  {renderRadioOption(field, 'primeiro_ano', 'No primeiro ano de vida')}
                  {renderRadioOption(field, 'apos_primeiro_ano', 'Após o primeiro ano de vida')}
                  {renderRadioOption(field, 'nao_sei', 'Não sei informar')}
                </View>
              )}
            />
            {errors.idadeTraqueostomia && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.idadeTraqueostomia.message}
              </Typography>
            )}
          </View>

          {/* Por qual(is) motivo(s) a criança precisou da traqueostomia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Por qual(is) motivo(s) a criança precisou da traqueostomia? (Pode marcar mais de uma opção) *
            </Typography>
            <Controller
              control={control}
              name="motivosTraqueostomia"
              render={({ field }) => (
                <View style={styles.checkboxGroup}>
                  {renderCheckboxOption('problema_nascimento', 'Problemas respiratórios desde o nascimento', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('malformacao_vias_aereas', 'Malformação das vias aéreas (problemas na formação da traqueia, laringe ou outras partes)', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('obstrucao_vias_aereas', 'Obstrução das vias aéreas superiores (algo bloqueando a passagem do ar)', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('ventilacao_prolongada', 'Necessidade de ventilação mecânica prolongada (aparelhos para ajudar a respirar por muito tempo)', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('paralisia_cordas_vocais', 'Paralisia das cordas vocais (cordas vocais não funcionam direito)', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('sindrome_genetica', 'Síndrome genética que afeta a respiração', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('trauma_acidente', 'Trauma ou acidente que danificou as vias aéreas', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('infeccao_grave', 'Infecção grave que afetou a respiração', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('outro_motivo', 'Outro motivo', field.value, 'motivosTraqueostomia')}
                  {renderCheckboxOption('nao_sei_motivo', 'Não sei informar o motivo', field.value, 'motivosTraqueostomia')}
                </View>
              )}
            />
            {errors.motivosTraqueostomia && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.motivosTraqueostomia.message}
              </Typography>
            )}
          </View>

          {/* Especificar outro motivo (condicional) */}
          {watchMotivosTraqueostomia?.includes('outro_motivo') && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Especifique qual outro motivo *
              </Typography>
              <Controller
                control={control}
                name="outroMotivoTraqueostomia"
                render={({ field }) => (
                  <Input
                    placeholder="Descreva o motivo"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    error={errors.outroMotivoTraqueostomia?.message}
                  />
                )}
              />
            </View>
          )}

          {/* A traqueostomia é permanente ou temporária? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              A traqueostomia é permanente ou temporária? *
            </Typography>
            <Controller
              control={control}
              name="tipoTraqueostomia"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'permanente', 'Permanente (a criança vai precisar para sempre)')}
                  {renderRadioOption(field, 'temporaria', 'Temporária (um dia poderá ser retirada)')}
                  {renderRadioOption(field, 'nao_sei_tipo', 'Não sei informar')}
                </View>
              )}
            />
            {errors.tipoTraqueostomia && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.tipoTraqueostomia.message}
              </Typography>
            )}
          </View>

          {/* Quais equipamentos ou dispositivos médicos a criança usa? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quais equipamentos ou dispositivos médicos a criança usa? (Pode marcar mais de uma opção) *
            </Typography>
            <Controller
              control={control}
              name="equipamentosMedicos"
              render={({ field }) => (
                <View style={styles.checkboxGroup}>
                  {renderCheckboxOption('canula_traqueostomia', 'Cânula de traqueostomia (tubinho que fica no pescoço)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('ventilador_mecanico', 'Ventilador mecânico (aparelho que ajuda ou faz a respiração)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('concentrador_oxigenio', 'Concentrador de oxigênio (aparelho que fornece oxigênio)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('cilindro_oxigenio', 'Cilindro de oxigênio portátil', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('aspirador_secrecoes', 'Aspirador de secreções (aparelho para sugar catarro)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('monitor_saturacao', 'Monitor de saturação (oxímetro que mede o oxigênio no sangue)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('umidificador', 'Umidificador (aparelho que deixa o ar mais úmido)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('gerador_energia', 'Gerador de energia elétrica (para usar quando falta luz)', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('cama_hospitalar', 'Cama hospitalar ou cama especial', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('cadeira_rodas', 'Cadeira de rodas', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('outros_equipamentos', 'Outros equipamentos médicos', field.value, 'equipamentosMedicos')}
                  {renderCheckboxOption('nenhum_equipamento', 'Nenhum equipamento específico além da cânula', field.value, 'equipamentosMedicos')}
                </View>
              )}
            />
            {errors.equipamentosMedicos && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.equipamentosMedicos.message}
              </Typography>
            )}
          </View>

          {/* Especificar outros equipamentos (condicional) */}
          {watchEquipamentosMedicos?.includes('outros_equipamentos') && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Especifique quais outros equipamentos médicos *
              </Typography>
              <Controller
                control={control}
                name="outrosEquipamentos"
                render={({ field }) => (
                  <Input
                    placeholder="Descreva os outros equipamentos"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    error={errors.outrosEquipamentos?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Seção 5: Acompanhamento Médico e Dificuldades */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 5: Acompanhamento Médico e Dificuldades
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Informações sobre cuidados médicos e barreiras de acesso
            </Typography>
          </View>

          {/* Quantas vezes a criança precisou ficar internada no hospital depois que fez a traqueostomia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quantas vezes a criança precisou ficar internada no hospital depois que fez a traqueostomia? *
            </Typography>
            <Controller
              control={control}
              name="internacoesPosTraqueostomia"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'nenhuma', 'Nenhuma vez')}
                  {renderRadioOption(field, '1_a_5', '1 a 5 vezes')}
                  {renderRadioOption(field, 'mais_de_5', 'Mais de 5 vezes')}
                  {renderRadioOption(field, 'nao_sei_internacoes', 'Não sei informar')}
                </View>
              )}
            />
            {errors.internacoesPosTraqueostomia && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.internacoesPosTraqueostomia.message}
              </Typography>
            )}
          </View>

          {/* Atualmente, a criança tem acompanhamento regular com quais médicos ou terapeutas? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Atualmente, a criança tem acompanhamento regular com quais médicos ou terapeutas? (Pode marcar mais de uma opção) *
            </Typography>
            <Controller
              control={control}
              name="acompanhamentoMedico"
              render={({ field }) => (
                <View style={styles.checkboxGroup}>
                  {renderCheckboxOption('pediatra', 'Pediatra', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('otorrinolaringologista', 'Otorrinolaringologista (Médico de ouvido, nariz e garganta)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('pneumologista', 'Pneumologista (Médico de pulmão)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('cirurgiao_toracico', 'Cirurgião torácico (cirurgião do pulmão)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('cirurgiao_pediatrico', 'Cirurgião Pediátrico (cirurgião de crianças)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('cirurgiao_geral', 'Cirurgião geral (cirurgião geral não subespecializado)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('neurologista', 'Neurologista (Médico de nervos e cérebro)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('fonoaudiologo', 'Fonoaudiólogo (Terapeuta da fala e deglutição)', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('fisioterapeuta', 'Fisioterapeuta Respiratório/Motor', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('nutricionista', 'Nutricionista', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('outro_especialista', 'Outro especialista', field.value, 'acompanhamentoMedico')}
                  {renderCheckboxOption('nao_tem_acompanhamento', 'Não tem acompanhamento regular com especialista', field.value, 'acompanhamentoMedico')}
                </View>
              )}
            />
            {errors.acompanhamentoMedico && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.acompanhamentoMedico.message}
              </Typography>
            )}
          </View>

          {/* Especificar outro especialista (condicional) */}
          {watchAcompanhamentoMedico?.includes('outro_especialista') && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Especifique qual outro especialista *
              </Typography>
              <Controller
                control={control}
                name="outroEspecialista"
                render={({ field }) => (
                  <Input
                    placeholder="Ex: Cardiologista, Endocrinologista, etc."
                    value={field.value}
                    onChangeText={field.onChange}
                    style={styles.input}
                    error={errors.outroEspecialista?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Quais são as maiores dificuldades para conseguir ou chegar aos atendimentos médicos e terapias? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quais são as maiores dificuldades para conseguir ou chegar aos atendimentos médicos e terapias? (Pode marcar mais de uma opção) *
            </Typography>
            <Controller
              control={control}
              name="dificuldadesAtendimento"
              render={({ field }) => (
                <View style={styles.checkboxGroup}>
                  {renderCheckboxOption('falta_transporte', 'Dificuldade ou falta de transporte', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('muito_caro', 'É muito caro (custos)', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('demora_consulta', 'Demora muito para conseguir consulta/atendimento', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('especialista_longe', 'Não tem especialista perto de onde moramos', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('falta_informacao', 'Falta de informação sobre onde procurar ajuda', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('outra_dificuldade', 'Outra dificuldade', field.value, 'dificuldadesAtendimento')}
                  {renderCheckboxOption('nao_tem_dificuldades', 'Não temos dificuldades para acessar os cuidados', field.value, 'dificuldadesAtendimento')}
                </View>
              )}
            />
            {errors.dificuldadesAtendimento && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.dificuldadesAtendimento.message}
              </Typography>
            )}
          </View>

          {/* Especificar outra dificuldade (condicional) */}
          {watchDificuldadesAtendimento?.includes('outra_dificuldade') && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Especifique qual outra dificuldade *
              </Typography>
              <Controller
                control={control}
                name="outraDificuldade"
                render={({ field }) => (
                  <Input
                    placeholder="Descreva a dificuldade"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    error={errors.outraDificuldade?.message}
                  />
                )}
              />
            </View>
          )}

          {/* Seção 6: Cuidados Diários em Casa */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 6: Cuidados Diários em Casa
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Informações sobre o cuidado cotidiano da criança
            </Typography>
          </View>

          {/* Quem é a pessoa que mais cuida da criança no dia a dia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quem é a pessoa que mais cuida da criança no dia a dia? *
            </Typography>
            <Controller
              control={control}
              name="principalCuidador"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'pai', 'Pai')}
                  {renderRadioOption(field, 'mae', 'Mãe')}
                  {renderRadioOption(field, 'outro_familiar', 'Outro familiar')}
                  {renderRadioOption(field, 'cuidador_profissional', 'Cuidador(a) profissional / Contratado(a)')}
                </View>
              )}
            />
            {errors.principalCuidador && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.principalCuidador.message}
              </Typography>
            )}
          </View>

          {/* Em média, quantas horas por dia são dedicadas especificamente aos cuidados da traqueostomia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Em média, quantas horas por dia são dedicadas especificamente aos cuidados da traqueostomia e dos aparelhos que a criança usa? *
            </Typography>
            <Controller
              control={control}
              name="horasCuidadosDiarios"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'menos_1_hora', 'Menos de 1 hora por dia')}
                  {renderRadioOption(field, 'entre_1_3_horas', 'Entre 1 e 3 horas por dia')}
                  {renderRadioOption(field, 'mais_3_horas', 'Mais de 3 horas por dia')}
                </View>
              )}
            />
            {errors.horasCuidadosDiarios && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.horasCuidadosDiarios.message}
              </Typography>
            )}
          </View>

          {/* Você recebeu treinamento suficiente no hospital sobre como cuidar da traqueostomia? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Você recebeu treinamento suficiente no hospital sobre como cuidar da traqueostomia da criança antes de ir para casa? *
            </Typography>
            <Controller
              control={control}
              name="treinamentoHospital"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim_seguro', 'Sim, me sinto seguro(a)')}
                  {renderRadioOption(field, 'sim_com_duvidas', 'Sim, mas ainda tenho muitas dúvidas')}
                  {renderRadioOption(field, 'nao_suficiente', 'Não recebi treinamento suficiente')}
                  {renderRadioOption(field, 'nao_recebi', 'Não recebi treinamento nenhum')}
                </View>
              )}
            />
            {errors.treinamentoHospital && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.treinamentoHospital.message}
              </Typography>
            )}
          </View>

          {/* Seção 7: Acesso a Recursos e Suporte Social */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 7: Acesso a Recursos e Suporte Social
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Informações sobre benefícios e acesso a materiais de cuidado
            </Typography>
          </View>

          {/* A família recebe algum benefício ou ajuda financeira do governo? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              A família recebe algum benefício ou ajuda financeira do governo (federal, estadual, municipal) por causa da condição da criança? *
            </Typography>
            <Controller
              control={control}
              name="beneficioFinanceiro"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sim', 'Sim')}
                  {renderRadioOption(field, 'nao', 'Não')}
                </View>
              )}
            />
            {errors.beneficioFinanceiro && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.beneficioFinanceiro.message}
              </Typography>
            )}
          </View>

          {/* Qual benefício? (condicional) */}
          {watchBeneficioFinanceiro === 'sim' && (
            <View style={styles.fieldContainer}>
              <Typography variant="caption" style={styles.fieldLabel}>
                Qual benefício ou ajuda financeira recebe? *
              </Typography>
              <Controller
                control={control}
                name="qualBeneficio"
                render={({ field }) => (
                  <Input
                    placeholder="Ex: BPC, Auxílio Brasil, Bolsa Família, auxílio municipal, etc."
                    value={field.value}
                    onChangeText={field.onChange}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={2}
                    error={errors.qualBeneficio?.message}
                  />
                )}
              />
            </View>
          )}

          {/* A família tem acesso fácil aos materiais necessários? */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              A família tem acesso fácil aos materiais necessários para os cuidados da traqueostomia (ex: cânulas, sondas de aspiração, gaze, soro fisiológico)? *
            </Typography>
            <Controller
              control={control}
              name="acessoMateriais"
              render={({ field }) => (
                <View style={styles.radioGroup}>
                  {renderRadioOption(field, 'sempre_conseguimos', 'Sim, sempre conseguimos')}
                  {renderRadioOption(field, 'as_vezes', 'Às vezes conseguimos, às vezes falta')}
                  {renderRadioOption(field, 'muita_dificuldade', 'Temos muita dificuldade para conseguir')}
                  {renderRadioOption(field, 'nao_conseguimos', 'Não conseguimos')}
                </View>
              )}
            />
            {errors.acessoMateriais && (
              <Typography variant="caption" style={styles.errorText}>
                {errors.acessoMateriais.message}
              </Typography>
            )}
          </View>

          {/* Seção 8: Observações Adicionais */}
          <View style={styles.sectionHeader}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Seção 8: Observações Adicionais
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              Espaço livre para informações adicionais que considere importantes
            </Typography>
          </View>

          {/* Observações adicionais */}
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Existe algo mais que você gostaria de contar sobre a criança, os cuidados ou as dificuldades que enfrentam?
            </Typography>
            <Typography variant="caption" style={styles.helpNote}>
              Este campo é opcional. Use este espaço para compartilhar qualquer informação adicional que considere relevante sobre a situação da criança ou da família.
            </Typography>
            <Controller
              control={control}
              name="observacoesAdicionais"
              render={({ field }) => (
                <Input
                  placeholder="Escreva aqui suas observações, dificuldades específicas, sucessos, ou qualquer outra informação que considere importante..."
                  value={field.value}
                  onChangeText={field.onChange}
                  style={[styles.input, styles.textArea, styles.largeTextArea]}
                  multiline
                  numberOfLines={6}
                  error={errors.observacoesAdicionais?.message}
                />
              )}
            />
          </View>

          {/* Botão de Finalizar */}
          <View style={styles.buttonContainer}>
            <Button
              title="Finalizar Cadastro"
              onPress={handleSubmit(handleFormSubmit)}
              loading={isLoading}
              fullWidth
              style={styles.continueButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de Ajuda do SUS */}
      <SUSHelpModal
        visible={showSUSHelp}
        onClose={() => setShowSUSHelp(false)}
      />

      {/* Modal de Seleção de Estado */}
      <Modal
        visible={showEstadoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEstadoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>
                Selecione o Estado
              </Typography>
              <TouchableOpacity
                onPress={() => setShowEstadoModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.neutral[500]} />
              <TextInput
                placeholder="Digite para buscar estado..."
                placeholderTextColor={Colors.neutral[500]}
                value={searchEstado}
                onChangeText={setSearchEstado}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={estadosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setValue('estadoNascimento', item.sigla);
                    setShowEstadoModal(false);
                  }}
                >
                  <Typography variant="body" style={styles.modalOptionText}>
                    {item.nome} ({item.sigla})
                  </Typography>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Typography variant="body" style={styles.emptyText}>
                    Nenhum estado encontrado
                  </Typography>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Cidade */}
      <Modal
        visible={showCidadeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCidadeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>
                Selecione a Cidade
              </Typography>
              <TouchableOpacity
                onPress={() => setShowCidadeModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.neutral[500]} />
              <TextInput
                placeholder="Digite para buscar cidade..."
                placeholderTextColor={Colors.neutral[500]}
                value={searchCidade}
                onChangeText={setSearchCidade}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={cidadesFiltradas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setValue('cidadeNascimento', item.nome);
                    setShowCidadeModal(false);
                  }}
                >
                  <Typography variant="body" style={styles.modalOptionText}>
                    {item.nome}
                  </Typography>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Typography variant="body" style={styles.emptyText}>
                    Nenhuma cidade encontrada
                  </Typography>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: Sizes.spacing.lg,
  },
  sectionHeader: {
    marginBottom: Sizes.spacing.xl,
    paddingBottom: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  sectionTitle: {
    color: Colors.neutral[800],
    marginBottom: Sizes.spacing.xs,
  },
  sectionSubtitle: {
    color: Colors.neutral[600],
  },
  fieldContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  fieldLabel: {
    color: Colors.neutral[700],
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  radioGroup: {
    marginTop: Sizes.spacing.xs,
  },
  radioOption: {
    marginBottom: Sizes.spacing.sm,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Sizes.spacing.md,
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    marginRight: Sizes.spacing.md,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.vapapp.teal,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.vapapp.teal,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    color: Colors.neutral[800],
    fontWeight: '500',
  },
  radioDescription: {
    color: Colors.neutral[600],
    marginTop: 2,
  },
  errorText: {
    color: Colors.error?.[500] || '#ef4444',
    marginTop: Sizes.spacing.xs,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: Sizes.spacing.xl,
    paddingTop: Sizes.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  continueButton: {
    backgroundColor: Colors.vapapp.teal,
  },
  helpButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Sizes.spacing.sm,
    paddingVertical: Sizes.spacing.sm,
    paddingHorizontal: Sizes.spacing.md,
    backgroundColor: Colors.vapapp.teal + '10',
    borderRadius: Sizes.radius.md,
    borderWidth: 1,
    borderColor: Colors.vapapp.teal + '30',
  },
  helpTextBottom: {
    color: Colors.vapapp.teal,
    marginLeft: Sizes.spacing.sm,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  dropdownButton: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  dropdownDisabled: {
    backgroundColor: Colors.neutral[50],
    opacity: 0.6,
  },
  dropdownText: {
    flex: 1,
    color: Colors.neutral[800],
  },
  placeholderText: {
    color: Colors.neutral[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: Sizes.radius.xl,
    borderTopRightRadius: Sizes.radius.xl,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    color: Colors.neutral[800],
    flex: 1,
  },
  modalOption: {
    padding: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalOptionText: {
    color: Colors.neutral[800],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[50],
  },
  searchInput: {
    flex: 1,
    marginLeft: Sizes.spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: Sizes.radius.md,
    paddingHorizontal: Sizes.spacing.md,
    paddingVertical: Sizes.spacing.sm,
    fontSize: 16,
    color: Colors.neutral[800],
    minHeight: 40,
  },
  emptyContainer: {
    padding: Sizes.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  helpNote: {
    color: Colors.neutral[500],
    fontSize: 12,
    marginTop: Sizes.spacing.xs,
    fontStyle: 'italic',
  },
  importantNote: {
    color: Colors.vapapp.teal,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Sizes.spacing.md,
    marginTop: Sizes.spacing.sm,
    textAlign: 'center',
    backgroundColor: Colors.vapapp.teal + '10',
    padding: Sizes.spacing.sm,
    borderRadius: Sizes.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.vapapp.teal,
  },
  checkboxGroup: {
    marginTop: Sizes.spacing.xs,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.spacing.sm,
    padding: Sizes.spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    marginRight: Sizes.spacing.md,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[0],
  },
  checkboxSelected: {
    borderColor: Colors.vapapp.teal,
    backgroundColor: Colors.vapapp.teal,
  },
  checkboxLabel: {
    flex: 1,
    color: Colors.neutral[800],
    lineHeight: 20,
  },
});