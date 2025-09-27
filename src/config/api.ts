// Configuração da API do Dr. VAP
export const DR_VAP_API_CONFIG = {
  // URL base - muda automaticamente entre dev e produção
  baseURL: __DEV__
    ? 'http://localhost:8000'  // Desenvolvimento - sua máquina local
    : 'https://seudominio.com', // Produção - quando subir para servidor

  // Timeout para requisições (30 segundos)
  timeout: 30000,

  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  },

  // Endpoints disponíveis
  endpoints: {
    health: '/health',
    verifyToken: '/api/v1/auth/verify-token',
    userInfo: '/api/v1/auth/me',
    sendMessage: '/api/v1/chat/message',
    usage: '/api/v1/chat/usage',
    documents: '/api/v1/chat/documents',
  },

  // Configurações do rate limiting
  rateLimit: {
    maxMessagesPerDay: 20,
    resetTime: '00:00:00', // Meia-noite
  },
} as const;

// Função helper para construir URLs completas
export const buildApiUrl = (endpoint: keyof typeof DR_VAP_API_CONFIG.endpoints): string => {
  return `${DR_VAP_API_CONFIG.baseURL}${DR_VAP_API_CONFIG.endpoints[endpoint]}`;
};

// Configurações específicas para desenvolvimento
export const DEV_CONFIG = {
  // Log de requisições em desenvolvimento
  enableLogging: __DEV__,

  // Mostrar informações de debug
  showDebugInfo: __DEV__,

  // Simular delay de rede em dev (em ms)
  simulateNetworkDelay: 0,
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  RATE_LIMIT_EXCEEDED: 'Limite de mensagens excedido. Tente novamente amanhã.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  INVALID_MESSAGE: 'Mensagem inválida. Tente novamente.',
  TIMEOUT: 'Timeout da requisição. Tente novamente.',
  OFFLINE: 'Dr. VAP está offline. Tente novamente em alguns minutos.',
} as const;