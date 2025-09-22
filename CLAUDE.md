# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

Este é um aplicativo React Native Expo chamado "VapApp" construído com TypeScript. O aplicativo usa Supabase para serviços de backend, Zustand para gerenciamento de estado e React Navigation para roteamento. Atualmente implementa um sistema de autenticação completo, portal para pais e cuidadores, sistema de edição de perfil com verificação e calculadora médica de cânula de traqueostomia.

## Comandos de Desenvolvimento

- `npm start` ou `expo start` - Iniciar o servidor de desenvolvimento Expo
- `npm run android` ou `expo start --android` - Iniciar no dispositivo/emulador Android
- `npm run ios` ou `expo start --ios` - Iniciar no dispositivo/simulador iOS
- `npm run web` ou `expo start --web` - Iniciar versão web

## Arquitetura

### Estrutura de Diretórios

```
src/
├── components/          # Componentes UI reutilizáveis
│   ├── ui/             # Componentes UI base (Button, Input, Typography, Toast, ReadOnlyField)
│   ├── calculators/    # Componentes de calculadoras médicas (TraqueostomiaCalculator)
│   └── common/         # Componentes comuns com lógica de negócio
│       ├── Header.tsx           # Header padrão reutilizável com botão voltar
│       ├── ProfileCard.tsx      # Card de perfil do usuário
│       ├── SectionCard.tsx      # Card de seção com título
│       ├── ActionButton.tsx     # Botão de ação com ícone
│       ├── ResourceGrid.tsx     # Grid de recursos em 2 colunas
│       └── VerificationModal.tsx # Modal de verificação de código
├── screens/            # Componentes de tela organizados por funcionalidade
│   ├── auth/           # Telas de autenticação
│   ├── HomeScreen.tsx           # Portal principal para pais e cuidadores
│   ├── EditProfileScreen.tsx    # Edição de perfil com modo read/edit
│   ├── TraqueostomiaScreen.tsx  # Tela da calculadora de cânulas
│   └── EmailUpdatedScreen.tsx   # Confirmação de email atualizado
├── navigation/         # Configuração de navegação e tipos
├── services/           # Integrações de API e serviços externos
│   ├── auth/           # Camada de serviços de autenticação
│   └── supabase/       # Configuração do cliente Supabase
├── stores/             # Stores de gerenciamento de estado Zustand
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias e constantes
│   └── constants/      # Constantes do app (cores, fontes, tamanhos)
└── assets/             # Assets estáticos (imagens, ícones)
```

### Tecnologias Principais

- **Frontend**: React Native (0.81.4) com Expo (~54.0.9)
- **Backend**: Supabase com `@supabase/supabase-js`
- **Gerenciamento de Estado**: Zustand para estado global
- **Navegação**: React Navigation v7 (native stack)
- **Formulários**: React Hook Form com validação Yup
- **Armazenamento**: Expo Secure Store para persistência de tokens
- **Upload de Imagens**: Expo Image Picker
- **Seleção**: @react-native-picker/picker

### Sistema de Autenticação

O aplicativo usa Supabase Auth com a seguinte configuração:
- **Cliente**: `src/services/supabase/client.ts` - Configurado com adaptador Expo Secure Store
- **Camada de Serviços**: `src/services/auth/authService.ts` - Abstração das operações de auth
- **Gerenciamento de Estado**: `src/stores/authStore.ts` - Store Zustand para estado de auth
- **Telas**: Todas as telas de auth em `src/screens/auth/`

O estado de autenticação é gerenciado globalmente através do Zustand e persistido de forma segura usando o Expo Secure Store.

### Sistema de Verificação

Implementa verificação de email e telefone:
- **Verificação de Email**: Usando Supabase Auth com deep linking
- **Verificação de Telefone**: Sistema de SMS (em desenvolvimento)
- **Modal de Verificação**: Componente reutilizável para códigos de 6 dígitos
- **Deep Linking**: Configurado para `vapapp://` e rotas específicas

### Estrutura de Navegação

A navegação é manipulada pelo React Navigation com suporte TypeScript:
- **Navegador Principal**: `src/navigation/AppNavigator.tsx`
- **Definições de Tipos**: Todas as rotas tipadas em `RootStackParamList`
- **Deep Linking**: Configurado para redefinição de senha e confirmação de email

### Arquitetura de Componentes

- **Componentes UI**: Componentes base em `src/components/ui/`
- **Componentes Comuns**: Componentes reutilizáveis em `src/components/common/`
- **Calculadoras**: Componentes médicos especializados em `src/components/calculators/`
- **Exports de Índice**: Cada diretório tem um `index.ts` para imports limpos

### Paleta de Cores e Design System

- **Cor Principal**: `Colors.vapapp.teal` (#2A7F7E) - Headers e elementos primários
- **Cores Neutras**: Escala de cinzas para textos e backgrounds
- **Headers Padronizados**: Todos os headers usam fundo verde ocupando toda a status bar
- **Tipografia**: Sistema consistente com variantes (h1, h2, h3, body, caption, subtitle)

### Configuração de Ambiente

O aplicativo usa variáveis de ambiente para configuração do Supabase:
- `EXPO_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## Convenções de Código

- **TypeScript**: Modo strict habilitado
- **Exports Barrel**: Padrão index.ts para exports limpos
- **Imports Organizados**: Caminhos relativos organizados
- **Props de Componentes**: Tipadas com interfaces
- **Stores Zustand**: Seguem padrão funcional
- **Constantes**: Cores, fontes e tamanhos definidos como constantes
- **Headers Padronizados**: Sempre usar componente `Header` reutilizável

## Funcionalidades Implementadas

### Portal Principal (HomeScreen)
- Interface para pais e cuidadores
- Card de perfil do usuário com nome e avatar
- Seções organizadas: Gestão de cuidados, Suporte, Recursos
- Navegação para calculadora de cânulas

### Sistema de Perfil
- Edição completa de perfil com modo read/edit
- Upload de foto de perfil com câmera/galeria
- Verificação de email com deep linking
- Verificação de telefone com SMS
- Máscara de telefone brasileiro
- Campos readonly para dados não editáveis

### Calculadora Médica
- Calculadora de cânula de traqueostomia
- Validação de idade (apenas números inteiros)
- Seletor de unidade (anos/meses) com interface intuitiva
- Cálculos médicos precisos baseados em fórmulas pediátricas
- Interface mobile-friendly com KeyboardAvoidingView

### Sistema de UX Mobile
- Headers verdes ocupando toda a status bar
- KeyboardAvoidingView em todas as telas relevantes
- Máscaras de input (telefone brasileiro)
- Validações em tempo real
- Feedback visual consistente

## Padrões de Desenvolvimento

### Headers
Sempre usar o componente `Header` reutilizável:
```typescript
// Header simples
<Header title="Título da Página" />

// Header com botão voltar
<Header title="Título da Página" showBackButton />

// Header com elemento customizado
<Header title="Título" showBackButton rightElement={<BotãoCustomizado />} />
```

### Formulários
- Usar React Hook Form + Yup para validação
- KeyboardAvoidingView para UX mobile
- Validações em tempo real
- Feedback visual claro

### Navegação
- Todas as rotas tipadas em `RootStackParamList`
- Deep linking configurado
- Navegação condicional baseada em autenticação

### Gerenciamento de Estado
- Zustand para estado global
- Stores funcionais e tipados
- Persistência segura com Expo Secure Store