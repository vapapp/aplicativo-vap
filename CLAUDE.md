# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

Este é um aplicativo React Native Expo chamado "VapApp" construído com TypeScript. O aplicativo usa Supabase para serviços de backend, Zustand para gerenciamento de estado e React Navigation para roteamento. Atualmente implementa um sistema de autenticação completo, portal para pais e cuidadores, sistema de edição de perfil com verificação, calculadora médica de cânula de traqueostomia e formulário completo de cadastro de crianças com integração Supabase.

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
│   ├── ui/             # Componentes UI base (Button, Input, Typography, Toast, ReadOnlyField, ProgressBar)
│   ├── forms/          # Componentes de formulários (ChildRegistrationForm)
│   ├── calculators/    # Componentes de calculadoras médicas (TraqueostomiaCalculator)
│   └── common/         # Componentes comuns com lógica de negócio
│       ├── Header.tsx           # Header padrão reutilizável com botão voltar
│       ├── ProfileCard.tsx      # Card de perfil do usuário
│       ├── SectionCard.tsx      # Card de seção com título
│       ├── ActionButton.tsx     # Botão de ação com ícone
│       ├── ResourceGrid.tsx     # Grid de recursos em 2 colunas
│       ├── VerificationModal.tsx # Modal de verificação de código
│       └── SUSHelpModal.tsx     # Modal de ajuda sobre cartão SUS
├── screens/            # Componentes de tela organizados por funcionalidade
│   ├── auth/           # Telas de autenticação
│   ├── calculator/     # Futuras calculadoras médicas (estrutura criada)
│   ├── community/      # Funcionalidades de comunidade (futuro)
│   ├── marketplace/    # Mercado de compras (futuro)
│   ├── profile/        # Telas de perfil expandidas (futuro)
│   ├── quiz/           # Sistema de quiz educativo (futuro)
│   ├── sac/            # Serviço de atendimento (futuro)
│   ├── videos/         # Biblioteca de vídeos (futuro)
│   ├── HomeScreen.tsx           # Portal principal para pais e cuidadores
│   ├── EditProfileScreen.tsx    # Edição de perfil com modo read/edit
│   ├── RegisterChildScreen.tsx  # Tela de cadastro de crianças
│   ├── TraqueostomiaScreen.tsx  # Tela da calculadora de cânulas
│   └── EmailUpdatedScreen.tsx   # Confirmação de email atualizado
├── navigation/         # Configuração de navegação e tipos
├── services/           # Integrações de API e serviços externos
│   ├── auth/           # Camada de serviços de autenticação
│   ├── children/       # Serviços de cadastro de crianças (CRUD completo)
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

### Sistema de Cadastro de Crianças - Fluxo Completo

O sistema de cadastro implementa um fluxo profissional de 3 etapas: **Introdução → Formulário → Sucesso**

#### 1. Página de Introdução (ChildRegistrationIntro)
- **Apresentação completa** do formulário e processo de cadastro
- **Estimativa de tempo**: 15-20 minutos para preenchimento completo
- **Listagem de seções**: Mostra as 8 seções que serão preenchidas
- **Funcionalidades destacadas**: Auto-save, validações inteligentes, busca automática de endereço
- **Design profissional**: Interface classe mundial com ícones e descrições claras
- **Botões de ação**: "Iniciar Cadastro" e "Cancelar"

#### 2. Formulário Multi-Seção (ChildRegistrationForm)
Formulário completo dividido em 8 seções navegáveis:
- **Seção 1**: Informações básicas da criança (nome, nascimento, SUS, localização)
- **Seção 2**: Informações dos pais/responsáveis (contatos, endereço, educação)
- **Seção 3**: Gestação e parto (planejamento, pré-natal, complicações, tipo de parto)
- **Seção 4**: Condição clínica e traqueostomia (idade, motivos, tipo, equipamentos)
- **Seção 5**: Acompanhamento médico e dificuldades (internações, especialistas)
- **Seção 6**: Cuidados domiciliares diários (cuidador principal, horas de cuidado)
- **Seção 7**: Recursos e suporte social (benefícios, acesso a materiais)
- **Seção 8**: Observações adicionais (campo livre para informações extras com limite de 300 caracteres)

