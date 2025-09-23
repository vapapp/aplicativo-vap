# 🗄️ Documentação do Banco de Dados - VapApp

Este documento descreve a estrutura completa do banco de dados Supabase utilizado no VapApp.

## 📋 Visão Geral

O VapApp utiliza **Supabase** (PostgreSQL) como banco de dados principal, com as seguintes características:

- **Row Level Security (RLS)** habilitado para segurança
- **Triggers automáticos** para campos de auditoria
- **Índices otimizados** para performance
- **Validações** via CHECK constraints

## 🏗️ Estrutura das Tabelas

### 📊 Tabela: `children`

**Finalidade**: Armazenar dados completos das crianças com traqueostomia cadastradas no sistema.

#### 🔑 Campos Principais

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ | Identificador único (PRIMARY KEY) |
| `user_id` | UUID | ✅ | ID do usuário responsável (FOREIGN KEY) |
| `created_at` | TIMESTAMPTZ | ✅ | Data/hora de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | Data/hora da última atualização |

#### 📝 Seção 1: Informações da Criança

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome_completo` | TEXT | ✅ | Nome completo da criança |
| `data_nascimento` | DATE | ✅ | Data de nascimento |
| `genero` | TEXT | ✅ | Gênero (masculino/feminino) |
| `numero_sus` | TEXT | ✅ | Número do Cartão SUS (15 dígitos) |
| `estado_nascimento` | TEXT | ✅ | Estado onde nasceu |
| `cidade_nascimento` | TEXT | ✅ | Cidade onde nasceu |
| `peso_nascer` | INTEGER | ✅ | Peso ao nascer (em gramas) |
| `semanas_prematuridade` | TEXT | ✅ | Semanas de gestação |
| `complicacoes_parto` | TEXT | ✅ | Se houve complicações no parto |
| `complicacoes_detalhes` | TEXT | ❌ | Detalhes das complicações |

#### 👨‍👩‍👧‍👦 Seção 2: Informações dos Pais/Responsáveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome_pai` | TEXT | ❌ | Nome do pai |
| `nome_mae` | TEXT | ❌ | Nome da mãe |
| `nome_responsavel` | TEXT | ❌ | Nome do responsável legal |
| `parentesco` | TEXT | ✅ | Relação com a criança |
| `outro_parentesco` | TEXT | ❌ | Especificar se "outro" |
| `data_nascimento_responsavel` | DATE | ✅ | Data nascimento do responsável |
| `telefone_contato` | TEXT | ✅ | Telefone para contato |
| `cep` | TEXT | ✅ | CEP do endereço |
| `rua` | TEXT | ✅ | Nome da rua |
| `numero` | TEXT | ✅ | Número da residência |
| `bairro` | TEXT | ✅ | Bairro |
| `cidade_endereco` | TEXT | ✅ | Cidade do endereço |
| `estado_endereco` | TEXT | ✅ | Estado do endereço |
| `nivel_estudo` | TEXT | ✅ | Nível de escolaridade |

#### 🤱 Seção 3: Gestação e Parto

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `gravidez_planejada` | TEXT | ✅ | Se a gravidez foi planejada |
| `acompanhamento_pre_natal` | TEXT | ✅ | Se fez pré-natal |
| `quantidade_consultas` | TEXT | ❌ | Quantas consultas de pré-natal |
| `problemas_gravidez` | TEXT[] | ❌ | Array com problemas na gravidez |
| `outros_problemas_gravidez` | TEXT | ❌ | Outros problemas não listados |
| `tipo_parto` | TEXT | ✅ | Tipo do parto realizado |
| `ajuda_especial_respiracao` | TEXT | ✅ | Se precisou ajuda para respirar |
| `tipos_ajuda_sala_parto` | TEXT[] | ❌ | Array com tipos de ajuda |

#### 🏥 Seção 4: Condição Clínica e Traqueostomia

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `idade_traqueostomia` | TEXT | ✅ | Idade quando fez traqueostomia |
| `motivos_traqueostomia` | TEXT[] | ✅ | Array com motivos da cirurgia |
| `outro_motivo_traqueostomia` | TEXT | ❌ | Outros motivos não listados |
| `tipo_traqueostomia` | TEXT | ✅ | Permanente ou temporária |
| `equipamentos_medicos` | TEXT[] | ✅ | Array com equipamentos usados |
| `outros_equipamentos` | TEXT | ❌ | Outros equipamentos não listados |

#### 👩‍⚕️ Seção 5: Acompanhamento Médico

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `internacoes_pos_traqueostomia` | TEXT | ✅ | Quantas internações após cirurgia |
| `acompanhamento_medico` | TEXT[] | ✅ | Array com especialistas que acompanham |
| `outro_especialista` | TEXT | ❌ | Outros especialistas não listados |
| `dificuldades_atendimento` | TEXT[] | ✅ | Array com dificuldades enfrentadas |
| `outra_dificuldade` | TEXT | ❌ | Outras dificuldades não listadas |

