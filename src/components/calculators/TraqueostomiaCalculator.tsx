import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography, Input } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface CalculationResult {
  tubo_et: {
    id: string;
    od: string;
  };
  traqueo: string;
  bronco: {
    size: string;
    od: string;
  };
}

export const TraqueostomiaCalculator: React.FC = () => {
  const [idade, setIdade] = useState('');
  const [unidadeIdade, setUnidadeIdade] = useState<'meses' | 'anos'>('anos');
  const [resultado, setResultado] = useState<CalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUnidadePicker, setShowUnidadePicker] = useState(false);

  const calcularTuboIdadeMaior = (idade: number): string => {
    const idadeAnos = unidadeIdade === 'meses' ? idade / 12 : idade;
    const tamanho = (idadeAnos + 16) / 4;
    return tamanho.toFixed(1);
  };

  const calcularTamanhoCanula = (idade: number): CalculationResult => {
    const idadeMeses = unidadeIdade === 'anos' ? idade * 12 : idade;

    if (idadeMeses < 1) {
      return {
        tubo_et: { id: '2.0', od: '2.9' },
        traqueo: '2.0/2.5',
        bronco: { size: '2.5', od: '4.2' },
      };
    } else if (idadeMeses < 6) {
      return {
        tubo_et: { id: '3.0/3.5', od: '4.4/5.0' },
        traqueo: '3.0/3.5',
        bronco: { size: '3.0', od: '5.0' },
      };
    } else if (idadeMeses < 12) {
      return {
        tubo_et: { id: '3.5/4.0', od: '5.0/5.4' },
        traqueo: '3.5/4.0',
        bronco: { size: '3.5', od: '5.7' },
      };
    } else if (idadeMeses < 24) {
      return {
        tubo_et: { id: '4.0/4.5', od: '5.4/6.6' },
        traqueo: '4.0',
        bronco: { size: '3.7', od: '6.4' },
      };
    } else {
      const tamanhoBase = calcularTuboIdadeMaior(idade);
      const tamanhoNumerico = parseFloat(tamanhoBase);

      return {
        tubo_et: {
          id: tamanhoBase,
          od: (tamanhoNumerico + 1.5).toFixed(1),
        },
        traqueo: tamanhoBase,
        bronco: {
          size: (tamanhoNumerico - 0.5).toFixed(1),
          od: (tamanhoNumerico + 2.8).toFixed(1),
        },
      };
    }
  };

  const handleCalcular = () => {
    if (!idade.trim()) {
      Alert.alert('Erro', 'Por favor, insira a idade');
      return;
    }

    const idadeNumero = parseFloat(idade);
    if (isNaN(idadeNumero)) {
      Alert.alert('Erro', 'Insira um número válido');
      return;
    }

    setErrorMessage(null);

    // Se idade > 18 anos, exibe mensagem de erro
    if (unidadeIdade === 'anos' && idadeNumero > 18) {
      setResultado(null);
      setErrorMessage('Idade maior que 18 anos não suportada.');
      return;
    }

    // Caso contrário, faz o cálculo normalmente
    const resultado = calcularTamanhoCanula(idadeNumero);
    setResultado(resultado);
  };

  const toggleUnidade = () => {
    const novaUnidade = unidadeIdade === 'anos' ? 'meses' : 'anos';
    console.log('Mudando unidade de', unidadeIdade, 'para', novaUnidade);
    setUnidadeIdade(novaUnidade);
  };

  const handleIdadeChange = (text: string) => {
    // Remove qualquer caractere que não seja dígito
    const apenasNumeros = text.replace(/[^0-9]/g, '');
    setIdade(apenasNumeros);
  };

  const getUnidadeLabel = () => {
    const label = unidadeIdade === 'anos' ? 'Anos' : 'Meses';
    console.log('getUnidadeLabel:', unidadeIdade, '->', label);
    return label;
  };

  const renderResultRow = (label: string, value: string) => (
    <View style={styles.resultRow} key={label}>
      <Typography variant="body" style={styles.resultLabel}>
        {label}
      </Typography>
      <Typography variant="subtitle" style={styles.resultValue}>
        {value}
      </Typography>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="body" style={styles.subtitle}>
              Insira a idade do paciente para calcular o tamanho ideal da cânula
            </Typography>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <View style={styles.ageInputContainer}>
                <Typography variant="caption" style={styles.inputLabel}>
                  Idade
                </Typography>
                <Input
                  placeholder="Ex: 5"
                  value={idade}
                  onChangeText={handleIdadeChange}
                  keyboardType="number-pad"
                  style={styles.ageInput}
                />
              </View>

              <View style={styles.unitContainer}>
                <Typography variant="caption" style={styles.inputLabel}>
                  Unidade
                </Typography>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unidadeIdade === 'meses' && styles.unitButtonActive
                  ]}
                  onPress={toggleUnidade}
                  activeOpacity={0.7}
                >
                  <Typography variant="body" style={styles.unitText} numberOfLines={1}>
                    {unidadeIdade === 'anos' ? 'Anos' : 'Meses'}
                  </Typography>
                  <Ionicons
                    name="swap-horizontal"
                    size={18}
                    color={Colors.vapapp.teal}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Calcular"
              onPress={handleCalcular}
              fullWidth
              style={styles.calculateButton}
            />
          </View>

          {/* Results */}
          {(resultado || errorMessage) && (
            <View style={styles.resultContainer}>
              {errorMessage ? (
                <Typography variant="subtitle" style={styles.errorText}>
                  {errorMessage}
                </Typography>
              ) : (
                resultado && (
                  <View>
                    <Typography variant="h3" style={styles.resultTitle}>
                      Resultado
                    </Typography>
                    <View style={styles.resultsList}>
                      {renderResultRow(
                        'Tubo ET (ID - Diâmetro interno):',
                        resultado.tubo_et.id
                      )}
                      {renderResultRow(
                        'Tubo ET (OD - Diâmetro externo):',
                        resultado.tubo_et.od
                      )}
                      {renderResultRow(
                        'Traqueostomia:',
                        resultado.traqueo
                      )}
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    margin: Sizes.spacing.lg,
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.xl,
    overflow: 'hidden',
  },
  header: {
    padding: Sizes.spacing.lg,
    paddingBottom: Sizes.spacing.md,
  },
  subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  form: {
    padding: Sizes.spacing.lg,
    paddingTop: 0,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Sizes.spacing.md,
    marginBottom: Sizes.spacing.lg,
    alignItems: 'center',
  },
  ageInputContainer: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  unitContainer: {
    flex: 1.2,
    justifyContent: 'flex-end',
  },
  inputLabel: {
    color: Colors.neutral[700],
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
    marginLeft: 4,
    height: 20, // altura fixa para garantir alinhamento
  },
  ageInput: {
    backgroundColor: Colors.neutral[50],
    height: 48,
  },
  unitButton: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Sizes.radius.lg,
    borderWidth: 2,
    borderColor: Colors.vapapp.teal + '40', // 25% opacity
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 90,
  },
  unitButtonActive: {
    backgroundColor: Colors.vapapp.teal + '10', // 10% opacity
    borderColor: Colors.vapapp.teal,
  },
  unitText: {
    color: Colors.neutral[800],
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  calculateButton: {
    backgroundColor: Colors.vapapp.teal,
    marginBottom: Sizes.spacing.lg,
  },
  resultContainer: {
    margin: Sizes.spacing.lg,
    padding: Sizes.spacing.lg,
    backgroundColor: Colors.vapapp.teal + '1A', // 10% opacity
    borderRadius: Sizes.radius.lg,
    borderWidth: 1,
    borderColor: Colors.vapapp.teal,
  },
  errorText: {
    color: Colors.vapapp.teal,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultTitle: {
    color: Colors.neutral[800],
    marginBottom: Sizes.spacing.md,
  },
  resultsList: {
    gap: Sizes.spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultLabel: {
    flex: 1,
    color: Colors.neutral[700],
    marginRight: Sizes.spacing.md,
  },
  resultValue: {
    color: Colors.vapapp.teal,
    fontWeight: '700',
  },
});