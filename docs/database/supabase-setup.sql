-- ============================================================================
-- SUPABASE SETUP PARA PRODUÇÃO - FORMULÁRIO DE CADASTRO DE CRIANÇAS
-- ============================================================================

-- Tabela principal para armazenar dados das crianças cadastradas
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Seção 1: Informações da Criança
    nome_completo TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    genero TEXT CHECK (genero IN ('masculino', 'feminino')) NOT NULL,
    numero_sus TEXT NOT NULL,
    estado_nascimento TEXT NOT NULL,
    cidade_nascimento TEXT NOT NULL,
    peso_nascer INTEGER NOT NULL, -- em gramas
    semanas_prematuridade TEXT CHECK (semanas_prematuridade IN ('menos_28', '28_36', '37_41', 'mais_41')) NOT NULL,
    complicacoes_parto TEXT CHECK (complicacoes_parto IN ('sim', 'nao')) NOT NULL,
    complicacoes_detalhes TEXT,

    -- Seção 2: Informações dos Pais ou Responsáveis
    nome_pai TEXT,
    nome_mae TEXT,
    nome_responsavel TEXT,
    parentesco TEXT CHECK (parentesco IN ('pai', 'mae', 'avo', 'tio', 'outro', 'cuidador')) NOT NULL,
    outro_parentesco TEXT,
    data_nascimento_responsavel DATE,
    telefone_contato TEXT NOT NULL,
    cep TEXT NOT NULL,
    rua TEXT NOT NULL,
    numero TEXT NOT NULL,
    bairro TEXT NOT NULL,
    cidade_endereco TEXT NOT NULL,
    estado_endereco TEXT NOT NULL,
    nivel_estudo TEXT CHECK (nivel_estudo IN ('nao_estudei', 'fundamental_incompleto', 'fundamental_completo', 'medio_incompleto', 'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao')) NOT NULL,

    -- Seção 3: Informação sobre a Gestação e o Parto
    gravidez_planejada TEXT CHECK (gravidez_planejada IN ('sim', 'nao', 'nao_sei')) NOT NULL,
    acompanhamento_pre_natal TEXT CHECK (acompanhamento_pre_natal IN ('sim', 'nao')) NOT NULL,
    quantidade_consultas TEXT CHECK (quantidade_consultas IN ('nenhuma', 'menos_5', 'entre_5_7', '8_ou_mais')),
    problemas_gravidez TEXT[] DEFAULT '{}', -- Array de strings
    outros_problemas_gravidez TEXT,
    tipo_parto TEXT CHECK (tipo_parto IN ('normal', 'cesarea', 'forceps', 'nao_sei')) NOT NULL,
    ajuda_especial_respiracao TEXT CHECK (ajuda_especial_respiracao IN ('sim', 'nao', 'nao_sei')) NOT NULL,
    tipos_ajuda_sala_parto TEXT[] DEFAULT '{}', -- Array de strings

    -- Seção 4: Condição Clínica da Criança e Traqueostomia
    idade_traqueostomia TEXT CHECK (idade_traqueostomia IN ('nascimento', 'primeiro_mes', 'primeiros_6_meses', 'primeiro_ano', 'apos_primeiro_ano', 'nao_sei')) NOT NULL,
    motivos_traqueostomia TEXT[] DEFAULT '{}' NOT NULL, -- Array de strings
    outro_motivo_traqueostomia TEXT,
    tipo_traqueostomia TEXT CHECK (tipo_traqueostomia IN ('permanente', 'temporaria', 'nao_sei_tipo')) NOT NULL,
    equipamentos_medicos TEXT[] DEFAULT '{}' NOT NULL, -- Array de strings
    outros_equipamentos TEXT,

    -- Seção 5: Acompanhamento Médico e Dificuldades
    internacoes_pos_traqueostomia TEXT CHECK (internacoes_pos_traqueostomia IN ('nenhuma', '1_a_5', 'mais_de_5', 'nao_sei_internacoes')) NOT NULL,
    acompanhamento_medico TEXT[] DEFAULT '{}' NOT NULL, -- Array de strings
    outro_especialista TEXT,
    dificuldades_atendimento TEXT[] DEFAULT '{}' NOT NULL, -- Array de strings
    outra_dificuldade TEXT,

    -- Seção 6: Cuidados Diários em Casa
    principal_cuidador TEXT CHECK (principal_cuidador IN ('pai', 'mae', 'outro_familiar', 'cuidador_profissional')) NOT NULL,
    horas_cuidados_diarios TEXT CHECK (horas_cuidados_diarios IN ('menos_1_hora', 'entre_1_3_horas', 'mais_3_horas')) NOT NULL,
    treinamento_hospital TEXT CHECK (treinamento_hospital IN ('sim_seguro', 'sim_com_duvidas', 'nao_suficiente', 'nao_recebi')) NOT NULL,

    -- Seção 7: Acesso a Recursos e Suporte Social
    beneficio_financeiro TEXT CHECK (beneficio_financeiro IN ('sim', 'nao')) NOT NULL,
    qual_beneficio TEXT,
    acesso_materiais TEXT CHECK (acesso_materiais IN ('sempre_conseguimos', 'as_vezes', 'muita_dificuldade', 'nao_conseguimos')) NOT NULL,

    -- Seção 8: Observações Adicionais
    observacoes_adicionais TEXT,

    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice principal para busca por usuário
CREATE INDEX IF NOT EXISTS idx_children_user_id ON public.children(user_id);

-- Índice para busca por data de criação
CREATE INDEX IF NOT EXISTS idx_children_created_at ON public.children(created_at DESC);

-- Índice para busca por cidade/estado
CREATE INDEX IF NOT EXISTS idx_children_location ON public.children(cidade_nascimento, estado_nascimento);

