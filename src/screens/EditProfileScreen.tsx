import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { Button, Typography, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { authService, UpdateProfileData } from '../services/auth/authService';
import { Colors, Sizes } from '../utils/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
}

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: yup.string().required('E-mail é obrigatório').email('E-mail inválido'),
  phone: yup.string().required('Telefone é obrigatório').min(10, 'Telefone deve ter pelo menos 10 dígitos'),
});

export const EditProfileScreen: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setProfileImage(user.avatar || null);
    }
  }, [user, reset]);

  const pickImage = async () => {
    try {
      // Solicitar permissões
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos. Vá em Configurações > Privacidade > Fotos para permitir.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      // Usar MediaTypeOptions.Images (API atual)
      const mediaTypes = ImagePicker.MediaTypeOptions.Images;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('=== ERRO NA GALERIA ===', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar a câmera. Vá em Configurações > Privacidade > Câmera para permitir.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('=== ERRO NA CÂMERA ===', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Selecionar foto',
      'Escolha uma opção',
      [
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: profileImage || undefined,
      };

      const { data: updatedUser, error } = await authService.updateProfile(updateData);

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      // Atualizar o store com os novos dados
      if (updatedUser) {
        console.log('=== UPDATING USER IN STORE ===', updatedUser);
        updateUser(updatedUser);
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          Editar Perfil
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.neutral[400]} />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={showImagePicker}>
              <Ionicons name="camera" size={20} color={Colors.text.inverse} />
            </TouchableOpacity>
          </View>
          <Typography variant="caption" style={styles.avatarLabel}>
            Toque para alterar a foto
          </Typography>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Typography variant="caption" style={styles.inputLabel}>
              Nome completo
            </Typography>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Digite seu nome completo"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                  style={styles.input}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="caption" style={styles.inputLabel}>
              E-mail
            </Typography>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Digite seu e-mail"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="caption" style={styles.inputLabel}>
              Telefone
            </Typography>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Digite seu telefone"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              )}
            />
          </View>

          {/* Profile Info Card */}
          <View style={styles.profileInfoCard}>
            <View style={styles.profileInfoRow}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.vapapp.teal} />
              <View style={styles.profileInfoText}>
                <Typography variant="caption" style={styles.profileInfoTitle}>
                  Tipo de perfil
                </Typography>
                <Typography variant="body" style={styles.profileInfoValue}>
                  {user?.profile || 'cuidador'}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Salvar Alterações"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.saveButton}
          />

          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
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
    backgroundColor: Colors.vapapp.teal,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Sizes.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: Sizes.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Sizes.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Sizes.spacing.md,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.vapapp.teal,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.vapapp.teal,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.vapapp.teal,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral[0],
  },
  avatarLabel: {
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  formSection: {
    marginBottom: Sizes.spacing.xl,
  },
  inputGroup: {
    marginBottom: Sizes.spacing.lg,
  },
  inputLabel: {
    color: Colors.neutral[700],
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  profileInfoCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.lg,
    padding: Sizes.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.vapapp.lightGreen,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfoText: {
    marginLeft: Sizes.spacing.md,
    flex: 1,
  },
  profileInfoTitle: {
    color: Colors.neutral[500],
    fontSize: 12,
    marginBottom: 2,
  },
  profileInfoValue: {
    color: Colors.neutral[800],
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionSection: {
    marginBottom: Sizes.spacing.xl,
  },
  saveButton: {
    marginBottom: Sizes.spacing.md,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
});