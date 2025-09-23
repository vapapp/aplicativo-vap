import { supabase } from '../supabase/client';

// Interface para os dados do formulário que será salvo no Supabase
export interface ChildData {
  // Seção 1: Informações da Criança
  nome_completo: string;
  data_nascimento: string; // formato YYYY-MM-DD
  genero: 'masculino' | 'feminino';
  numero_sus: string;
  estado_nascimento: string;
  cidade_nascimento: string;
  peso_nascer: number; // em gramas
  semanas_prematuridade: 'menos_28' | '28_36' | '37_41' | 'mais_41';
  complicacoes_parto: 'sim' | 'nao';
  complicacoes_detalhes?: string;

  // Seção 2: Informações dos Pais ou Responsáveis
  nome_pai?: string;
  nome_mae?: string;
  nome_responsavel?: string;
  parentesco: 'pai' | 'mae' | 'avo' | 'tio' | 'outro' | 'cuidador';
  outro_parentesco?: string;
  data_nascimento_responsavel?: string;
  telefone_contato: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade_endereco: string;
  estado_endereco: string;
  nivel_estudo: 'nao_estudei' | 'fundamental_incompleto' | 'fundamental_completo' | 'medio_incompleto' | 'medio_completo' | 'superior_incompleto' | 'superior_completo' | 'pos_graduacao';

  // Seção 3: Informação sobre a Gestação e o Parto
  gravidez_planejada: 'sim' | 'nao' | 'nao_sei';
  acompanhamento_pre_natal: 'sim' | 'nao';
  quantidade_consultas?: 'nenhuma' | 'menos_5' | 'entre_5_7' | '8_ou_mais';
  problemas_gravidez: string[];
  outros_problemas_gravidez?: string;
  tipo_parto: 'normal' | 'cesarea' | 'forceps' | 'nao_sei';
  ajuda_especial_respiracao: 'sim' | 'nao' | 'nao_sei';
  tipos_ajuda_sala_parto: string[];

  // Seção 4: Condição Clínica da Criança e Traqueostomia
  idade_traqueostomia: 'nascimento' | 'primeiro_mes' | 'primeiros_6_meses' | 'primeiro_ano' | 'apos_primeiro_ano' | 'nao_sei';
  motivos_traqueostomia: string[];
  outro_motivo_traqueostomia?: string;
  tipo_traqueostomia: 'permanente' | 'temporaria' | 'nao_sei_tipo';
  equipamentos_medicos: string[];
  outros_equipamentos?: string;

  // Seção 5: Acompanhamento Médico e Dificuldades
  internacoes_pos_traqueostomia: 'nenhuma' | '1_a_5' | 'mais_de_5' | 'nao_sei_internacoes';
  acompanhamento_medico: string[];
  outro_especialista?: string;
  dificuldades_atendimento: string[];
  outra_dificuldade?: string;

  // Seção 6: Cuidados Diários em Casa
  principal_cuidador: 'pai' | 'mae' | 'outro_familiar' | 'cuidador_profissional';
  horas_cuidados_diarios: 'menos_1_hora' | 'entre_1_3_horas' | 'mais_3_horas';
  treinamento_hospital: 'sim_seguro' | 'sim_com_duvidas' | 'nao_suficiente' | 'nao_recebi';

  // Seção 7: Acesso a Recursos e Suporte Social
  beneficio_financeiro: 'sim' | 'nao';
  qual_beneficio?: string;
  acesso_materiais: 'sempre_conseguimos' | 'as_vezes' | 'muita_dificuldade' | 'nao_conseguimos';

  // Seção 8: Observações Adicionais
  observacoes_adicionais?: string;
}

// Interface para dados retornados do banco
export interface Child extends ChildData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const isDev = __DEV__;

