import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { Button, Typography, Input, Toast, ReadOnlyField } from '../components/ui';
import { VerificationModal } from '../components/common';
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

  // Estados para verificação
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [verificationTarget, setVerificationTarget] = useState('');
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<EditProfileFormData | null>(null);

  // Estados para toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Estados para modo de edição
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialData, setInitialData] = useState<EditProfileFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Watch for changes
  const watchedValues = watch();

  // Função para formatar telefone
  const formatPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');

    // Aplica a máscara (XX) XXXXX-XXXX
    if (cleaned.length <= 2) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  // Função para limpar telefone (remover máscara)
  const cleanPhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: formatPhone(user.phone || ''),
      };

      reset(userData);
      setProfileImage(user.avatar || null);
      setInitialData(userData);
    }
  }, [user, reset]);

  // Check for changes
  useEffect(() => {
    if (initialData && isEditMode) {
      const currentAvatar = profileImage || '';
      const initialAvatar = user?.avatar || '';

      const hasFormChanges =
        watchedValues.name !== initialData.name ||
        watchedValues.email !== initialData.email ||
        cleanPhone(watchedValues.phone) !== cleanPhone(initialData.phone) ||
        currentAvatar !== initialAvatar;

      setHasChanges(hasFormChanges);
    } else {
      setHasChanges(false);
    }
  }, [watchedValues, initialData, profileImage, user?.avatar, isEditMode]);

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
    if (!isEditMode) return;

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

  const toggleEditMode = () => {
    if (isEditMode && hasChanges) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja descartá-las?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              reset(initialData!);
              setProfileImage(user?.avatar || null);
              setIsEditMode(false);
            },
          },
        ]
      );
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const cancelEdit = () => {
    if (hasChanges) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja descartá-las?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              reset(initialData!);
              setProfileImage(user?.avatar || null);
              setIsEditMode(false);
            },
          },
        ]
      );
    } else {
      setIsEditMode(false);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    if (isLoading) {
      console.log('=== JÁ ESTÁ PROCESSANDO - IGNORANDO ===');
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== SUBMIT DATA ===', {
        currentEmail: user?.email,
        newEmail: data.email,
        currentPhone: user?.phone,
        newPhone: data.phone,
      });

      const emailChanged = data.email.toLowerCase().trim() !== user?.email?.toLowerCase().trim();
      const phoneChanged = cleanPhone(data.phone) !== cleanPhone(user?.phone || '');

      console.log('=== CHANGES DETECTED ===', { emailChanged, phoneChanged });

      // Se email ou telefone mudaram, precisamos de verificação
      if (emailChanged) {
        setIsLoading(false);
        setPendingFormData(data);
        setVerificationType('email');
        setVerificationTarget(data.email);

        const { error } = await authService.sendEmailVerification(data.email);

        if (error) {
          setToastMessage(`Erro ao enviar e-mail: ${error}`);
          setToastType('error');
          setShowToast(true);
          setIsLoading(false);
          return;
        }

        // Mostrar toast de sucesso
        setToastMessage(`E-mail de verificação enviado para ${data.email}`);
        setToastType('success');
        setShowToast(true);

        // Salvar outros dados automaticamente (sem email)
        setTimeout(() => {
          saveOtherDataOnly({
            ...data,
            email: user?.email || '' // Manter email atual
          });
        }, 1000);
        return;
      }

      if (phoneChanged) {
        setIsLoading(false);
        setPendingFormData(data);
        setVerificationType('phone');
        setVerificationTarget(data.phone);

        const result = await authService.sendPhoneVerification(data.phone);

        if (result.error) {
          setToastMessage(`Erro ao enviar SMS: ${result.error}`);
          setToastType('error');
          setShowToast(true);
          setIsLoading(false);
          return;
        }

        setVerificationCode(result.verificationCode);
        setShowVerificationModal(true);

        // Mostrar toast de sucesso
        setToastMessage(`Código enviado para ${data.phone}`);
        setToastType('success');
        setShowToast(true);
        return;
      }

      // Se nenhum campo sensível mudou, atualizar diretamente
      // O loading já está ativo, então vamos manter e processar
      await processPendingUpdate(data);

    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      setIsLoading(false);
    }
  };

  const processPendingUpdate = async (data: EditProfileFormData) => {
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

      setToastMessage('Perfil atualizado com sucesso!');
      setToastType('success');
      setShowToast(true);
      setIsEditMode(false);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
      setPendingFormData(null);
    }
  };

  const handleVerification = async (code: string) => {
    if (!pendingFormData || !verificationCode) {
      return { verified: false, error: 'Dados de verificação não encontrados' };
    }

    if (verificationType === 'phone') {
      const result = await authService.verifyPhoneCode(
        verificationTarget,
        code,
        verificationCode
      );

      if (result.verified) {
        setShowVerificationModal(false);
        await processPendingUpdate(pendingFormData);
      }

      return result;
    }

    return { verified: false, error: 'Tipo de verificação não suportado' };
  };

  const saveOtherDataOnly = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        name: data.name,
        phone: data.phone, // Mantém o telefone se não mudou
        avatar: profileImage || undefined,
        // NÃO inclui email - será atualizado apenas após confirmação
      };

      const { data: updatedUser, error } = await authService.updateProfile(updateData);

      if (error) {
        Alert.alert('Erro', error);
        return;
      }

      // Atualizar o store com os novos dados
      if (updatedUser) {
        console.log('=== UPDATING USER IN STORE (outros dados) ===', updatedUser);
        updateUser(updatedUser);
      }

      setToastMessage('Alterações salvas! Confirme o novo e-mail pelo link enviado.');
      setToastType('success');
      setShowToast(true);
      setIsEditMode(false);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Typography variant="h3" style={styles.headerTitle}>
          {isEditMode ? 'Editar Perfil' : 'Meu Perfil'}
        </Typography>
        <TouchableOpacity
          style={styles.editToggleButton}
          onPress={toggleEditMode}
        >
          <Ionicons
            name={isEditMode ? "close" : "create-outline"}
            size={24}
            color={Colors.text.inverse}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            {isEditMode && (
              <TouchableOpacity style={styles.cameraButton} onPress={showImagePicker}>
                <Ionicons name="camera" size={20} color={Colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
          {isEditMode && (
            <Typography variant="caption" style={styles.avatarLabel}>
              Toque para alterar a foto
            </Typography>
          )}
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Nome */}
          {isEditMode ? (
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
          ) : (
            <ReadOnlyField
              label="Nome completo"
              value={user?.name || ''}
            />
          )}

          {/* Email */}
          {isEditMode ? (
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
          ) : (
            <ReadOnlyField
              label="E-mail"
              value={user?.email || ''}
            />
          )}

          {/* Telefone */}
          {isEditMode ? (
            <View style={styles.inputGroup}>
              <Typography variant="caption" style={styles.inputLabel}>
                Telefone
              </Typography>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="(00) 00000-0000"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const formatted = formatPhone(text);
                      onChange(formatted);
                    }}
                    value={value}
                    error={errors.phone?.message}
                    keyboardType="phone-pad"
                    style={styles.input}
                    maxLength={15} // (XX) XXXXX-XXXX
                  />
                )}
              />
            </View>
          ) : (
            <ReadOnlyField
              label="Telefone"
              value={user?.phone || ''}
            />
          )}

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
        {isEditMode && (
          <View style={styles.actionSection}>
            {hasChanges && (
              <Button
                title="Salvar Alterações"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                style={styles.saveButton}
              />
            )}

            <Button
              title="Cancelar"
              onPress={cancelEdit}
              variant="outline"
              fullWidth
              style={styles.cancelButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Verificação */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setPendingFormData(null);
          setVerificationCode(null);
        }}
        onVerify={handleVerification}
        title={
          verificationType === 'email'
            ? 'Verificar E-mail'
            : 'Verificar Telefone'
        }
        subtitle={
          verificationType === 'email'
            ? 'Digite o código enviado para seu e-mail'
            : 'Digite o código enviado via SMS'
        }
        type={verificationType}
        target={verificationTarget}
      />

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </KeyboardAvoidingView>
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
  editToggleButton: {
    padding: 4,
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