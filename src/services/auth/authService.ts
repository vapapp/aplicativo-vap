import { supabase } from '../supabase/client';
import { User } from '../../types/user.types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  profile: 'mae' | 'pai' | 'cuidador';
  address: {
    cep: string;
    street: string;
    neighborhood: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

const isDev = __DEV__;

const log = (message: string, data?: any) => {
  if (isDev) {
    console.log(message, data ? data : '');
  }
};

const logError = (message: string, error?: any) => {
  if (isDev) {
    console.error(message, error ? error : '');
  }
};

class AuthService {
  async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      return { exists: !!data, error: null };
    } catch (error: any) {
      return { exists: false, error: null };
    }
  }

  async checkPhoneExists(phone: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone)
        .single();

      return { exists: !!data, error: null };
    } catch (error: any) {
      return { exists: false, error: null };
    }
  }

  async signUp(userData: SignUpData) {
    try {
      log('=== VALIDANDO DADOS ===');
      
      // Verificar se email já existe
      const { exists: emailExists } = await this.checkEmailExists(userData.email);
      if (emailExists) {
        return { data: null, error: 'Este e-mail já está cadastrado' };
      }

      // Verificar se telefone já existe
      const { exists: phoneExists } = await this.checkPhoneExists(userData.phone);
      if (phoneExists) {
        return { data: null, error: 'Este telefone já está cadastrado' };
      }

      log('=== INICIANDO CADASTRO ===');
      log('Email:', userData.email);
      
      // 1. Criar usuário na auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        logError('Erro na autenticação:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      log('Usuário criado na auth:', authData.user.id);

      // 2. Aguardar um pouco para a sessão se estabelecer
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Criar usuário na tabela public.users
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          profile: userData.profile,
          cep: userData.address.cep,
          street: userData.address.street,
          neighborhood: userData.address.neighborhood,
          number: userData.address.number,
          complement: userData.address.complement || null,
          city: userData.address.city,
          state: userData.address.state,
          latitude: userData.address.latitude ? parseFloat(userData.address.latitude) : null,
          longitude: userData.address.longitude ? parseFloat(userData.address.longitude) : null,
        })
        .select()
        .single();

      if (insertError) {
        logError('Erro ao inserir na tabela users:', insertError);
        throw insertError;
      }

      log('=== CADASTRO CONCLUÍDO ===');
      return { data: authData, error: null };

    } catch (error: any) {
      logError('=== ERRO NO CADASTRO ===', error);
      
      let errorMessage = error.message || 'Erro desconhecido';
      
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'Este e-mail já está cadastrado';
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (errorMessage.includes('duplicate key value')) {
        errorMessage = 'Este e-mail já está cadastrado';
      } else if (errorMessage.includes('row-level security')) {
        errorMessage = 'Erro de permissão. Tente novamente.';
      }

      return { data: null, error: errorMessage };
    }
  }

  async signIn(credentials: SignInData) {
    try {
      log('=== LOGIN ===');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        logError('Erro no login:', error);
        
        let errorMessage = error.message;
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Confirme seu e-mail antes de fazer login';
        }
        
        return { data: null, error: errorMessage };
      }

      log('=== LOGIN CONCLUÍDO ===');
      return { data, error: null };

    } catch (error: any) {
      logError('=== ERRO NO LOGIN ===', error);
      return { data: null, error: error.message || 'Erro inesperado no login' };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      logError('Erro no logout:', error);
      return { error: error.message };
    }
  }

  async resetPassword(email: string) {
    try {
      log('=== RESET PASSWORD ===');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'vapapp://reset-password',
      });

      if (error) {
        logError('Erro no reset:', error);
        let errorMessage = error.message;
        
        if (errorMessage.includes('User not found')) {
          errorMessage = 'E-mail não encontrado';
        }
        
        throw new Error(errorMessage);
      }

      return { error: null };
    } catch (error: any) {
      logError('Erro no reset password:', error);
      return { error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        logError('Erro ao buscar usuário auth:', error);
        throw error;
      }
      
      if (!user) {
        return { data: null, error: null };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        logError('Erro ao buscar dados do usuário:', userError);
        throw userError;
      }

      return { data: userData as User, error: null };

    } catch (error: any) {
      logError('Erro em getCurrentUser:', error);
      return { data: null, error: error.message };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();