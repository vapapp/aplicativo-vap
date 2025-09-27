import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase/client';
import { DR_VAP_API_CONFIG, buildApiUrl, ERROR_MESSAGES } from '../config';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
  message_count: number;
  remaining_messages: number;
  reset_time: string;
}

interface UsageInfo {
  messageCount: number;
  remainingMessages: number;
  resetTime: string;
}


const CONVERSATION_STORAGE_KEY = 'dr_vap_conversation';

const getInitialMessage = (): ConversationMessage => ({
  role: 'assistant',
  content: 'Olá! Eu sou o Dr. VAP, especialista em vias aéreas pediátricas. Estou aqui para ajudar você com questões sobre traqueostomia e cuidados respiratórios do seu filho. Como posso ajudá-lo hoje?'
});

export const useDrVAP = () => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([getInitialMessage()]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  // Carregar conversa salva ao inicializar
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const savedConversation = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
        if (savedConversation) {
          const parsed = JSON.parse(savedConversation);
          setConversationHistory(parsed);
        }
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
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
    setLoading(true);

    try {
      // Obter token válido (com refresh automático se necessário)
      const token = await getValidToken();
      if (!token) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Enviar mensagem para a API do Dr. VAP
      const response = await fetch(buildApiUrl('sendMessage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory,
        }),
      });

      if (!response.ok) {

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

      // Atualizar histórico da conversa
      const newHistory: ConversationMessage[] = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: result.response },
      ];

      setConversationHistory(newHistory);

      // Salvar conversa atualizada
      await saveConversation(newHistory);

      // Atualizar informações de uso
      setUsage({
        messageCount: result.message_count,
        remainingMessages: result.remaining_messages,
        resetTime: result.reset_time,
      });

      return result;

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
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
          messageCount: usageData.message_count,
          remainingMessages: usageData.remaining_messages,
          resetTime: usageData.reset_time,
        };
        setUsage(usageInfo);
        return usageInfo;
      }
    } catch (error) {
      console.error('Erro ao obter informações de uso:', error);
    }
    return null;
  }, [getValidToken]);

  const verifyConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(buildApiUrl('health'));
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
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