#### 3. Página de Sucesso (ChildRegistrationSuccess)
- **Confirmação visual** com ícone de sucesso e animações
- **Informações do cadastro**: Nome da criança, ID de registro, data/hora do cadastro
- **Próximos passos**: Orientações sobre segurança dos dados e acesso aos recursos
- **Contato para atualizações**: Email prominente (comunicacao@vap-app.com.br) com botão direto
- **Botão "Enviar Email"**: Abre cliente de email automaticamente
- **Retorno ao portal**: Botão "Voltar ao Portal" para navegação

#### Características Avançadas do Formulário
- **Auto-save inteligente**: Salvamento automático com debouncing de 1 segundo usando AsyncStorage
- **Navegação por seções** com barra de progresso aprimorada (mostra campos obrigatórios preenchidos)
- **Validação por seção** - usuário só avança se completar campos obrigatórios
- **Persistência de dados** - dados mantidos durante navegação e recuperados em caso de fechamento acidental
- **Integração com APIs externas**: IBGE (estados/cidades) e ViaCEP (busca automática de endereço por CEP)
- **Integração Supabase**: Salvamento completo e seguro com childrenService
- **Componentes avançados**: Dropdowns modais, checkboxes múltiplos, campos condicionais com limpeza automática
- **Modal de ajuda** para cartão SUS com exemplo visual interativo
- **Máscaras inteligentes**: SUS (000 0000 0000 0000), detecção automática de tipo de telefone, CEP, datas
- **Sistema de limpeza automática**: Campos condicionais são limpos quando dependência muda
- **Validações médicas inteligentes**:
  - Algoritmo de verificação de dígito do SUS
  - Validação de coerência de idade (responsável deve ter 14-70 anos a mais que a criança)
  - Validação de peso vs semanas de gestação
  - Validação de CEP em tempo real
- **UX profissional**: Error highlighting consistente, scroll automático para erros, feedback visual claro
- **Responsividade**: Interface adaptada para diferentes tamanhos de tela

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
- Barra de progresso para formulários multi-seção

### Integração Supabase Completa
- **Database**: Tabela `children` com 55+ campos organizados em 8 seções
- **Service Layer**: `childrenService` com CRUD completo e transformação de dados
- **Segurança**: Row Level Security (RLS) com políticas por usuário
- **Validações**: Constraints de banco + validações client-side
- **Performance**: Índices otimizados para buscas e relatórios
- **Auditoria**: Triggers automáticos para campos de timestamp
- **Compatibilidade**: Suporte a campos legados para migrações
- **Documentação**: DATABASE.md com estrutura completa do banco

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

#### Formulários Multi-Seção
Para formulários complexos, usar o padrão implementado no ChildRegistrationForm:
```typescript
// 1. Estado para dados por seção
const [sectionsData, setSectionsData] = useState<{ [key: number]: Partial<FormData> }>({});

// 2. Auto-save com debouncing
const debouncedSaveData = useCallback(
  debounce((data: Partial<ChildFormData>) => {
    AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  }, 1000),
  []
);

// 3. Função para definir campos por seção
const getSectionFields = (section: number): string[] => {
  switch (section) {
    case 1: return ['nomeCompleto', 'dataNascimento', 'numeroSUS'];
    case 2: return ['nomeResponsavel', 'telefoneContato', 'cep'];
  }
};

// 4. Salvar dados da seção atual
const saveSectionData = () => {
  const currentData = getValues();
  const sectionFields = getSectionFields(currentSection);
  // ... lógica de salvamento com AsyncStorage
};

// 5. Navegação com limpeza e carregamento
const handleNextSection = async () => {
  saveSectionData();
  clearFormData();
  setCurrentSection(nextSection);
  setTimeout(() => loadSectionDataOnce(nextSection), 100);
};

// 6. Limpeza automática de campos condicionais
useEffect(() => {
  const ajudaEspecial = watchForm('ajudaEspecialRespiracao');
  if (ajudaEspecial !== 'sim') {
    setValue('tiposAjudaSalaParto', []);
  }
}, [watchForm('ajudaEspecialRespiracao')]);
```

