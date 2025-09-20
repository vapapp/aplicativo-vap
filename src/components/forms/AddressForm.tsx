// src/components/forms/AddressForm.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Colors, Typography, Sizes } from '../../utils/constants';

interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
}

interface AddressFormProps {
  addressData: AddressData;
  onAddressChange: (data: AddressData) => void;
  errors: Record<string, string>;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  addressData,
  onAddressChange,
  errors,
}) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const searchCep = async () => {
    if (!addressData.cep || addressData.cep.length < 8) {
      Alert.alert('Erro', 'Digite um CEP válido');
      return;
    }

    setIsLoadingCep(true);
    try {
      const cepNumbers = addressData.cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado');
        return;
      }

      // Simular latitude e longitude (você pode integrar com Google Maps API)
      const mockLatitude = (-23.5505 + Math.random() * 0.1).toString();
      const mockLongitude = (-46.6333 + Math.random() * 0.1).toString();

      onAddressChange({
        ...addressData,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        latitude: mockLatitude,
        longitude: mockLongitude,
      });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const formatCep = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Endereço</Text>
      
      <View style={styles.cepContainer}>
        <View style={styles.cepInput}>
          <Input
            label="CEP"
            value={addressData.cep}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              cep: formatCep(text)
            })}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
            error={errors.cep}
          />
        </View>
        <Button
          title="Buscar"
          onPress={searchCep}
          loading={isLoadingCep}
          size="md"
          style={styles.searchButton}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.streetInput}>
          <Input
            label="Endereço"
            value={addressData.street}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              street: text
            })}
            placeholder="Rua, Avenida..."
            error={errors.street}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Input
            label="Bairro"
            value={addressData.neighborhood}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              neighborhood: text
            })}
            placeholder="Bairro"
            error={errors.neighborhood}
          />
        </View>
        <View style={styles.numberInput}>
          <Input
            label="Número"
            value={addressData.number}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              number: text
            })}
            placeholder="123"
            keyboardType="numeric"
            error={errors.number}
          />
        </View>
      </View>

      <Input
        label="Complemento"
        value={addressData.complement}
        onChangeText={(text) => onAddressChange({
          ...addressData,
          complement: text
        })}
        placeholder="Apartamento, casa..."
      />

      <View style={styles.row}>
        <View style={styles.flex2}>
          <Input
            label="Cidade"
            value={addressData.city}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              city: text
            })}
            placeholder="Cidade"
            error={errors.city}
          />
        </View>
        <View style={styles.flex1}>
          <Input
            label="UF"
            value={addressData.state}
            onChangeText={(text) => onAddressChange({
              ...addressData,
              state: text.toUpperCase()
            })}
            placeholder="SP"
            maxLength={2}
            error={errors.state}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.vapapp.teal,
    marginBottom: Sizes.spacing.md,
    textAlign: 'center',
  },
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Sizes.spacing.sm,
  },
  cepInput: {
    flex: 1,
  },
  searchButton: {
    marginBottom: Sizes.spacing.md,
    paddingHorizontal: Sizes.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Sizes.spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  streetInput: {
    flex: 1,
  },
  numberInput: {
    width: 80,
  },
});