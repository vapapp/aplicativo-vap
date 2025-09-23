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
import { Button, Typography, Input, ProgressBar } from '../ui';
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

// Validação para cada seção separadamente
const sectionSchemas = {
  1: yup.object().shape({
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
  }),

  2: yup.object().shape({
    nomePai: yup
      .string()
      .test('pelo-menos-um-nome', 'Preencha pelo menos um nome: Pai, Mãe ou Responsável Legal', function(value) {
        const { nomeMae, nomeResponsavel } = this.parent;
        return !!(value || nomeMae || nomeResponsavel);
      }),
    nomeMae: yup.string(),
    nomeResponsavel: yup.string(),
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
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido. Use (00) 00000-0000'),
    cep: yup
      .string()
      .required('CEP é obrigatório')
      .matches(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
    rua: yup
      .string()
      .required('Rua é obrigatória'),
    numero: yup
      .string()
      .required('Número é obrigatório'),
    bairro: yup
      .string()
      .required('Bairro é obrigatório'),
    cidadeEndereco: yup
      .string()
      .required('Cidade é obrigatória'),
    estadoEndereco: yup
      .string()
      .required('Estado é obrigatório'),
    nivelEstudo: yup
      .string()
      .oneOf(['nao_estudei', 'fundamental_incompleto', 'fundamental_completo', 'medio_incompleto', 'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao'], 'Selecione o nível de estudo')
      .required('Nível de estudo é obrigatório'),
  }),

  // Continua com as outras seções...
  3: yup.object().shape({
    gravidezPlanejada: yup
      .string()
      .oneOf(['sim', 'nao', 'nao_sei'], 'Selecione uma opção')
      .required('Esta informação é obrigatória'),
    acompanhamentoPreNatal: yup
      .string()
      .oneOf(['sim', 'nao'], 'Selecione sim ou não')
      .required('Esta informação é obrigatória'),
    quantidadeConsultas: yup
      .string()
      .when('acompanhamentoPreNatal', {
        is: 'sim',
        then: (schema) => schema
          .oneOf(['nenhuma', 'menos_5', 'entre_5_7', '8_ou_mais'], 'Selecione a quantidade de consultas')
          .required('Quantidade de consultas é obrigatória'),
        otherwise: (schema) => schema.notRequired(),
      }),
    problemasGravidez: yup
      .array()
      .of(yup.string())
      .min(1, 'Selecione pelo menos uma opção')
      .default([]),
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
  }),

  4: yup.object().shape({
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
  }),

  5: yup.object().shape({
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
  }),

  6: yup.object().shape({
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
  }),

  7: yup.object().shape({
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
  }),

  8: yup.object().shape({
    observacoesAdicionais: yup
      .string()
      .notRequired(),
  }),
};

// Títulos das seções
const sectionTitles = {
  1: 'Informações da Criança',
  2: 'Informações dos Responsáveis',
  3: 'Gestação e Parto',
  4: 'Condição Clínica e Traqueostomia',
  5: 'Acompanhamento Médico',
  6: 'Cuidados Diários',
  7: 'Recursos e Suporte Social',
  8: 'Observações Adicionais',
};

interface ChildRegistrationFormProps {
  onSubmit: (data: ChildFormData) => Promise<void>;
}

export const ChildRegistrationForm: React.FC<ChildRegistrationFormProps> = ({
  onSubmit,
}) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Estados para modais e APIs
  const [showSUSHelp, setShowSUSHelp] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [searchEstado, setSearchEstado] = useState('');
  const [searchCidade, setSearchCidade] = useState('');

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch: watchForm,
    setValue,
    trigger,
    getValues,
  } = useForm<ChildFormData>({
    mode: 'onChange',
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
      idadeTraqueostomia: '',
      motivosTraqueostomia: [],
      outroMotivoTraqueostomia: '',
      tipoTraqueostomia: '',
      equipamentosMedicos: [],
      outrosEquipamentos: '',
      internacoesPosTraqueostomia: '',
      acompanhamentoMedico: [],
      outroEspecialista: '',
      dificuldadesAtendimento: [],
      outraDificuldade: '',
      principalCuidador: '',
      horasCuidadosDiarios: '',
      treinamentoHospital: '',
      beneficioFinanceiro: '',
      qualBeneficio: '',
      acessoMateriais: '',
      observacoesAdicionais: '',
    },
  });

  // Watchers para campos condicionais
  const watchComplicacoesParto = watchForm('complicacoesParto');
  const watchEstadoNascimento = watchForm('estadoNascimento');

  // Funções de formatação
  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (!match) return text;
    const [, day, month, year] = match;
    let formatted = day;
    if (month) formatted += `/${month}`;
    if (year) formatted += `/${year}`;
    return formatted;
  };

  const formatSUS = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.substring(0, 15);
  };

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

  // Carregar estados quando componente monta
  useEffect(() => {
    fetchEstados();
  }, []);

  // Carregar cidades quando estado muda
  useEffect(() => {
    if (watchEstadoNascimento) {
      const estadoSelecionado = estados.find(estado => estado.nome === watchEstadoNascimento);
      if (estadoSelecionado) {
        fetchCidades(estadoSelecionado.sigla);
      }
    }
  }, [watchEstadoNascimento, estados]);

  // Renderizar opção de radio button
  const renderRadioOption = (field: any, value: string, label: string, description?: string) => {
    return (
      <TouchableOpacity
        key={value}
        style={styles.radioOption}
        onPress={() => field.onChange(value)}
      >
        <View style={styles.radioButton}>
          <View style={[styles.radioCircle, field.value === value && styles.radioCircleSelected]}>
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

  // Limpar busca ao abrir modals
  const abrirModalEstado = () => {
    setSearchEstado('');
    setShowEstadoModal(true);
  };

  const abrirModalCidade = () => {
    setSearchCidade('');
    setShowCidadeModal(true);
  };

  // Função para validar seção atual
  const validateCurrentSection = async () => {
    const currentData = getValues();
    const currentSchema = sectionSchemas[currentSection as keyof typeof sectionSchemas];

    try {
      await currentSchema.validate(currentData, { abortEarly: false });
      return true;
    } catch (error: any) {
      // Mostrar erros de validação
      if (error.inner) {
        error.inner.forEach((err: any) => {
          console.log(`Erro no campo ${err.path}: ${err.message}`);
        });
      }
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios desta seção.');
      return false;
    }
  };

  // Navegação entre seções
  const handleNextSection = async () => {
    const isValid = await validateCurrentSection();

    if (isValid) {
      // Marcar seção atual como completa
      if (!completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
      }

      if (currentSection < 8) {
        setCurrentSection(currentSection + 1);
      } else {
        // Finalizar formulário
        const formData = getValues();
        setIsLoading(true);
        try {
          await onSubmit(formData);
        } catch (error) {
          Alert.alert('Erro', 'Erro ao salvar os dados. Tente novamente.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Função para renderizar a seção atual
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return renderSection1();
      case 2:
        return renderSection2();
      case 3:
        return renderSection3();
      case 4:
        return renderSection4();
      case 5:
        return renderSection5();
      case 6:
        return renderSection6();
      case 7:
        return renderSection7();
      case 8:
        return renderSection8();
      default:
        return null;
    }
  };

  // Seção 1: Informações da Criança
  const renderSection1 = () => {
    return (
      <View style={styles.sectionContainer}>
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
                placeholder="Digite o nome completo da criança"
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
            Data de nascimento *
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
            Número do Cartão SUS (15 dígitos) *
          </Typography>
          <Controller
            control={control}
            name="numeroSUS"
            render={({ field }) => (
              <Input
                placeholder="000 0000 0000 0000"
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
            style={styles.helpButton}
            onPress={() => setShowSUSHelp(true)}
          >
            <Ionicons name="help-circle-outline" size={18} color={Colors.vapapp.teal} />
            <Typography variant="caption" style={styles.helpText}>
              Não sei onde encontrar o número do SUS
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Estado de Nascimento */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Estado onde a criança nasceu *
          </Typography>
          <Controller
            control={control}
            name="estadoNascimento"
            render={({ field }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  loadingEstados && styles.dropdownDisabled
                ]}
                onPress={loadingEstados ? undefined : abrirModalEstado}
                disabled={loadingEstados}
              >
                <Typography
                  variant="body"
                  style={[
                    styles.dropdownText,
                    !field.value && styles.placeholderText
                  ]}
                >
                  {field.value || 'Selecione o estado'}
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

        {/* Cidade de Nascimento */}
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
                onPress={watchEstadoNascimento && !loadingCidades ? abrirModalCidade : undefined}
                disabled={!watchEstadoNascimento || loadingCidades}
              >
                <Typography
                  variant="body"
                  style={[
                    styles.dropdownText,
                    !field.value && styles.placeholderText
                  ]}
                >
                  {loadingCidades
                    ? 'Carregando cidades...'
                    : field.value || 'Selecione a cidade'}
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
            Peso ao nascer (em gramas) *
          </Typography>
          <Controller
            control={control}
            name="pesoNascer"
            render={({ field }) => (
              <Input
                placeholder="Ex: 3200"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                style={styles.input}
                error={errors.pesoNascer?.message}
              />
            )}
          />
        </View>

        {/* Semanas de Prematuridade */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Com quantas semanas de gestação a criança nasceu? *
          </Typography>
          <Controller
            control={control}
            name="semanasPrematuridade"
            render={({ field }) => (
              <View style={styles.radioGroup}>
                {renderRadioOption(field, 'menos_28', 'Menos de 28 semanas (muito prematuro)')}
                {renderRadioOption(field, '28_36', 'Entre 28 e 36 semanas (prematuro)')}
                {renderRadioOption(field, '37_41', 'Entre 37 e 41 semanas (a termo)')}
                {renderRadioOption(field, 'mais_41', 'Mais de 41 semanas (pós-termo)')}
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
            Houve alguma complicação durante o parto ou logo após o nascimento? *
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
              Explique brevemente quais foram as complicações *
            </Typography>
            <Controller
              control={control}
              name="complicacoesDetalhes"
              render={({ field }) => (
                <Input
                  placeholder="Descreva as complicações que ocorreram"
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
      </View>
    );
  };

  // Outras seções serão implementadas similarmente
  const renderSection2 = () => <View style={styles.sectionContainer}><Typography>Seção 2 - Em desenvolvimento</Typography></View>;
  const renderSection3 = () => <View style={styles.sectionContainer}><Typography>Seção 3 - Em desenvolvimento</Typography></View>;
  const renderSection4 = () => <View style={styles.sectionContainer}><Typography>Seção 4 - Em desenvolvimento</Typography></View>;
  const renderSection5 = () => <View style={styles.sectionContainer}><Typography>Seção 5 - Em desenvolvimento</Typography></View>;
  const renderSection6 = () => <View style={styles.sectionContainer}><Typography>Seção 6 - Em desenvolvimento</Typography></View>;
  const renderSection7 = () => <View style={styles.sectionContainer}><Typography>Seção 7 - Em desenvolvimento</Typography></View>;
  const renderSection8 = () => <View style={styles.sectionContainer}><Typography>Seção 8 - Em desenvolvimento</Typography></View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Barra de Progresso */}
      <ProgressBar
        currentStep={currentSection}
        totalSteps={8}
        sectionTitle={sectionTitles[currentSection as keyof typeof sectionTitles]}
      />

      {/* Conteúdo da Seção */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {renderCurrentSection()}
        </View>
      </ScrollView>

      {/* Botões de Navegação */}
      <View style={styles.navigationContainer}>
        {currentSection > 1 && (
          <Button
            title="Anterior"
            onPress={handlePreviousSection}
            variant="outline"
            style={styles.previousButton}
          />
        )}

        <Button
          title={currentSection === 8 ? 'Finalizar Cadastro' : 'Próximo'}
          onPress={handleNextSection}
          loading={isLoading}
          style={[styles.nextButton, currentSection === 1 && styles.fullWidthButton]}
        />
      </View>

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
                    setValue('estadoNascimento', item.nome);
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
  sectionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.lg,
  },
  sectionTitle: {
    color: Colors.neutral[800],
    marginBottom: Sizes.spacing.xs,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Sizes.spacing.xl,
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
  helpButton: {
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
  helpText: {
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
  closeButton: {
    padding: 8,
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
  navigationContainer: {
    flexDirection: 'row',
    padding: Sizes.spacing.lg,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: Sizes.spacing.md,
  },
  previousButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.vapapp.teal,
  },
  fullWidthButton: {
    flex: 2,
  },
});