#### Características Essenciais para Formulários Multi-Seção
- **Auto-save inteligente**: Implementar debouncing de 1 segundo com AsyncStorage
- **Validação por seção**: Usar schemas Yup separados por seção com validações médicas
- **Persistência entre navegações**: Salvar/carregar dados automaticamente
- **Limpeza de formulário**: Reset entre seções para evitar conflitos
- **Barra de progresso aprimorada**: Mostrar contagem de campos obrigatórios preenchidos
- **Componentes condicionais**: Campos com limpeza automática usando useEffect
- **Integração com APIs**: ViaCEP para endereços, IBGE para localidades
- **Máscaras inteligentes**: Formatação automática de SUS, telefone, CEP, datas
- **Validações médicas**: Algoritmos específicos para dados médicos (SUS, idades, pesos)
- **UX consistente**: Error highlighting padronizado em todos os tipos de campo

### Navegação
- Todas as rotas tipadas em `RootStackParamList`
- Deep linking configurado
- Navegação condicional baseada em autenticação

### Gerenciamento de Estado
- Zustand para estado global
- Stores funcionais e tipados
- Persistência segura com Expo Secure Store

## Problemas Conhecidos e Soluções

### Formulários Multi-Seção - useEffect Loop
**Problema**: useEffect com dependência `sectionsData` causa loop infinito impedindo digitação.
**Solução**: Remover `sectionsData` das dependências e usar carregamento manual com setTimeout.

### React Hook Form - Campo "watch is not a function"
**Problema**: Conflito de nomes ao usar `watch` do useForm.
**Solução**: Renomear para `watch: watchForm` na desestruturação do useForm.

### Persistência de Dados Entre Seções
**Problema**: Dados de seções anteriores aparecem em seções seguintes.
**Solução**: Implementar sistema de limpeza com `reset()` e carregamento seletivo por seção.

### Validação Condicional - Persistência de Dados Ocultos
**Problema**: Quando campo condicional é desmarcado, dados ocultos continuam sendo enviados para o banco.
**Solução**: Implementar limpeza automática com useEffect:
```typescript
useEffect(() => {
  const ajudaEspecial = watchForm('ajudaEspecialRespiracao');
  if (ajudaEspecial !== 'sim') {
    setValue('tiposAjudaSalaParto', []);
  }
}, [watchForm('ajudaEspecialRespiracao')]);
```

### Validação de Idade - Erro Matemático
**Problema**: Validação de idade entre responsável e criança com cálculo invertido.
**Solução**: Corrigir cálculo de `(childDate - parentDate)` para `(parentDate - childDate)` e condição de `>= -70 && <= -14` para `>= 14 && <= 70`.

### Error Styling Inconsistente
**Problema**: Campos de formulário com styling de erro inconsistente (alguns com borda vermelha, outros apenas texto).
**Solução**: Padronizar error styling removendo overrides de `styles.input` e garantir que todos os tipos de campo (Input, RadioGroup, CheckboxGroup, Dropdown) implementem error highlighting consistente.

### Alinhamento de TextArea
**Problema**: TextArea em campos multiline centralizado verticalmente em vez de alinhado ao topo.
**Solução**: Adicionar `textAlignVertical: 'top'` no inputStyle para campos multiline.

## Comandos de Produção

### Testes e Build
- `npm run lint` - Executar linting (quando disponível)
- `npm run typecheck` - Verificar tipos TypeScript (quando disponível)
- Sempre executar estes comandos antes de commits importantes

### Deploy
- Verificar todas as validações antes de fazer push
- Testar formulários completos em diferentes dispositivos
- Validar integrações com APIs externas (IBGE, ViaCEP)