-- Índice para busca por tipo de traqueostomia
CREATE INDEX IF NOT EXISTS idx_children_traqueo_type ON public.children(tipo_traqueostomia);

-- Índice composto para relatórios
CREATE INDEX IF NOT EXISTS idx_children_analytics ON public.children(user_id, created_at DESC, tipo_traqueostomia);

-- ============================================================================
-- TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela children
DROP TRIGGER IF EXISTS set_updated_at ON public.children;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA PARA PRODUÇÃO
-- ============================================================================

-- Habilitar RLS na tabela
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios registros
CREATE POLICY "users_select_own_children" ON public.children
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir registros para si mesmos
CREATE POLICY "users_insert_own_children" ON public.children
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios registros
CREATE POLICY "users_update_own_children" ON public.children
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios registros
CREATE POLICY "users_delete_own_children" ON public.children
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNÇÃO AUXILIAR PARA VALIDAÇÃO DE DADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_child_data(child_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validar campos obrigatórios
    IF NOT (child_data ? 'nome_completo' AND
            child_data ? 'data_nascimento' AND
            child_data ? 'genero' AND
            child_data ? 'numero_sus' AND
            child_data ? 'telefone_contato') THEN
        RAISE EXCEPTION 'Campos obrigatórios não preenchidos';
    END IF;

    -- Validar formato da data
    IF NOT (child_data->>'data_nascimento')::DATE <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Data de nascimento inválida';
    END IF;

    -- Validar número SUS (deve ter 15 dígitos)
    IF LENGTH(REGEXP_REPLACE(child_data->>'numero_sus', '[^0-9]', '', 'g')) != 15 THEN
        RAISE EXCEPTION 'Número SUS deve ter 15 dígitos';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW PARA RELATÓRIOS E CONSULTAS SIMPLIFICADAS
-- ============================================================================

CREATE OR REPLACE VIEW public.children_summary AS
SELECT
    id,
    user_id,
    nome_completo,
    data_nascimento,
    genero,
    cidade_nascimento,
    estado_nascimento,
    tipo_traqueostomia,
    principal_cuidador,
    created_at,
    updated_at,
    -- Campos calculados
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) AS idade_anos,
    EXTRACT(MONTH FROM AGE(CURRENT_DATE, data_nascimento)) AS idade_meses_total,
    CASE
        WHEN tipo_traqueostomia = 'permanente' THEN 'Permanente'
        WHEN tipo_traqueostomia = 'temporaria' THEN 'Temporária'
        ELSE 'Não informado'
    END AS tipo_traqueostomia_label
FROM public.children;

-- Aplicar RLS na view também
ALTER VIEW public.children_summary SET (security_invoker = true);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.children IS 'Tabela principal para armazenar dados completos das crianças com traqueostomia cadastradas no VapApp';
COMMENT ON COLUMN public.children.user_id IS 'ID do usuário responsável pelo cadastro (pai/mãe/cuidador)';
COMMENT ON COLUMN public.children.numero_sus IS 'Número do Cartão SUS com 15 dígitos';
COMMENT ON COLUMN public.children.peso_nascer IS 'Peso ao nascer em gramas';
COMMENT ON COLUMN public.children.problemas_gravidez IS 'Array com problemas durante a gravidez selecionados';
COMMENT ON COLUMN public.children.motivos_traqueostomia IS 'Array com motivos que levaram à traqueostomia';
COMMENT ON COLUMN public.children.equipamentos_medicos IS 'Array com equipamentos médicos utilizados';

-- ============================================================================
-- INSERIR DADOS DE EXEMPLO (OPCIONAL - APENAS PARA DESENVOLVIMENTO)
-- ============================================================================

-- Exemplo de inserção de dados (descomente apenas em desenvolvimento)
/*
INSERT INTO public.children (
    user_id,
    nome_completo,
    data_nascimento,
    genero,
    numero_sus,
    estado_nascimento,
    cidade_nascimento,
    peso_nascer,
    semanas_prematuridade,
    complicacoes_parto,
    parentesco,
    telefone_contato,
    cep,
    rua,
    numero,
    bairro,
    cidade_endereco,
    estado_endereco,
    nivel_estudo,
    gravidez_planejada,
    acompanhamento_pre_natal,
    tipo_parto,
    ajuda_especial_respiracao,
    idade_traqueostomia,
    motivos_traqueostomia,
    tipo_traqueostomia,
    equipamentos_medicos,
    internacoes_pos_traqueostomia,
    acompanhamento_medico,
    dificuldades_atendimento,
    principal_cuidador,
    horas_cuidados_diarios,
    treinamento_hospital,
    beneficio_financeiro,
    acesso_materiais
) VALUES (
    auth.uid(), -- Será substituído pelo ID do usuário logado
    'Maria Silva Santos',
    '2020-05-15',
    'feminino',
    '123456789012345',
    'São Paulo',
    'São Paulo',
    2800,
    '28_36',
    'sim',
    'mae',
    '(11) 99999-9999',
    '01234-567',
    'Rua das Flores',
    '123',
    'Centro',
    'São Paulo',
    'São Paulo',
    'medio_completo',
    'sim',
    'sim',
    'cesarea',
    'sim',
    'nascimento',
    ARRAY['malformacao_congenita', 'insuficiencia_respiratoria'],
    'permanente',
    ARRAY['ventilador_mecanico', 'aspirador'],
    '1_a_5',
    ARRAY['pneumologista', 'cardiologista'],
    ARRAY['dificuldade_marcacao', 'demora_atendimento'],
    'mae',
    'mais_3_horas',
    'sim_seguro',
    'sim',
    'sempre_conseguimos'
);
*/