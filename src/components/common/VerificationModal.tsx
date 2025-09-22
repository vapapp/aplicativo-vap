import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Typography, Input } from '../ui';
import { Colors, Sizes } from '../../utils/constants';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<{ verified: boolean; error?: string }>;
  title: string;
  subtitle: string;
  type: 'email' | 'phone';
  target: string; // email ou telefone
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onVerify,
  title,
  subtitle,
  type,
  target,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos

  useEffect(() => {
    if (!visible) {
      setCode('');
      setTimeLeft(600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Código expirado', 'O código de verificação expirou. Tente novamente.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onVerify(code);

      if (result.verified) {
        Alert.alert('Sucesso', 'Verificação concluída com sucesso!');
        onClose();
      } else {
        Alert.alert('Erro', result.error || 'Código incorreto');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verificar quando 6 dígitos são digitados
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    // Se completou 6 dígitos, aguardar um pouco e verificar automaticamente
    if (newCode.length === 6) {
      setTimeout(() => {
        handleVerify();
      }, 500);
    }
  };

  const getIcon = () => {
    return type === 'email' ? 'mail-outline' : 'call-outline';
  };

  const formatTarget = () => {
    if (type === 'email') return target;

    // Mascarar telefone: (11) 99999-9999 -> (11) ****-9999
    const cleaned = target.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ****-${cleaned.slice(-4)}`;
    }
    return target;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={getIcon()} size={24} color={Colors.vapapp.teal} />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
            <Typography variant="h3" style={styles.title}>
              {title}
            </Typography>

            <Typography variant="body" style={styles.subtitle}>
              {subtitle}
            </Typography>

            <View style={styles.targetContainer}>
              <Typography variant="caption" style={styles.targetLabel}>
                {type === 'email' ? 'E-mail:' : 'Telefone:'}
              </Typography>
              <Typography variant="subtitle" style={styles.targetValue}>
                {formatTarget()}
              </Typography>
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color={Colors.primary[600]} />
              <Typography variant="caption" style={styles.timerText}>
                Expira em: {formatTime(timeLeft)}
              </Typography>
            </View>

            {/* Code Input */}
            <View style={styles.inputContainer}>
              <Typography variant="caption" style={styles.inputLabel}>
                Código de verificação
              </Typography>
              <Input
                placeholder="000000"
                value={code}
                onChangeText={handleCodeChange}
                keyboardType="numeric"
                maxLength={6}
                style={styles.codeInput}
                textAlign="center"
                fontSize={18}
                letterSpacing={2}
                onSubmitEditing={handleVerify}
                returnKeyType="done"
                autoFocus
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Verificar"
                onPress={handleVerify}
                loading={isLoading}
                disabled={code.length !== 6}
                fullWidth
                style={styles.verifyButton}
              />

              <Button
                title="Cancelar"
                onPress={onClose}
                variant="outline"
                fullWidth
                style={styles.cancelButton}
              />
            </View>
            </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.spacing.lg,
  },
  modal: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Sizes.radius.xl,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    marginVertical: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Sizes.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    maxHeight: 500,
  },
  scrollContent: {
    padding: Sizes.spacing.lg,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: Sizes.spacing.sm,
    color: Colors.neutral[800],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Sizes.spacing.lg,
    color: Colors.neutral[600],
  },
  targetContainer: {
    backgroundColor: Colors.neutral[50],
    padding: Sizes.spacing.md,
    borderRadius: Sizes.radius.md,
    marginBottom: Sizes.spacing.lg,
  },
  targetLabel: {
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  targetValue: {
    color: Colors.neutral[800],
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.spacing.lg,
  },
  timerText: {
    marginLeft: 6,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Sizes.spacing.lg,
  },
  inputLabel: {
    color: Colors.neutral[700],
    fontWeight: '600',
    marginBottom: Sizes.spacing.xs,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Sizes.radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  actions: {
    gap: Sizes.spacing.md,
  },
  verifyButton: {
    backgroundColor: Colors.vapapp.teal,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
});