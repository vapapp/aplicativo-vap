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

class AuthService {
  async signUp(userData: SignUpData) {
    try {
      // 1. Criar usuário na auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            profile: userData.profile,
          },
        },
      });

      if (authError) throw authError;

      // 2. Atualizar perfil completo se usuário foi criado
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name: userData.name,
            phone: userData.phone,
            profile: userData.profile,
            cep: userData.address.cep,
            street: userData.address.street,
            neighborhood: userData.address.neighborhood,
            number: userData.address.number,
            complement: userData.address.complement,
            city: userData.address.city,
            state: userData.address.state,
            latitude: parseFloat(userData.address.latitude),
            longitude: parseFloat(userData.address.longitude),
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async signIn(credentials: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'vapapp://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return { data: null, error: null };

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      return { data: userData as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Listener para mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();