import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase/client';
import { DR_VAP_API_CONFIG, buildApiUrl, buildApiUrlWithFallback, ERROR_MESSAGES } from '../config';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
  sources_used: boolean;
  remaining_messages: number;
}

interface UsageInfo {
  messageCount: number;
  remainingMessages: number;
  resetTime: string;
}


const CONVERSATION_STORAGE_KEY = 'dr_vap_conversation';
const CONVERSATION_ID_STORAGE_KEY = 'dr_vap_conversation_id';

const getInitialMessage = (): ConversationMessage => ({
  role: 'assistant',
  content: 'Olá! Eu sou o Dr. VAP, especialista em vias aéreas pediátricas. Estou aqui para ajudar você com questões sobre traqueostomia e cuidados respiratórios do seu filho. Como posso ajudá-lo hoje?',
  timestamp: new Date().toISOString()
});

// Função para verificar se uma mensagem é do dia atual
const isFromToday = (timestamp: string): boolean => {
  const messageDate = new Date(timestamp);
  const today = new Date();

  return messageDate.toDateString() === today.toDateString();
};

// Função para filtrar mensagens do dia atual
const filterTodayMessages = (messages: ConversationMessage[]): ConversationMessage[] => {
  return messages.filter(msg => isFromToday(msg.timestamp));
};

export const useDrVAP = () => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([getInitialMessage()]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Carregar conversa salva ao inicializar
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const savedConversation = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
        if (savedConversation) {
          const parsed = JSON.parse(savedConversation);

          // Filtrar apenas mensagens do dia atual
          const todayMessages = filterTodayMessages(parsed);

          // Se não há mensagens de hoje, mostrar só a mensagem inicial
          if (todayMessages.length === 0) {
            setConversationHistory([getInitialMessage()]);
          } else {
            // Se a primeira mensagem não é a inicial, adicionar ela
            const hasInitialMessage = todayMessages[0]?.role === 'assistant' &&
              todayMessages[0]?.content.includes('Olá! Eu sou o Dr. VAP');

            if (!hasInitialMessage) {
              setConversationHistory([getInitialMessage(), ...todayMessages]);
            } else {
              setConversationHistory(todayMessages);
            }
          }
        }

        const savedConversationId = await AsyncStorage.getItem(CONVERSATION_ID_STORAGE_KEY);
        if (savedConversationId) {
          setConversationId(savedConversationId);
        }
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
        // Se houver erro, limpar dados corrompidos
        await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY);
        await AsyncStorage.removeItem(CONVERSATION_ID_STORAGE_KEY);
        setConversationHistory([getInitialMessage()]);
      }
    };

    loadConversation();
  }, []);

  // Salvar conversa sempre que ela mudar
  const saveConversation = useCallback(async (conversation: ConversationMessage[]) => {
    try {
      await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversation));
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
    }
  }, []);

  // Helper para obter token válido (com refresh automático se necessário)
  const getValidToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        // Tentar refresh do token
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshData.session?.access_token) {
          return null;
        }

        return refreshData.session.access_token;
      }

      return session.access_token;
    } catch (error) {
      console.error('Erro ao obter token válido:', error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<ChatResponse> => {
    // Adicionar mensagem do usuário imediatamente ao histórico com timestamp
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    const historyWithUserMessage = [...conversationHistory, userMessage];
    setConversationHistory(historyWithUserMessage);

    setLoading(true);

    try {
      // Obter token válido (com refresh automático se necessário)
      const token = await getValidToken();
      if (!token) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Enviar mensagem para a API do Dr. VAP
      const sendMessageUrl = buildApiUrl('sendMessage');

      const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId || undefined,
        }),
      });


      if (!response.ok) {
        if (__DEV__) {
          // Tentar ler o corpo da resposta para detalhes do erro
          try {
            const errorText = await response.text();
            console.log('Error response body:', errorText);
          } catch (e) {
            console.log('Could not read error response body');
          }

          console.log('Response not ok, status:', response.status);
        }

        if (response.status === 429) {
          throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
        } else if (response.status === 401) {
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        } else if (response.status >= 500) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        }
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      const result: ChatResponse = await response.json();

      // Atualizar histórico da conversa com a resposta da IA
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString()
      };
      const finalHistory: ConversationMessage[] = [
        ...historyWithUserMessage,
        assistantMessage,
      ];

      setConversationHistory(finalHistory);

      // Salvar conversa atualizada
      await saveConversation(finalHistory);

      // Atualizar conversation_id e informações de uso
      setConversationId(result.conversation_id);
      if (result.conversation_id) {
        await AsyncStorage.setItem(CONVERSATION_ID_STORAGE_KEY, result.conversation_id);
      }

      setUsage({
        messageCount: 0, // API não retorna mais message_count
        remainingMessages: result.remaining_messages,
        resetTime: '', // API não retorna mais reset_time
      });

      return result;

    } catch (error: any) {
      // Em caso de erro, remover a mensagem do usuário que foi adicionada
      setConversationHistory(conversationHistory);

      if (__DEV__) {
        console.error('=== ERRO NO SEND MESSAGE ===');
        console.error('Tipo do erro:', error.constructor.name);
        console.error('Mensagem:', error.message);
        console.error('Erro completo:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [conversationHistory, getValidToken, saveConversation]);


  const getUsageInfo = useCallback(async (): Promise<UsageInfo | null> => {
    try {
      // Obter token válido (com refresh automático se necessário)
      const token = await getValidToken();
      if (!token) return null;

      const response = await fetch(buildApiUrl('usage'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usageData = await response.json();
        const usageInfo: UsageInfo = {
          messageCount: usageData.message_count || 0,
          remainingMessages: usageData.remaining_messages || 20,
          resetTime: usageData.reset_time || '',
        };

        setUsage(usageInfo);
        return usageInfo;
      } else if (__DEV__) {
        console.log('Usage request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Erro ao obter informações de uso:', error);
    }
    return null;
  }, [getValidToken]);

  const verifyConnection = useCallback(async (): Promise<boolean> => {
    // Tentar produção primeiro
    try {
      const healthUrl = buildApiUrlWithFallback('health', false);
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (__DEV__) console.log('✅ Conectado à API de PRODUÇÃO');
        return true;
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Erro na API de produção:', error.message);
    }

    // Fallback para localhost se estiver em desenvolvimento
    if (__DEV__) {
      try {
        const fallbackUrl = buildApiUrlWithFallback('health', true);
        const response = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Conectado ao LOCALHOST (fallback)');
          // Atualizar configuração para usar localhost
          DR_VAP_API_CONFIG.baseURL = DR_VAP_API_CONFIG.fallbackURL;
          return true;
        }
      } catch (error) {
        console.error('❌ Erro no fallback localhost:', error.message);
      }
    }

    return false;
  }, []);

  return {
    conversationHistory,
    loading,
    usage,
    sendMessage,
    getUsageInfo,
    verifyConnection,
  };
};