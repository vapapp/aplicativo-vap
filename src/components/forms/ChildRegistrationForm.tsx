import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA')
      .test('not-future-date', 'Data de nascimento não pode ser futura', function(value) {
        if (!value) return true;
        const [day, month, year] = value.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        return birthDate <= today;
      })
      .test('minimum-age-for-tracheostomy', 'Data muito recente para ter traqueostomia', function(value) {
        if (!value) return true;
        const [day, month, year] = value.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        // Criança deve ter pelo menos 0 dias (nascimento válido)
        return ageInDays >= 0;
      }),
    genero: yup
      .string()
      .oneOf(['masculino', 'feminino'], 'Selecione o gênero')
      .required('Gênero é obrigatório'),
    numeroSUS: yup
      .string()
      .required('Número do SUS é obrigatório')
      .matches(/^\d{3} \d{4} \d{4} \d{4}$/, 'Formato inválido. Use 000 0000 0000 0000')
      .test('valid-sus', 'Número do SUS inválido - verifique os dígitos', function(value) {
        if (!value) return true;
        const susClean = value.replace(/\D/g, '');
        if (susClean.length !== 15) return false;

        // Validar usando algoritmo do dígito verificador
        const digits = susClean.split('').map(Number);
        const weights1 = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        let sum1 = 0;
        for (let i = 0; i < 15; i++) {
          sum1 += digits[i] * weights1[i];
        }
        const remainder1 = sum1 % 11;
        const expectedCheckDigit = remainder1 < 2 ? 0 : 11 - remainder1;

        // Verificar se o último dígito confere
        return digits[14] === expectedCheckDigit;
      }),
    estadoNascimento: yup
      .string()
      .required('Estado é obrigatório'),
    cidadeNascimento: yup
      .string()
      .required('Cidade é obrigatória'),
    pesoNascer: yup
      .string()
      .required('Peso ao nascer é obrigatório')
      .matches(/^\d+$/, 'Digite apenas números (em gramas)')
      .test('valid-weight', 'Peso deve estar entre 300g e 6000g', function(value) {
        if (!value) return true;
        const weight = parseInt(value);
        return weight >= 300 && weight <= 6000;
      })
      .test('weight-gestational-age-consistency', 'Peso incompatível com semanas de gestação', function(value) {
        if (!value) return true;
        const weight = parseInt(value);
        const gestationalAge = this.parent.semanasPrematuridade;

        if (!gestationalAge) return true;

        // Faixas de peso esperadas por idade gestacional
        switch (gestationalAge) {
          case 'menos_28':
            // Muito prematuro: geralmente 500g - 1500g
            return weight >= 300 && weight <= 1800;
          case '28_36':
            // Prematuro: geralmente 1000g - 3000g
            return weight >= 800 && weight <= 3500;
          case '37_41':
            // A termo: geralmente 2500g - 4500g
            return weight >= 2000 && weight <= 5000;
          case 'mais_41':
            // Pós-termo: geralmente 3000g - 5500g
            return weight >= 2500 && weight <= 6000;
          default:
            return true;
        }
      }),
    semanasPrematuridade: yup
      .string()
      .oneOf(['menos_28', '28_36', '37_41', 'mais_41'], 'Selecione as semanas de gestação')
      .required('Semanas de gestação são obrigatórias')
      .test('gestational-weight-consistency', 'Semanas de gestação incompatíveis com peso informado', function(value) {
        if (!value) return true;
        const weight = parseInt(this.parent.pesoNascer);

        if (!weight) return true;

        // Verificar consistência entre peso e idade gestacional
        switch (value) {
          case 'menos_28':
            // Muito prematuro: peso geralmente baixo
            if (weight > 2500) {
              return this.createError({ message: 'Peso muito alto para bebê muito prematuro (< 28 semanas)' });
            }
            return true;
          case '28_36':
            // Prematuro: peso intermediário
            if (weight > 4000) {
              return this.createError({ message: 'Peso muito alto para bebê prematuro (28-36 semanas)' });
            }
            return true;
          case '37_41':
            // A termo: peso normal
            if (weight < 1800) {
              return this.createError({ message: 'Peso muito baixo para bebê a termo (37-41 semanas)' });
            }
            return true;
          case 'mais_41':
            // Pós-termo: peso geralmente maior
            if (weight < 2000) {
              return this.createError({ message: 'Peso baixo para bebê pós-termo (> 41 semanas)' });
            }
            return true;
          default:
            return true;
        }
      }),
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
      .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA')
      .test('not-future-date', 'Data de nascimento não pode ser futura', function(value) {
        if (!value) return true;
        const [day, month, year] = value.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        return birthDate <= today;
      })
      .test('minimum-age-parent', 'Responsável deve ter pelo menos 14 anos', function(value) {
        if (!value) return true;
        const [day, month, year] = value.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        return finalAge >= 14;
      })
      .test('logical-age-difference', 'Responsável deve ter pelo menos 14 anos a mais que a criança', function(value) {
        if (!value) return true;

        // Buscar data de nascimento da criança das seções anteriores
        const allData = this.options.context?.allSectionsData || {};
        const childBirthDate = allData[1]?.dataNascimento || this.parent.dataNascimento;

        if (!childBirthDate) return true;

        const [childDay, childMonth, childYear] = childBirthDate.split('/');
        const [parentDay, parentMonth, parentYear] = value.split('/');

        const childDate = new Date(parseInt(childYear), parseInt(childMonth) - 1, parseInt(childDay));
        const parentDate = new Date(parseInt(parentYear), parseInt(parentMonth) - 1, parseInt(parentDay));

        // Calcular diferença em anos (responsável deve ser mais velho)
        const ageInYears = (childDate.getTime() - parentDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

        // Responsável deve ser entre 14 e 70 anos mais velho que a criança
        return ageInYears >= -70 && ageInYears <= -14;
      }),
    telefoneContato: yup
      .string()
      .required('Telefone é obrigatório')
      .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido. Use (00) 00000-0000 ou (00) 0000-0000')
      .test('valid-ddd', 'DDD inválido. Use um DDD brasileiro válido (11-99)', function(value) {
        if (!value) return true;
        const dddMatch = value.match(/^\((\d{2})\)/);
        if (!dddMatch) return false;
        const ddd = parseInt(dddMatch[1]);
        // DDDs válidos no Brasil: 11-19 (SP), 21-24,27-28 (RJ/ES), 31-38 (MG), 41-49 (PR/SC), 51-55 (RS), 61-68 (DF/GO/TO/MT/MS), 71-75,77 (BA/SE), 81-89 (PE/AL/PB/RN), 91-98 (PA/AM/AP/RR/AC/RO)
        const validDDDs = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
        return validDDDs.includes(ddd);
      })
      .test('valid-phone-format', 'Número de telefone inválido', function(value) {
        if (!value) return true;
        const phoneMatch = value.match(/^\(\d{2}\) (\d{4,5})-(\d{4})$/);
        if (!phoneMatch) return false;
        const number = phoneMatch[1];

        // Celular deve ter 5 dígitos na primeira parte e começar com 9
        if (number.length === 5) {
          return number.startsWith('9');
        }
        // Telefone fixo deve ter 4 dígitos e não começar com 9
        else if (number.length === 4) {
          return !number.startsWith('9');
        }
        return false;
      }),
    cep: yup
      .string()
      .required('CEP é obrigatório')
      .matches(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000')
      .test('valid-cep', 'CEP inválido. Verifique se o CEP existe', function(value) {
        if (!value) return true;
        const cepClean = value.replace(/\D/g, '');

        // Verificar se não é um CEP conhecido como inválido
        if (cepClean === '00000000' || cepClean === '11111111' || cepClean === '22222222' ||
            cepClean === '33333333' || cepClean === '44444444' || cepClean === '55555555' ||
            cepClean === '66666666' || cepClean === '77777777' || cepClean === '88888888' ||
            cepClean === '99999999' || cepClean === '12345678') {
          return false;
        }

        // Verificar se os primeiros dígitos estão em uma faixa válida (01000-99999)
        const firstFive = parseInt(cepClean.substring(0, 5));
        if (firstFive < 1000 || firstFive > 99999) {
          return false;
        }

        // Validar o padrão regional dos CEPs brasileiros
        const regionalCEPs = {
          // SP: 01000-19999
          'SP': { min: 1000, max: 19999 },
          // RJ: 20000-28999
          'RJ': { min: 20000, max: 28999 },
          // ES: 29000-29999
          'ES': { min: 29000, max: 29999 },
          // MG: 30000-39999
          'MG': { min: 30000, max: 39999 },
          // BA: 40000-48999
          'BA': { min: 40000, max: 48999 },
          // SE: 49000-49999
          'SE': { min: 49000, max: 49999 },
          // PE, AL, PB, RN: 50000-59999
          'PE': { min: 50000, max: 59999 },
          // CE, PI, MA, PA, AM, RR, AP, AC, RO: 60000-69999
          'CE': { min: 60000, max: 69999 },
          // DF, GO, TO, MT, MS: 70000-79999
          'DF': { min: 70000, max: 79999 },
          // RS: 90000-99999
          'RS': { min: 90000, max: 99999 },
          // SC, PR: 80000-89999
          'SC': { min: 80000, max: 89999 }
        };

        // Verificar se está dentro de uma faixa regional válida
        const isValidRegion = Object.values(regionalCEPs).some(range =>
          firstFive >= range.min && firstFive <= range.max
        );

        return isValidRegion;
      }),
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
      .required('Idade da traqueostomia é obrigatória')
      .test('logical-tracheostomy-age', 'Idade da traqueostomia incompatível com data de nascimento da criança', function(value) {
        if (!value || value === 'nao_sei') return true;

        // Buscar data de nascimento das seções anteriores
        const allData = this.options.context?.allSectionsData || {};
        const childBirthDate = allData[1]?.dataNascimento;

        if (!childBirthDate) return true;

        const [day, month, year] = childBirthDate.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

        switch (value) {
          case 'nascimento':
            // Se foi logo após nascimento, criança deve ter pelo menos alguns dias
            return ageInMonths >= 0;
          case 'primeiro_mes':
            // Se foi no primeiro mês, criança deve ter pelo menos 1 mês
            return ageInMonths >= 1;
          case 'primeiros_6_meses':
            // Se foi nos primeiros 6 meses, criança deve ter pelo menos 6 meses
            return ageInMonths >= 6;
          case 'primeiro_ano':
            // Se foi no primeiro ano, criança deve ter pelo menos 12 meses
            return ageInMonths >= 12;
          case 'apos_primeiro_ano':
            // Se foi após o primeiro ano, criança deve ter mais de 12 meses
            return ageInMonths > 12;
          default:
            return true;
        }
      }),
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
      .max(300, 'Máximo de 300 caracteres permitidos')
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
  // Referência para controle do ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Estado para armazenar dados por seção
  const [sectionsData, setSectionsData] = useState<{ [key: number]: Partial<ChildFormData> }>({});

  // Estados para modais e APIs
  const [showSUSHelp, setShowSUSHelp] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [showEstadoEnderecoModal, setShowEstadoEnderecoModal] = useState(false);
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
    reset,
    setError,
    clearErrors,
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

  // Função para carregar dados de uma seção específica
  const loadSectionDataOnce = (section: number) => {
    const sectionData = sectionsData[section];
    console.log(`LoadOnce: Carregando dados da seção ${section}:`, sectionData);

    if (sectionData) {
      // Carregar dados de forma robusta, garantindo que todos os campos sejam devidamente preenchidos
      Object.keys(sectionData).forEach(key => {
        const value = (sectionData as any)[key];
        // Usar setValue com configurações adequadas para garantir atualização correta
        setValue(key as any, value, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false
        });
        console.log(`LoadOnce: Definindo ${key} = ${value}`);
      });

      // Forçar re-render para garantir que os inputs sejam atualizados
      setTimeout(() => {
        trigger();
      }, 50);
    }
  };

  // Função para rolar suavemente para o topo
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: 0,
        animated: true,
      });
    }
  };

  // Função para rolar para o primeiro campo com erro
  const scrollToFirstError = (fieldName: string) => {
    if (scrollViewRef.current) {
      // Mapeamento de campos para posições aproximadas (em pixels)
      const fieldPositions: { [key: string]: number } = {
        // Seção 1
        nomeCompleto: 0,
        dataNascimento: 100,
        genero: 200,
        numeroSUS: 350,
        estadoNascimento: 500,
        cidadeNascimento: 650,
        pesoNascer: 800,
        semanasPrematuridade: 950,
        complicacoesParto: 1100,
        complicacoesDetalhes: 1250,

        // Seção 2
        nomePai: 0,
        nomeMae: 150,
        nomeResponsavel: 300,
        parentesco: 450,
        outroParentesco: 600,
        dataNascimentoResponsavel: 750,
        telefoneContato: 900,
        cep: 1050,

        // Outros campos das outras seções...
      };

      const position = fieldPositions[fieldName] || 0;

      // Pequeno delay para dar tempo da validação processar
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: position,
          animated: true,
        });
      }, 100);
    }
  };

  // Função genérica para limpar erro de um campo
  const handleFieldChange = (fieldName: string, value: any, onChange: (value: any) => void) => {
    onChange(value);
    // Limpar erro quando usuário começar a digitar/selecionar
    if (errors[fieldName as keyof typeof errors]) {
      clearErrors(fieldName as any);
    }
  };

  // Watchers para campos condicionais
  const watchComplicacoesParto = watchForm('complicacoesParto');
  const watchEstadoNascimento = watchForm('estadoNascimento');
  const watchParentesco = watchForm('parentesco');
  const watchCep = watchForm('cep');
  const watchAcompanhamentoPreNatal = watchForm('acompanhamentoPreNatal');
  const watchProblemasGravidez = watchForm('problemasGravidez');
  const watchAjudaEspecialRespiracao = watchForm('ajudaEspecialRespiracao');
  const watchMotivosTraqueostomia = watchForm('motivosTraqueostomia');
  const watchEquipamentosMedicos = watchForm('equipamentosMedicos');
  const watchAcompanhamentoMedico = watchForm('acompanhamentoMedico');
  const watchDificuldadesAtendimento = watchForm('dificuldadesAtendimento');
  const watchBeneficioFinanceiro = watchForm('beneficioFinanceiro');

  // Chave para o auto-save
  const DRAFT_KEY = 'child_registration_draft';

  // Auto-save: salvar dados localmente a cada mudança
  useEffect(() => {
    const subscription = watchForm((data) => {
      const saveDraft = async () => {
        try {
          await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({
            ...data,
            lastSaved: new Date().toISOString(),
          }));
          console.log('✅ Rascunho salvo automaticamente');
        } catch (error) {
          console.error('❌ Erro ao salvar rascunho:', error);
        }
      };

      // Debounce para não salvar a cada tecla digitada
      const timeoutId = setTimeout(saveDraft, 1000);
      return () => clearTimeout(timeoutId);
    });

    return subscription.unsubscribe;
  }, [watchForm]);

  // Carregar rascunho salvo ao inicializar
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftData = await AsyncStorage.getItem(DRAFT_KEY);
        if (draftData) {
          const parsedData = JSON.parse(draftData);
          const { lastSaved, ...formData } = parsedData;

          console.log(`📄 Rascunho encontrado (salvo em: ${new Date(lastSaved).toLocaleString()})`);

          // Carregar os dados do rascunho no formulário
          reset(formData as ChildFormData);

          // Atualizar sectionsData com os dados carregados
          setSectionsData({ 1: formData });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar rascunho:', error);
      }
    };

    loadDraft();
  }, [reset]);

  // useEffects para limpeza de campos condicionais
  useEffect(() => {
    if (watchAjudaEspecialRespiracao !== 'sim') {
      setValue('tiposAjudaSalaParto', []);
    }
  }, [watchAjudaEspecialRespiracao, setValue]);

  useEffect(() => {
    if (watchParentesco !== 'outro') {
      setValue('outroParentesco', '');
    }
  }, [watchParentesco, setValue]);

  useEffect(() => {
    if (watchAcompanhamentoPreNatal !== 'sim') {
      setValue('quantidadeConsultas', '');
    }
  }, [watchAcompanhamentoPreNatal, setValue]);

  useEffect(() => {
    if (watchBeneficioFinanceiro !== 'sim') {
      setValue('qualBeneficio', '');
    }
  }, [watchBeneficioFinanceiro, setValue]);

  useEffect(() => {
    const watchComplicacoesParto = watchForm('complicacoesParto');
    if (watchComplicacoesParto !== 'sim') {
      setValue('complicacoesDetalhes', '');
    }
  }, [watchForm, setValue]);

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

  // Função para calcular dígito verificador do SUS
  const calculateSUSCheckDigit = (sus: string): string => {
    if (sus.length !== 15) return sus;

    const digits = sus.split('').map(Number);

    // Primeiro dígito verificador
    const weights1 = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let sum1 = 0;
    for (let i = 0; i < 15; i++) {
      sum1 += digits[i] * weights1[i];
    }
    const remainder1 = sum1 % 11;
    const checkDigit1 = remainder1 < 2 ? 0 : 11 - remainder1;

    return sus + checkDigit1.toString();
  };

  const formatSUS = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.substring(0, 15);

    // Aplicar máscara: 000 0000 0000 0000
    const match = limited.match(/^(\d{0,3})(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (!match) return text;

    const [, part1, part2, part3, part4] = match;
    let formatted = part1;
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += ` ${part3}`;
    if (part4) formatted += ` ${part4}`;

    return formatted;
  };

  const formatTelefone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');

    // Detectar se é celular (11 dígitos) ou fixo (10 dígitos)
    const isCellphone = cleaned.length >= 3 && ['9'].includes(cleaned.charAt(2));

    if (isCellphone || cleaned.length === 11) {
      // Formato celular: (00) 00000-0000
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (!match) return text;

      const [, area, first, second] = match;
      let formatted = '';
      if (area) formatted += `(${area}`;
      if (area && area.length === 2) formatted += ')';
      if (first) formatted += ` ${first}`;
      if (second) formatted += `-${second}`;
      return formatted;
    } else {
      // Formato fixo: (00) 0000-0000
      const match = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
      if (!match) return text;

      const [, area, first, second] = match;
      let formatted = '';
      if (area) formatted += `(${area}`;
      if (area && area.length === 2) formatted += ')';
      if (first) formatted += ` ${first}`;
      if (second) formatted += `-${second}`;
      return formatted;
    }
  };

  const formatCep = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
    if (!match) return text;
    const [, first, second] = match;
    let formatted = first;
    if (second) formatted += `-${second}`;
    return formatted;
  };

  // Função para lidar com checkbox (múltiplas seleções)
  const handleCheckboxChange = (fieldName: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setValue(fieldName as any, newValues);
  };

  // Buscar endereço pelo CEP
  const buscarEnderecoPorCep = async (cep: string) => {
    // Limpar o CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '');

    // Verificar se o CEP tem 8 dígitos válidos
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          // Atualizar campos via setValue
          setValue('rua', data.logradouro || '');
          setValue('bairro', data.bairro || '');
          setValue('cidadeEndereco', data.localidade || '');
          setValue('estadoEndereco', data.uf || '');

          // Atualizar sectionsData para manter a persistência entre seções
          setSectionsData(prevData => ({
            ...prevData,
            [currentSection]: {
              ...prevData[currentSection],
              rua: data.logradouro || '',
              bairro: data.bairro || '',
              cidadeEndereco: data.localidade || '',
              estadoEndereco: data.uf || ''
            }
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar CEP:', error);
      }
    }
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

  // Buscar endereço quando CEP muda
  useEffect(() => {
    if (watchCep) {
      // Só buscar se o CEP tiver 8 dígitos válidos (com ou sem formatação)
      const cepLimpo = watchCep.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarEnderecoPorCep(watchCep);
      }
    }
  }, [watchCep]);

  // Rolar para o topo quando a seção muda
  useEffect(() => {
    // Pequeno delay para garantir que o DOM foi atualizado
    const timer = setTimeout(() => {
      scrollToTop();
    }, 150);

    return () => clearTimeout(timer);
  }, [currentSection]);

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

  // Renderizar opção de checkbox
  const renderCheckboxOption = (
    value: string,
    label: string,
    currentValues: string[],
    fieldName: string
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

  // Limpar busca ao abrir modals
  const abrirModalEstado = () => {
    setSearchEstado('');
    setShowEstadoModal(true);
  };

  const abrirModalCidade = () => {
    setSearchCidade('');
    setShowCidadeModal(true);
  };

  const abrirModalEstadoEndereco = () => {
    setSearchEstado('');
    setShowEstadoEnderecoModal(true);
  };

  // Função que retorna os campos de cada seção
  const getSectionFields = (section: number): string[] => {
    switch (section) {
      case 1:
        return ['nomeCompleto', 'dataNascimento', 'genero', 'numeroSUS', 'estadoNascimento', 'cidadeNascimento', 'pesoNascer', 'semanasPrematuridade', 'complicacoesParto', 'complicacoesDetalhes'];
      case 2:
        return ['nomePai', 'nomeMae', 'nomeResponsavel', 'parentesco', 'outroParentesco', 'dataNascimentoResponsavel', 'telefoneContato', 'cep', 'rua', 'numero', 'bairro', 'cidadeEndereco', 'estadoEndereco', 'nivelEstudo'];
      case 3:
        return ['gravidezPlanejada', 'acompanhamentoPreNatal', 'quantidadeConsultas', 'problemasGravidez', 'outrosProblemasGravidez', 'tipoParto', 'ajudaEspecialRespiracao', 'tiposAjudaSalaParto'];
      case 4:
        return ['idadeTraqueostomia', 'motivosTraqueostomia', 'outroMotivoTraqueostomia', 'tipoTraqueostomia', 'equipamentosMedicos', 'outrosEquipamentos'];
      case 5:
        return ['internacoesPosTraqueostomia', 'acompanhamentoMedico', 'outroEspecialista', 'dificuldadesAtendimento', 'outraDificuldade'];
      case 6:
        return ['principalCuidador', 'horasCuidadosDiarios', 'treinamentoHospital'];
      case 7:
        return ['beneficioFinanceiro', 'qualBeneficio', 'acessoMateriais'];
      case 8:
        return ['observacoesAdicionais'];
      default:
        return [];
    }
  };

  // Função que retorna os campos obrigatórios de cada seção baseado no schema
  const getRequiredFieldsCount = (section: number): number => {
    const schema = sectionSchemas[section as keyof typeof sectionSchemas];
    if (!schema) return 0;

    const currentValues = getValues();
    let requiredCount = 0;

    // Analisar cada campo no schema para determinar se é obrigatório
    const schemaFields = (schema as any).fields;

    Object.keys(schemaFields).forEach(fieldName => {
      const fieldSchema = schemaFields[fieldName];

      // Verificar se o campo é obrigatório
      if (fieldSchema._exclusive && fieldSchema._exclusive.required) {
        requiredCount++;
      }

      // Para campos condicionais (when), verificar se são obrigatórios baseado no valor atual
      if (fieldSchema._whitelist && fieldSchema._whitelist.list && fieldSchema._whitelist.list.length > 0) {
        // Campo com opções limitadas geralmente é obrigatório
        requiredCount++;
      }

      // Para arrays que precisam ter pelo menos 1 item
      if (fieldSchema.type === 'array' && fieldSchema._typeError) {
        const testValue = fieldSchema.tests?.find((test: any) => test.name === 'min');
        if (testValue) {
          requiredCount++;
        }
      }
    });

    // Ajustes manuais baseados no conhecimento dos schemas
    switch (section) {
      case 1:
        return 9; // nomeCompleto, dataNascimento, genero, numeroSUS, estadoNascimento, cidadeNascimento, pesoNascer, semanasPrematuridade, complicacoesParto
      case 2:
        return 10; // parentesco, dataNascimentoResponsavel, telefoneContato, cep, rua, numero, bairro, cidadeEndereco, estadoEndereco, nivelEstudo
      case 3:
        return 4; // gravidezPlanejada, acompanhamentoPreNatal, tipoParto, ajudaEspecialRespiracao
      case 4:
        return 4; // idadeTraqueostomia, motivosTraqueostomia, tipoTraqueostomia, equipamentosMedicos
      case 5:
        return 2; // internacoesPosTraqueostomia, acompanhamentoMedico
      case 6:
        return 3; // principalCuidador, horasCuidadosDiarios, treinamentoHospital
      case 7:
        return 2; // beneficioFinanceiro, acessoMateriais
      case 8:
        return 0; // observacoesAdicionais é opcional
      default:
        return 0;
    }
  };

  // Função que conta quantos campos obrigatórios foram preenchidos na seção atual
  const getFilledRequiredFieldsCount = (section: number): number => {
    const currentValues = getValues();
    let filledCount = 0;

    switch (section) {
      case 1:
        const requiredFields1 = ['nomeCompleto', 'dataNascimento', 'genero', 'numeroSUS', 'estadoNascimento', 'cidadeNascimento', 'pesoNascer', 'semanasPrematuridade', 'complicacoesParto'];
        requiredFields1.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        // Campo condicional: complicacoesDetalhes só é obrigatório se complicacoesParto === 'sim'
        if (currentValues.complicacoesParto === 'sim' && currentValues.complicacoesDetalhes && currentValues.complicacoesDetalhes !== '') {
          // Não adicionar extra, já está incluído no count de complicacoesParto
        }
        break;

      case 2:
        const requiredFields2 = ['parentesco', 'dataNascimentoResponsavel', 'telefoneContato', 'cep', 'rua', 'numero', 'bairro', 'cidadeEndereco', 'estadoEndereco', 'nivelEstudo'];
        requiredFields2.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        break;

      case 3:
        const requiredFields3 = ['gravidezPlanejada', 'acompanhamentoPreNatal', 'tipoParto', 'ajudaEspecialRespiracao'];
        requiredFields3.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        break;

      case 4:
        const requiredFields4 = ['idadeTraqueostomia', 'tipoTraqueostomia'];
        requiredFields4.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        // Arrays obrigatórios
        if (currentValues.motivosTraqueostomia && Array.isArray(currentValues.motivosTraqueostomia) && currentValues.motivosTraqueostomia.length > 0) {
          filledCount++;
        }
        if (currentValues.equipamentosMedicos && Array.isArray(currentValues.equipamentosMedicos) && currentValues.equipamentosMedicos.length > 0) {
          filledCount++;
        }
        break;

      case 5:
        const requiredFields5 = ['internacoesPosTraqueostomia'];
        requiredFields5.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        // Array obrigatório
        if (currentValues.acompanhamentoMedico && Array.isArray(currentValues.acompanhamentoMedico) && currentValues.acompanhamentoMedico.length > 0) {
          filledCount++;
        }
        break;

      case 6:
        const requiredFields6 = ['principalCuidador', 'horasCuidadosDiarios', 'treinamentoHospital'];
        requiredFields6.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        break;

      case 7:
        const requiredFields7 = ['beneficioFinanceiro', 'acessoMateriais'];
        requiredFields7.forEach(field => {
          const value = (currentValues as any)[field];
          if (value && value !== '') filledCount++;
        });
        break;

      case 8:
        // Seção 8 não tem campos obrigatórios
        filledCount = 0;
        break;
    }

    return filledCount;
  };

  // Salvar dados da seção atual
  const saveSectionData = () => {
    const currentData = getValues();
    const sectionFields = getSectionFields(currentSection);
    const sectionData: Partial<ChildFormData> = {};

    sectionFields.forEach(field => {
      (sectionData as any)[field] = (currentData as any)[field];
    });

    console.log(`Salvando dados da seção ${currentSection}:`, sectionData);

    setSectionsData(prev => {
      const newData = {
        ...prev,
        [currentSection]: sectionData
      };
      console.log('Dados completos das seções:', newData);
      return newData;
    });
  };

  // Limpar formulário e erros quando mudar de seção
  const clearFormData = () => {
    // Limpar todos os erros de validação
    clearErrors();
    const defaultValues = {
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
    };

    // Reset com configurações específicas para garantir limpeza completa
    reset(defaultValues as ChildFormData, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
      keepValues: false,
      keepDefaultValues: false,
      keepIsSubmitted: false,
      keepSubmitCount: false
    });
  };

  // Função para validar seção atual com destaque de erros e scroll
  const validateCurrentSection = async () => {
    const currentData = getValues();
    const currentSchema = sectionSchemas[currentSection as keyof typeof sectionSchemas];

    try {
      // Incluir contexto de todas as seções para validações inteligentes
      await currentSchema.validate(currentData, {
        abortEarly: false,
        context: {
          allSectionsData: sectionsData
        }
      });
      return true;
    } catch (error: any) {
      // Processar erros de validação
      const errorFields: string[] = [];

      if (error.inner) {
        error.inner.forEach((err: any) => {
          console.log(`Erro no campo ${err.path}: ${err.message}`);
          errorFields.push(err.path);

          // Destacar campo com erro usando setError do react-hook-form
          setError(err.path, {
            type: 'manual',
            message: err.message,
          });
        });
      }

      // Fazer scroll para o primeiro campo com erro
      if (errorFields.length > 0) {
        scrollToFirstError(errorFields[0]);
      }

      Alert.alert(
        'Campos obrigatórios',
        'Por favor, preencha todos os campos obrigatórios desta seção. Os campos com erro estão destacados em vermelho.'
      );
      return false;
    }
  };

  // Navegação entre seções
  const handleNextSection = async () => {
    const isValid = await validateCurrentSection();

    if (isValid) {
      // Salvar dados da seção atual
      saveSectionData();

      // Marcar seção atual como completa
      if (!completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
      }

      if (currentSection < 8) {
        const nextSection = currentSection + 1;
        clearFormData();
        setCurrentSection(nextSection);
        // Carregar dados da próxima seção após um pequeno delay
        setTimeout(() => loadSectionDataOnce(nextSection), 200);
      } else {
        // Finalizar formulário - consolidar todos os dados
        const allSectionData = { ...sectionsData, [currentSection]: {} };
        const currentData = getValues();
        const sectionFields = getSectionFields(currentSection);

        sectionFields.forEach(field => {
          (allSectionData[currentSection] as any)[field] = (currentData as any)[field];
        });

        // Consolidar todos os dados em um objeto final
        const finalFormData: Partial<ChildFormData> = {};
        Object.values(allSectionData).forEach(sectionData => {
          Object.assign(finalFormData, sectionData);
        });

        setIsLoading(true);
        try {
          await onSubmit(finalFormData as ChildFormData);

          // Limpar rascunho após envio bem-sucedido
          try {
            await AsyncStorage.removeItem(DRAFT_KEY);
            console.log('✅ Rascunho limpo após envio bem-sucedido');
          } catch (error) {
            console.error('❌ Erro ao limpar rascunho:', error);
          }
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
      // Salvar dados da seção atual antes de navegar
      saveSectionData();

      const prevSection = currentSection - 1;
      clearFormData();
      setCurrentSection(prevSection);
      // Carregar dados da seção anterior após um pequeno delay
      setTimeout(() => loadSectionDataOnce(prevSection), 200);
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
                onChangeText={(text) => handleFieldChange('nomeCompleto', text, field.onChange)}
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
              <View style={[
                styles.radioGroup,
                errors.genero && styles.radioGroupError
              ]}>
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
                error={errors.numeroSUS?.message}
                maxLength={18}
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
                  loadingEstados && styles.dropdownDisabled,
                  errors.estadoNascimento && styles.dropdownError
                ]}
                onPress={loadingEstados ? undefined : () => {
                  abrirModalEstado();
                  // Limpar erro quando usuário começar a selecionar
                  if (errors.estadoNascimento) {
                    clearErrors('estadoNascimento');
                  }
                }}
                disabled={loadingEstados}
              >
                <Typography
                  variant="body"
                  style={{
                    ...styles.dropdownText,
                    ...((!field.value) ? styles.placeholderText : {})
                  }}
                >
                  {loadingEstados ? 'Carregando estados...' : (field.value || 'Selecione o estado')}
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
                  (!watchEstadoNascimento || loadingCidades) && styles.dropdownDisabled,
                  errors.cidadeNascimento && styles.dropdownError
                ]}
                onPress={watchEstadoNascimento && !loadingCidades ? () => {
                  abrirModalCidade();
                  // Limpar erro quando usuário começar a selecionar
                  if (errors.cidadeNascimento) {
                    clearErrors('cidadeNascimento');
                  }
                } : undefined}
                disabled={!watchEstadoNascimento || loadingCidades}
              >
                <Typography
                  variant="body"
                  style={{
                    ...styles.dropdownText,
                    ...((!field.value) ? styles.placeholderText : {})
                  }}
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
              <View style={[
                styles.radioGroup,
                errors.semanasPrematuridade && styles.radioGroupError
              ]}>
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
              <View style={[
                styles.radioGroup,
                errors.complicacoesParto && styles.radioGroupError
              ]}>
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

  // Seção 2: Informações dos Pais ou Responsáveis
  const renderSection2 = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.importantNote}>
          <Typography variant="caption" style={styles.importantNoteText}>
            * Preencha pelo menos um dos campos abaixo
          </Typography>
        </View>

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
                value={field.value || ''}
                onChangeText={(text) => {
                  handleFieldChange('nomePai', text, field.onChange);
                  // Forçar atualização do campo
                  setTimeout(() => field.onBlur(), 10);
                }}
                error={errors.nomePai?.message}
                key={`nomePai-${currentSection}`}
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
                value={field.value || ''}
                onChangeText={(text) => {
                  handleFieldChange('nomeResponsavel', text, field.onChange);
                  // Forçar atualização do campo
                  setTimeout(() => field.onBlur(), 10);
                }}
                error={errors.nomeResponsavel?.message}
                key={`nomeResponsavel-${currentSection}`}
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
              <View style={[
                styles.radioGroup,
                errors.parentesco && styles.radioGroupError
              ]}>
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
                error={errors.cep?.message}
                maxLength={9}
              />
            )}
          />
          <Typography variant="caption" style={styles.helpNote}>
            Digite o CEP para preenchimento automático do endereço
          </Typography>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={abrirBuscaCep}
          >
            <Ionicons name="search-outline" size={18} color={Colors.vapapp.teal} />
            <Typography variant="caption" style={styles.helpText}>
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
                placeholder="Digite o nome da rua"
                value={field.value}
                onChangeText={field.onChange}
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
                placeholder="Ex: 123, S/N"
                value={field.value}
                onChangeText={field.onChange}
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
                placeholder="Digite o nome do bairro"
                value={field.value}
                onChangeText={field.onChange}
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
                placeholder="Digite o nome da cidade"
                value={field.value}
                onChangeText={field.onChange}
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
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  loadingEstados && styles.dropdownDisabled,
                  errors.estadoEndereco && styles.dropdownError
                ]}
                onPress={loadingEstados ? undefined : () => {
                  abrirModalEstadoEndereco();
                  // Limpar erro quando usuário começar a selecionar
                  if (errors.estadoEndereco) {
                    clearErrors('estadoEndereco');
                  }
                }}
                disabled={loadingEstados}
              >
                <Typography
                  variant="body"
                  style={{
                    ...styles.dropdownText,
                    ...((!field.value) ? styles.placeholderText : {})
                  }}
                >
                  {field.value ? `${field.value}` : 'Selecione o estado'}
                </Typography>
                {loadingEstados ? (
                  <ActivityIndicator size="small" color={Colors.vapapp.teal} />
                ) : (
                  <Ionicons name="chevron-down" size={20} color={Colors.neutral[500]} />
                )}
              </TouchableOpacity>
            )}
          />
          {errors.estadoEndereco && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.estadoEndereco.message}
            </Typography>
          )}
        </View>

        {/* Nível de Estudo */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Qual o nível de estudo do Responsável Legal principal? *
          </Typography>
          <Controller
            control={control}
            name="nivelEstudo"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.nivelEstudo && styles.radioGroupError
              ]}>
                {renderRadioOption(field, 'nao_estudei', 'Nunca estudei')}
                {renderRadioOption(field, 'fundamental_incompleto', 'Ensino fundamental incompleto')}
                {renderRadioOption(field, 'fundamental_completo', 'Ensino fundamental completo')}
                {renderRadioOption(field, 'medio_incompleto', 'Ensino médio incompleto')}
                {renderRadioOption(field, 'medio_completo', 'Ensino médio completo')}
                {renderRadioOption(field, 'superior_incompleto', 'Ensino superior incompleto')}
                {renderRadioOption(field, 'superior_completo', 'Ensino superior completo')}
                {renderRadioOption(field, 'pos_graduacao', 'Pós-graduação (especialização, mestrado, doutorado)')}
              </View>
            )}
          />
          {errors.nivelEstudo && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.nivelEstudo.message}
            </Typography>
          )}
        </View>
      </View>
    );
  };

  // Seção 3: Informação sobre a Gestação e o Parto
  const renderSection3 = () => {
    return (
      <View style={styles.sectionContainer}>
        {/* A gravidez foi planejada? */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            A gravidez foi planejada? *
          </Typography>
          <Controller
            control={control}
            name="gravidezPlanejada"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.gravidezPlanejada && styles.radioGroupError
              ]}>
                {renderRadioOption(field, 'sim', 'Sim')}
                {renderRadioOption(field, 'nao', 'Não')}
                {renderRadioOption(field, 'nao_sei', 'Não sei')}
              </View>
            )}
          />
          {errors.gravidezPlanejada && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.gravidezPlanejada.message}
            </Typography>
          )}
        </View>

        {/* A mãe fez acompanhamento pré-natal? */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            A mãe fez acompanhamento pré-natal (acompanhamento médico durante a gravidez)? *
          </Typography>
          <Controller
            control={control}
            name="acompanhamentoPreNatal"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.acompanhamentoPreNatal && styles.radioGroupError
              ]}>
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

        {/* Quantas consultas de pré-natal foram feitas? (condicional) */}
        {watchAcompanhamentoPreNatal === 'sim' && (
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Quantas consultas de pré-natal foram feitas? *
            </Typography>
            <Controller
              control={control}
              name="quantidadeConsultas"
              render={({ field }) => (
                <View style={[
                  styles.radioGroup,
                  errors.quantidadeConsultas && styles.radioGroupError
                ]}>
                  {renderRadioOption(field, 'nenhuma', 'Nenhuma consulta')}
                  {renderRadioOption(field, 'menos_5', 'Menos de 5 consultas')}
                  {renderRadioOption(field, 'entre_5_7', 'Entre 5 e 7 consultas')}
                  {renderRadioOption(field, '8_ou_mais', '8 ou mais consultas')}
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
            A mãe teve algum dos problemas abaixo durante a gravidez? (Pode marcar mais de uma opção) *
          </Typography>
          <Controller
            control={control}
            name="problemasGravidez"
            render={({ field }) => (
              <View style={[
                styles.checkboxGroup,
                errors.problemasGravidez && styles.checkboxGroupError
              ]}>
                {renderCheckboxOption('diabetes', 'Diabetes (açúcar alto no sangue)', field.value, 'problemasGravidez')}
                {renderCheckboxOption('pressao_alta', 'Pressão alta', field.value, 'problemasGravidez')}
                {renderCheckboxOption('infeccao', 'Infecção durante a gravidez', field.value, 'problemasGravidez')}
                {renderCheckboxOption('sangramento', 'Sangramento', field.value, 'problemasGravidez')}
                {renderCheckboxOption('outros', 'Outros problemas', field.value, 'problemasGravidez')}
                {renderCheckboxOption('nenhum', 'Nenhum problema', field.value, 'problemasGravidez')}
              </View>
            )}
          />
          {errors.problemasGravidez && (
            <Typography variant="caption" style={styles.errorText}>
              {errors.problemasGravidez.message}
            </Typography>
          )}
        </View>

        {/* Outros problemas (condicional) */}
        {watchProblemasGravidez?.includes('outros') && (
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Especifique quais outros problemas *
            </Typography>
            <Controller
              control={control}
              name="outrosProblemasGravidez"
              render={({ field }) => (
                <Input
                  placeholder="Descreva os outros problemas"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  error={errors.outrosProblemasGravidez?.message}
                />
              )}
            />
          </View>
        )}

        {/* Tipo de parto */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Qual foi o tipo de parto? *
          </Typography>
          <Controller
            control={control}
            name="tipoParto"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.tipoParto && styles.radioGroupError
              ]}>
                {renderRadioOption(field, 'normal', 'Parto normal')}
                {renderRadioOption(field, 'cesarea', 'Cesariana')}
                {renderRadioOption(field, 'forceps', 'Parto com fórceps')}
                {renderRadioOption(field, 'nao_sei', 'Não sei')}
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
            O bebê precisou de ajuda especial para respirar logo após o nascimento? *
          </Typography>
          <Controller
            control={control}
            name="ajudaEspecialRespiracao"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.ajudaEspecialRespiracao && styles.radioGroupError
              ]}>
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

        {/* Tipos de ajuda (condicional) */}
        {watchAjudaEspecialRespiracao === 'sim' && (
          <View style={styles.fieldContainer}>
            <Typography variant="caption" style={styles.fieldLabel}>
              Qual(is) tipo(s) de ajuda o bebê recebeu na sala de parto? (Pode marcar mais de uma opção) *
            </Typography>
            <Controller
              control={control}
              name="tiposAjudaSalaParto"
              render={({ field }) => (
                <View style={[
                  styles.checkboxGroup,
                  errors.tiposAjudaSalaParto && styles.checkboxGroupError
                ]}>
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
      </View>
    );
  };

  // Seção 4: Condição Clínica da Criança e Traqueostomia
  const renderSection4 = () => {
    return (
      <View style={styles.sectionContainer}>
        {/* Idade da traqueostomia */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Com que idade a criança fez a traqueostomia? *
          </Typography>
          <Controller
            control={control}
            name="idadeTraqueostomia"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.idadeTraqueostomia && styles.radioGroupError
              ]}>
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

        {/* Motivos da traqueostomia */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Por qual(is) motivo(s) a criança precisou da traqueostomia? (Pode marcar mais de uma opção) *
          </Typography>
          <Controller
            control={control}
            name="motivosTraqueostomia"
            render={({ field }) => (
              <View style={[
                styles.checkboxGroup,
                errors.motivosTraqueostomia && styles.checkboxGroupError
              ]}>
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

        {/* Outro motivo (condicional) */}
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

        {/* Tipo de traqueostomia */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            A traqueostomia é permanente ou temporária? *
          </Typography>
          <Controller
            control={control}
            name="tipoTraqueostomia"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.tipoTraqueostomia && styles.radioGroupError
              ]}>
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

        {/* Equipamentos médicos */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Quais equipamentos ou dispositivos médicos a criança usa? (Pode marcar mais de uma opção) *
          </Typography>
          <Controller
            control={control}
            name="equipamentosMedicos"
            render={({ field }) => (
              <View style={[
                styles.checkboxGroup,
                errors.equipamentosMedicos && styles.checkboxGroupError
              ]}>
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

        {/* Outros equipamentos (condicional) */}
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
      </View>
    );
  };

  // Seção 5: Acompanhamento Médico e Dificuldades
  const renderSection5 = () => {
    return (
      <View style={styles.sectionContainer}>
        {/* Internações */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Quantas vezes a criança precisou ficar internada no hospital depois que fez a traqueostomia? *
          </Typography>
          <Controller
            control={control}
            name="internacoesPosTraqueostomia"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.internacoesPosTraqueostomia && styles.radioGroupError
              ]}>
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

        {/* Acompanhamento médico */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Atualmente, a criança tem acompanhamento regular com quais médicos ou terapeutas? (Pode marcar mais de uma opção) *
          </Typography>
          <Controller
            control={control}
            name="acompanhamentoMedico"
            render={({ field }) => (
              <View style={[
                styles.checkboxGroup,
                errors.acompanhamentoMedico && styles.checkboxGroupError
              ]}>
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

        {/* Outro especialista (condicional) */}
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
                  error={errors.outroEspecialista?.message}
                />
              )}
            />
          </View>
        )}

        {/* Dificuldades de atendimento */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Quais são as maiores dificuldades para conseguir ou chegar aos atendimentos médicos e terapias? (Pode marcar mais de uma opção) *
          </Typography>
          <Controller
            control={control}
            name="dificuldadesAtendimento"
            render={({ field }) => (
              <View style={[
                styles.checkboxGroup,
                errors.dificuldadesAtendimento && styles.checkboxGroupError
              ]}>
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

        {/* Outra dificuldade (condicional) */}
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
      </View>
    );
  };

  // Seção 6: Cuidados Diários em Casa
  const renderSection6 = () => {
    return (
      <View style={styles.sectionContainer}>
        {/* Principal cuidador */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Quem é a pessoa que mais cuida da criança no dia a dia? *
          </Typography>
          <Controller
            control={control}
            name="principalCuidador"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.principalCuidador && styles.radioGroupError
              ]}>
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

        {/* Horas de cuidado */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Em média, quantas horas por dia são dedicadas especificamente aos cuidados da traqueostomia e dos aparelhos que a criança usa? *
          </Typography>
          <Controller
            control={control}
            name="horasCuidadosDiarios"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.horasCuidadosDiarios && styles.radioGroupError
              ]}>
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

        {/* Treinamento hospitalar */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            Você recebeu treinamento suficiente no hospital sobre como cuidar da traqueostomia da criança antes de ir para casa? *
          </Typography>
          <Controller
            control={control}
            name="treinamentoHospital"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.treinamentoHospital && styles.radioGroupError
              ]}>
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
      </View>
    );
  };

  // Seção 7: Acesso a Recursos e Suporte Social
  const renderSection7 = () => {
    return (
      <View style={styles.sectionContainer}>
        {/* Benefício financeiro */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            A família recebe algum benefício ou ajuda financeira do governo (federal, estadual, municipal) por causa da condição da criança? *
          </Typography>
          <Controller
            control={control}
            name="beneficioFinanceiro"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.beneficioFinanceiro && styles.radioGroupError
              ]}>
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

        {/* Qual benefício (condicional) */}
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

        {/* Acesso a materiais */}
        <View style={styles.fieldContainer}>
          <Typography variant="caption" style={styles.fieldLabel}>
            A família tem acesso fácil aos materiais necessários para os cuidados da traqueostomia (ex: cânulas, sondas de aspiração, gaze, soro fisiológico)? *
          </Typography>
          <Controller
            control={control}
            name="acessoMateriais"
            render={({ field }) => (
              <View style={[
                styles.radioGroup,
                errors.acessoMateriais && styles.radioGroupError
              ]}>
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
      </View>
    );
  };

  // Seção 8: Observações Adicionais
  const renderSection8 = () => {
    return (
      <View style={styles.sectionContainer}>
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
              <View>
                <Input
                  placeholder="Escreva aqui suas observações, dificuldades específicas, sucessos, ou qualquer outra informação que considere importante..."
                  value={field.value}
                  onChangeText={field.onChange}
                  inputStyle={[styles.textArea, styles.largeTextArea, { textAlignVertical: 'top' }]}
                  multiline
                  numberOfLines={6}
                  maxLength={300}
                  error={errors.observacoesAdicionais?.message}
                />
                <Typography variant="caption" style={styles.characterCounter}>
                  {field.value?.length || 0}/300 caracteres
                </Typography>
              </View>
            )}
          />
        </View>
      </View>
    );
  };

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
        requiredFieldsCount={getRequiredFieldsCount(currentSection)}
        filledRequiredFieldsCount={getFilledRequiredFieldsCount(currentSection)}
      />

      {/* Conteúdo da Seção */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
          style={[styles.nextButton, currentSection === 1 && styles.fullWidthButton].filter(Boolean)}
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
                    setValue('estadoNascimento', item.nome, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                    // Limpar erro quando item for selecionado
                    if (errors.estadoNascimento) {
                      clearErrors('estadoNascimento');
                    }
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
                    setValue('cidadeNascimento', item.nome, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                    // Limpar erro quando item for selecionado
                    if (errors.cidadeNascimento) {
                      clearErrors('cidadeNascimento');
                    }
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

      {/* Modal de Seleção de Estado do Endereço */}
      <Modal
        visible={showEstadoEnderecoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEstadoEnderecoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>
                Selecione o Estado
              </Typography>
              <TouchableOpacity
                onPress={() => setShowEstadoEnderecoModal(false)}
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
                    setValue('estadoEndereco', item.sigla, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                    // Limpar erro quando item for selecionado
                    if (errors.estadoEndereco) {
                      clearErrors('estadoEndereco');
                    }
                    setShowEstadoEnderecoModal(false);
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
  importantNote: {
    backgroundColor: Colors.vapapp.teal + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.vapapp.teal,
    padding: Sizes.spacing.sm,
    borderRadius: Sizes.radius.md,
    marginBottom: Sizes.spacing.lg,
  },
  importantNoteText: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpNote: {
    color: Colors.neutral[500],
    fontSize: 12,
    marginTop: Sizes.spacing.xs,
    fontStyle: 'italic',
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
  },
  checkboxSelected: {
    backgroundColor: Colors.vapapp.teal,
    borderColor: Colors.vapapp.teal,
  },
  checkboxLabel: {
    flex: 1,
    color: Colors.neutral[800],
    fontWeight: '500',
  },
  largeTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  // Estilos para campos com erro
  fieldError: {
    borderColor: Colors.error,
    borderWidth: 2,
    backgroundColor: Colors.error + '05', // 5% de opacidade
  },
  dropdownError: {
    borderColor: Colors.error,
    borderWidth: 2,
    backgroundColor: Colors.error + '05',
  },
  radioGroupError: {
    borderColor: Colors.error,
    borderWidth: 2,
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.sm,
    backgroundColor: Colors.error + '05',
  },
  checkboxGroupError: {
    borderColor: Colors.error,
    borderWidth: 2,
    borderRadius: Sizes.radius.md,
    padding: Sizes.spacing.sm,
    backgroundColor: Colors.error + '05',
  },
  characterCounter: {
    textAlign: 'right',
    color: Colors.text.secondary,
    marginTop: Sizes.spacing.xs,
    fontSize: 12,
  },
});