const log = (message: string, data?: any) => {
  if (isDev) {
    console.log(`[ChildrenService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (isDev) {
    console.error(`[ChildrenService] ${message}`, error || '');
  }
};

class ChildrenService {
  /**
   * Transforma os dados do formulário para o formato do banco de dados
   */
  private transformFormDataToDatabase(formData: any): ChildData {
    // Converter data de nascimento para formato YYYY-MM-DD
    const convertDate = (dateString: string): string => {
      if (!dateString) return '';

      // Se já está no formato correto, retorna
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }

      // Se está no formato DD/MM/YYYY, converte
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }

      return dateString;
    };

    // Limpar número SUS (manter apenas dígitos)
    const cleanSUS = (sus: string): string => {
      return sus.replace(/\D/g, '');
    };

    // Converter peso para número
    const convertWeight = (weight: string): number => {
      return parseInt(weight.replace(/\D/g, ''), 10) || 0;
    };

    return {
      // Seção 1
      nome_completo: formData.nomeCompleto?.trim() || '',
      data_nascimento: convertDate(formData.dataNascimento),
      genero: formData.genero,
      numero_sus: cleanSUS(formData.numeroSUS || ''),
      estado_nascimento: formData.estadoNascimento?.trim() || '',
      cidade_nascimento: formData.cidadeNascimento?.trim() || '',
      peso_nascer: convertWeight(formData.pesoNascer || '0'),
      semanas_prematuridade: formData.semanasPrematuridade,
      complicacoes_parto: formData.complicacoesParto,
      complicacoes_detalhes: formData.complicacoesDetalhes?.trim() || null,

      // Seção 2
      nome_pai: formData.nomePai?.trim() || null,
      nome_mae: formData.nomeMae?.trim() || null,
      nome_responsavel: formData.nomeResponsavel?.trim() || null,
      parentesco: formData.parentesco,
      outro_parentesco: formData.outroParentesco?.trim() || null,
      data_nascimento_responsavel: convertDate(formData.dataNascimentoResponsavel || ''),
      telefone_contato: formData.telefoneContato?.trim() || '',
      cep: formData.cep?.replace(/\D/g, '') || '',
      rua: formData.rua?.trim() || '',
      numero: formData.numero?.trim() || '',
      bairro: formData.bairro?.trim() || '',
      cidade_endereco: formData.cidadeEndereco?.trim() || '',
      estado_endereco: formData.estadoEndereco?.trim() || '',
      nivel_estudo: formData.nivelEstudo,

      // Seção 3
      gravidez_planejada: formData.gravidezPlanejada,
      acompanhamento_pre_natal: formData.acompanhamentoPreNatal,
      quantidade_consultas: formData.quantidadeConsultas || null,
      problemas_gravidez: formData.problemasGravidez || [],
      outros_problemas_gravidez: formData.outrosProblemasGravidez?.trim() || null,
      tipo_parto: formData.tipoParto,
      ajuda_especial_respiracao: formData.ajudaEspecialRespiracao,
      tipos_ajuda_sala_parto: formData.tiposAjudaSalaParto || [],

      // Seção 4
      idade_traqueostomia: formData.idadeTraqueostomia,
      motivos_traqueostomia: formData.motivosTraqueostomia || [],
      outro_motivo_traqueostomia: formData.outroMotivoTraqueostomia?.trim() || null,
      tipo_traqueostomia: formData.tipoTraqueostomia,
      equipamentos_medicos: formData.equipamentosMedicos || [],
      outros_equipamentos: formData.outrosEquipamentos?.trim() || null,

      // Seção 5
      internacoes_pos_traqueostomia: formData.internacoesPosTraqueostomia,
      acompanhamento_medico: formData.acompanhamentoMedico || [],
      outro_especialista: formData.outroEspecialista?.trim() || null,
      dificuldades_atendimento: formData.dificuldadesAtendimento || [],
      outra_dificuldade: formData.outraDificuldade?.trim() || null,

      // Seção 6
      principal_cuidador: formData.principalCuidador,
      horas_cuidados_diarios: formData.horasCuidadosDiarios,
      treinamento_hospital: formData.treinamentoHospital,

      // Seção 7
      beneficio_financeiro: formData.beneficioFinanceiro,
      qual_beneficio: formData.qualBeneficio?.trim() || null,
      acesso_materiais: formData.acessoMateriais,

      // Seção 8
      observacoes_adicionais: formData.observacoesAdicionais?.trim() || null,
    };
  }

  /**
   * Salva os dados de uma criança no Supabase
   */
  async createChild(formData: any): Promise<{ data: Child | null; error: string | null }> {
    try {
      log('=== INICIANDO CADASTRO DE CRIANÇA ===', { formData });

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Transformar dados do formulário para o formato do banco
      const childData = this.transformFormDataToDatabase(formData);

      log('Dados transformados:', childData);

      // Validações básicas
      if (!childData.nome_completo) {
        throw new Error('Nome completo é obrigatório');
      }

      if (!childData.data_nascimento) {
        throw new Error('Data de nascimento é obrigatória');
      }

      if (!childData.numero_sus || childData.numero_sus.length !== 15) {
        throw new Error('Número do SUS deve ter 15 dígitos');
      }

      // Verificar se já existe uma criança com o mesmo SUS para este usuário
      const { data: existingChild } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)
        .eq('numero_sus', childData.numero_sus)
        .single();

      if (existingChild) {
        throw new Error('Já existe uma criança cadastrada com este número do SUS');
      }

      // Inserir dados no banco (incluindo campos antigos para compatibilidade)
      const { data, error } = await supabase
        .from('children')
        .insert({
          ...childData,
          user_id: user.id,
          // Campos antigos para compatibilidade (opcional)
          name: childData.nome_completo,
          birth_date: childData.data_nascimento,
          observations: childData.observacoes_adicionais,
        })
        .select()
        .single();

      if (error) {
        logError('Erro ao inserir dados:', error);
        throw error;
      }

      log('=== CRIANÇA CADASTRADA COM SUCESSO ===', { id: data.id });

      return { data: data as Child, error: null };

    } catch (error: any) {
      logError('=== ERRO NO CADASTRO DE CRIANÇA ===', error);

      let errorMessage = error.message || 'Erro inesperado ao cadastrar criança';

      // Traduzir erros comuns do Supabase
      if (errorMessage.includes('duplicate key value')) {
        errorMessage = 'Esta criança já foi cadastrada anteriormente';
      } else if (errorMessage.includes('violates check constraint')) {
        errorMessage = 'Dados inválidos fornecidos. Verifique se todos os campos estão preenchidos corretamente';
      } else if (errorMessage.includes('null value in column')) {
        errorMessage = 'Campos obrigatórios não preenchidos';
      }

      return { data: null, error: errorMessage };
    }
  }

  /**
   * Busca todas as crianças cadastradas pelo usuário atual
   */
  async getChildren(): Promise<{ data: Child[] | null; error: string | null }> {
    try {
      log('=== BUSCANDO CRIANÇAS CADASTRADAS ===');

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Erro ao buscar crianças:', error);
        throw error;
      }

      log(`=== ENCONTRADAS ${data?.length || 0} CRIANÇAS ===`);

      return { data: data as Child[], error: null };

    } catch (error: any) {
      logError('=== ERRO AO BUSCAR CRIANÇAS ===', error);
      return { data: null, error: error.message || 'Erro inesperado ao buscar crianças' };
    }
  }

  /**
   * Busca uma criança específica pelo ID
   */
  async getChildById(childId: string): Promise<{ data: Child | null; error: string | null }> {
    try {
      log('=== BUSCANDO CRIANÇA POR ID ===', { childId });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .eq('user_id', user.id) // Garantir que só pode ver suas próprias crianças
        .single();

      if (error) {
        logError('Erro ao buscar criança:', error);
        throw error;
      }

      log('=== CRIANÇA ENCONTRADA ===', { id: data.id });

      return { data: data as Child, error: null };

    } catch (error: any) {
      logError('=== ERRO AO BUSCAR CRIANÇA ===', error);
      return { data: null, error: error.message || 'Criança não encontrada' };
    }
  }

  /**
   * Atualiza os dados de uma criança
   */
  async updateChild(childId: string, formData: any): Promise<{ data: Child | null; error: string | null }> {
    try {
      log('=== ATUALIZANDO DADOS DA CRIANÇA ===', { childId });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Transformar dados do formulário
      const childData = this.transformFormDataToDatabase(formData);

      const { data, error } = await supabase
        .from('children')
        .update({
          ...childData,
          // Campos antigos para compatibilidade (opcional)
          name: childData.nome_completo,
          birth_date: childData.data_nascimento,
          observations: childData.observacoes_adicionais,
        })
        .eq('id', childId)
        .eq('user_id', user.id) // Garantir que só pode atualizar suas próprias crianças
        .select()
        .single();

      if (error) {
        logError('Erro ao atualizar criança:', error);
        throw error;
      }

      log('=== CRIANÇA ATUALIZADA COM SUCESSO ===', { id: data.id });

      return { data: data as Child, error: null };

    } catch (error: any) {
      logError('=== ERRO AO ATUALIZAR CRIANÇA ===', error);
      return { data: null, error: error.message || 'Erro inesperado ao atualizar criança' };
    }
  }

  /**
   * Remove uma criança do cadastro
   */
  async deleteChild(childId: string): Promise<{ error: string | null }> {
    try {
      log('=== REMOVENDO CRIANÇA ===', { childId });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('user_id', user.id); // Garantir que só pode deletar suas próprias crianças

      if (error) {
        logError('Erro ao remover criança:', error);
        throw error;
      }

      log('=== CRIANÇA REMOVIDA COM SUCESSO ===');

      return { error: null };

    } catch (error: any) {
      logError('=== ERRO AO REMOVER CRIANÇA ===', error);
      return { error: error.message || 'Erro inesperado ao remover criança' };
    }
  }
}

export const childrenService = new ChildrenService();