#### 🏠 Seção 6: Cuidados Diários

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `principal_cuidador` | TEXT | ✅ | Quem é o cuidador principal |
| `horas_cuidados_diarios` | TEXT | ✅ | Quantas horas de cuidado por dia |
| `treinamento_hospital` | TEXT | ✅ | Qualidade do treinamento recebido |

#### 💰 Seção 7: Recursos e Suporte Social

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `beneficio_financeiro` | TEXT | ✅ | Se recebe algum benefício |
| `qual_beneficio` | TEXT | ❌ | Qual benefício recebe |
| `acesso_materiais` | TEXT | ✅ | Facilidade para conseguir materiais |

#### 📝 Seção 8: Observações

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `observacoes_adicionais` | TEXT | ❌ | Campo livre para informações extras |

#### 🔄 Campos de Compatibilidade (Legado)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | TEXT | ❌ | Nome (campo antigo - mantido por compatibilidade) |
| `birth_date` | DATE | ❌ | Data nascimento (campo antigo) |
| `weight` | NUMERIC | ❌ | Peso (campo antigo) |
| `height` | NUMERIC | ❌ | Altura (campo antigo) |
| `allergies` | TEXT[] | ❌ | Alergias (campo antigo) |
| `observations` | TEXT | ❌ | Observações (campo antigo) |

## 🔐 Segurança (Row Level Security)

### Políticas RLS Ativas:

1. **`users_select_own_children`** - Usuários só podem VER seus próprios registros
2. **`users_insert_own_children`** - Usuários só podem INSERIR registros para si mesmos
3. **`users_update_own_children`** - Usuários só podem EDITAR seus próprios registros
4. **`users_delete_own_children`** - Usuários só podem DELETAR seus próprios registros

### Autenticação:
- Utiliza `auth.uid()` do Supabase Auth
- Vinculação através do campo `user_id`

## 📁 Arquivos de Setup

### Script de Criação da Tabela:
- **Localização**: `docs/database/supabase-setup.sql`
- **Conteúdo**: Schema completo, RLS, triggers, índices e validações
- **Uso**: Execute este arquivo no Supabase SQL Editor para criar toda a estrutura

## 📊 Índices de Performance

### Índices Criados:

| Índice | Campos | Finalidade |
|--------|--------|------------|
| `idx_children_user_id` | `user_id` | Busca por usuário |
| `idx_children_created_at` | `created_at DESC` | Ordenação cronológica |
| `idx_children_location` | `cidade_nascimento, estado_nascimento` | Busca geográfica |
| `idx_children_traqueo_type` | `tipo_traqueostomia` | Filtro por tipo |
| `idx_children_analytics` | `user_id, created_at, tipo_traqueostomia` | Relatórios |
| `idx_children_sus` | `numero_sus` | Validação duplicatas |
| `idx_children_nome` | `nome_completo` | Busca por nome |

## 🔧 Triggers Automáticos

### `set_updated_at`
- **Disparo**: BEFORE UPDATE
- **Função**: `handle_updated_at()`
- **Ação**: Atualiza automaticamente o campo `updated_at` com timestamp atual

## ✅ Validações (CHECK Constraints)

### Campos com Valores Limitados:

- `genero`: 'masculino' | 'feminino'
- `semanas_prematuridade`: 'menos_28' | '28_36' | '37_41' | 'mais_41'
- `complicacoes_parto`: 'sim' | 'nao'
- `parentesco`: 'pai' | 'mae' | 'avo' | 'tio' | 'outro' | 'cuidador'
- `nivel_estudo`: múltiplas opções de escolaridade
- E muitos outros campos com validações específicas...

## 🔄 Integração com a Aplicação

### Service Layer:
- **Arquivo**: `src/services/children/childrenService.ts`
- **Métodos**: `createChild()`, `getChildren()`, `getChildById()`, `updateChild()`, `deleteChild()`
- **Transformação**: Converte dados do formulário para formato do banco automaticamente

### Formulário:
- **Arquivo**: `src/components/forms/ChildRegistrationForm.tsx`
- **Seções**: 8 seções navegáveis com validação por etapa
- **Persistência**: Dados salvos entre navegações das seções

## 📈 Estatísticas e Monitoramento

### Dados Úteis para Análise:
- Distribuição geográfica (estado/cidade de nascimento)
- Tipos de traqueostomia (permanente vs temporária)
- Idade na realização da cirurgia
- Equipamentos médicos mais utilizados
- Dificuldades de atendimento mais comuns
- Perfil socioeconômico (nível educação, benefícios)

---

*Documentação gerada automaticamente - VapApp v1.0*