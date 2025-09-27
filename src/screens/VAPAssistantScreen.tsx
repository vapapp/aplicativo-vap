import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common';
import { Button, Typography, Input } from '../components/ui';
import { useDrVAP } from '../hooks';
import { Colors, Sizes } from '../utils/constants';
import { ERROR_MESSAGES } from '../config';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const VAPAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const {
    conversationHistory,
    loading,
    usage,
    sendMessage,
    getUsageInfo,
    verifyConnection,
  } = useDrVAP();

  // Verificar conexão e carregar informações de uso ao montar o componente
  useEffect(() => {
    const initializeScreen = async () => {
      // Verificar se a API está online
      const connected = await verifyConnection();
      setIsConnected(connected);

      if (connected) {
        // Carregar informações de uso
        await getUsageInfo();
      }
    };

    initializeScreen();
  }, []);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (conversationHistory.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessage(inputMessage.trim());
      setInputMessage('');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);

      if (error.message === ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
        Alert.alert(
          'Limite Excedido',
          'Você atingiu o limite de 20 mensagens por dia. Tente novamente amanhã.',
          [{ text: 'OK' }]
        );
      } else if (error.message === ERROR_MESSAGES.UNAUTHORIZED) {
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Faça login novamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erro', error.message || 'Ocorreu um erro ao enviar a mensagem. Tente novamente.');
      }
    }
  };

  // Função para renderizar texto formatado das mensagens do Dr. VAP
  const renderFormattedText = (content: string, isUser: boolean) => {
    if (isUser) {
      return (
        <Typography
          variant="body"
          style={[styles.messageText, styles.userText]}
        >
          {content}
        </Typography>
      );
    }

    // Para mensagens do Dr. VAP, aplicar formatação
    const parts = content.split(/(\*\*.*?\*\*|\n\d+\.\s|\n)/);

    return (
      <Text style={[styles.messageText, styles.assistantText]}>
        {parts.map((part, idx) => {
          // Texto em negrito (**texto**)
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={idx} style={styles.boldText}>
                {part.slice(2, -2)}
              </Text>
            );
          }

          // Listas numeradas
          if (part.match(/^\n\d+\.\s/)) {
            return <Text key={idx} style={styles.listItem}>{part}</Text>;
          }

          // Quebras de linha
          if (part === '\n') {
            return <Text key={idx}>{'\n'}</Text>;
          }

          // Texto normal
          return <Text key={idx}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderMessage = (msg: ConversationMessage, index: number) => {
    const isUser = msg.role === 'user';

    return (
      <View key={index} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.assistantHeader}>
            <Ionicons name="medical-outline" size={16} color={Colors.vapapp.teal} />
            <Typography variant="caption" style={styles.assistantLabel}>
              Dr. VAP
            </Typography>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          {renderFormattedText(msg.content, isUser)}
        </View>
      </View>
    );
  };

  const renderUsageInfo = () => {
    if (!usage) return null;

    const isLowUsage = usage.remainingMessages <= 5;

    return (
      <View style={[
        styles.usageContainer,
        isLowUsage && styles.usageContainerWarning
      ]}>
        <View style={styles.usageHeader}>
          <Ionicons
            name={isLowUsage ? "warning-outline" : "information-circle-outline"}
            size={16}
            color={isLowUsage ? Colors.warning : Colors.vapapp.teal}
          />
          <Typography variant="caption" style={styles.usageTitle}>
            Uso Diário
          </Typography>
        </View>

        <Typography variant="caption" style={styles.usageText}>
          Mensagens restantes: {usage.remainingMessages}/20
        </Typography>

        {usage.resetTime && (
          <Typography variant="caption" style={styles.usageResetText}>
            Reset: {new Date(usage.resetTime).toLocaleDateString('pt-BR')} às {new Date(usage.resetTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </View>
    );
  };


  const renderConnectionError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={64} color={Colors.error} />

      <Typography variant="h3" style={styles.errorTitle}>
        Dr. VAP Offline
      </Typography>

      <Typography variant="body" style={styles.errorDescription}>
        O assistente Dr. VAP está temporariamente indisponível. Tente novamente em alguns minutos.
      </Typography>

      <Button
        title="Tentar Novamente"
        onPress={async () => {
          const connected = await verifyConnection();
          setIsConnected(connected);
        }}
        variant="primary"
        style={styles.retryButton}
      />

      <Typography variant="caption" style={styles.errorNote}>
        Em caso de emergência médica, procure atendimento presencial imediatamente.
      </Typography>
    </View>
  );

  // Loading da verificação inicial
  if (isConnected === null) {
    return (
      <View style={styles.container}>
        <Header title="Dr. VAP" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.vapapp.teal} />
          <Typography variant="body" style={styles.loadingText}>
            Conectando com Dr. VAP...
          </Typography>
        </View>
      </View>
    );
  }

  // Erro de conexão
  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Header title="Dr. VAP" showBackButton />
        {renderConnectionError()}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Dr. VAP" showBackButton />

      {/* Informações de uso */}
      {renderUsageInfo()}

      {/* Lista de mensagens */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {conversationHistory.map(renderMessage)}

        {loading && (
          <View style={styles.messageContainer}>
            <View style={styles.assistantMessageContainer}>
              <View style={styles.assistantHeader}>
                <Ionicons name="medical-outline" size={16} color={Colors.vapapp.teal} />
                <Typography variant="caption" style={styles.assistantLabel}>
                  Dr. VAP
                </Typography>
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <View style={styles.loadingMessageContainer}>
                  <ActivityIndicator size="small" color={Colors.vapapp.teal} />
                  <Typography variant="caption" style={styles.loadingMessageText}>
                    Digitando...
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input de mensagem */}
      <View style={styles.inputContainer}>
        <View style={styles.messageInputRow}>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="Digite sua pergunta para o Dr. VAP..."
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={1000}
              style={styles.messageInput}
              inputStyle={styles.messageInputStyle}
              editable={!loading && (usage === null || usage.remainingMessages > 0)}
            />
          </View>

          <Button
            title={loading ? "⏳" : "➤"}
            onPress={handleSendMessage}
            disabled={loading || !inputMessage.trim() || (usage !== null && usage.remainingMessages <= 0)}
            variant="primary"
            style={styles.sendButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
  usageContainer: {
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    padding: Sizes.spacing.md,
  },
  usageContainerWarning: {
    backgroundColor: Colors.warning + '10',
    borderBottomColor: Colors.warning + '30',
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.xs,
  },
  usageTitle: {
    marginLeft: Sizes.spacing.xs,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  usageText: {
    color: Colors.text.secondary,
  },
  usageResetText: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Sizes.spacing.md,
    paddingBottom: Sizes.spacing.xl,
  },
  messageContainer: {
    marginBottom: Sizes.spacing.sm,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.spacing.xs,
    marginLeft: Sizes.spacing.sm,
  },
  assistantLabel: {
    marginLeft: Sizes.spacing.xs,
    fontWeight: '600',
    color: Colors.vapapp.teal,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: Sizes.spacing.md,
    paddingVertical: Sizes.spacing.sm,
    marginVertical: 2,
  },
  userBubble: {
    backgroundColor: Colors.vapapp.teal,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.neutral[100],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  userText: {
    color: Colors.text.inverse,
  },
  assistantText: {
    color: Colors.text.primary,
  },
  boldText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  listItem: {
    fontWeight: '500',
    color: Colors.text.primary,
  },
  loadingBubble: {
    minWidth: 80,
  },
  loadingMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMessageText: {
    marginLeft: Sizes.spacing.xs,
    color: Colors.vapapp.teal,
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.spacing.lg,
  },
  errorTitle: {
    color: Colors.error,
    fontWeight: '600',
    marginTop: Sizes.spacing.lg,
    marginBottom: Sizes.spacing.md,
  },
  errorDescription: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: Sizes.spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Colors.vapapp.teal,
    marginBottom: Sizes.spacing.lg,
  },
  errorNote: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    padding: Sizes.spacing.md,
    paddingBottom: Sizes.spacing.lg,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Sizes.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  messageInput: {
    marginBottom: 0,
  },
  messageInputStyle: {
    minHeight: 52,
    maxHeight: 120,
    paddingVertical: Sizes.spacing.md,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.vapapp.teal,
    paddingHorizontal: Sizes.spacing.lg,
    paddingVertical: Sizes.spacing.md,
    minWidth: 60,
    height: 52,
    borderRadius: Sizes.radius.lg,
  },
});

export default VAPAssistantScreen;