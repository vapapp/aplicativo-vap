import { supabase } from '../supabase/client';
import { User } from '../../types/user.types';
import Constants from 'expo-constants';

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

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
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

      // Para desenvolvimento com Expo, usar URL do Expo
      const redirectTo = __DEV__
        ? 'exp://192.168.0.4:8081/--/reset-password'
        : 'vapapp://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
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

  async deleteOldAvatar(currentAvatarUrl: string | null) {
    if (!currentAvatarUrl) return;

    try {
      // Extrair o path do avatar atual da URL
      const url = new URL(currentAvatarUrl);
      const pathParts = url.pathname.split('/');
      // Path será algo como: /storage/v1/object/public/user-avatars/avatars/userId/avatar_timestamp.jpg
      const pathIndex = pathParts.indexOf('user-avatars');
      if (pathIndex === -1) return;

      const avatarPath = pathParts.slice(pathIndex + 1).join('/');
      log('=== DELETANDO AVATAR ANTIGO ===', { avatarPath });

      const { error } = await supabase.storage
        .from('user-avatars')
        .remove([avatarPath]);

      if (error) {
        logError('Erro ao deletar avatar antigo:', error);
        // Não interrompe o processo se der erro ao deletar
      } else {
        log('=== AVATAR ANTIGO DELETADO ===', { avatarPath });
      }
    } catch (error: any) {
      logError('Erro ao processar deleção do avatar antigo:', error);
      // Não interrompe o processo
    }
  }

  async uploadAvatar(userId: string, imageUri: string, currentAvatarUrl?: string | null) {
    try {
      log('=== UPLOAD AVATAR ===', { userId, imageUri, currentAvatarUrl });

      // Deletar avatar antigo primeiro (se existir)
      if (currentAvatarUrl) {
        await this.deleteOldAvatar(currentAvatarUrl);
      }

      // Usar nome fixo para o arquivo (sempre substitui o mesmo arquivo)
      const fileName = `avatar.jpg`;
      const filePath = `avatars/${userId}/${fileName}`;

      log('=== PATH DEBUG ===', {
        userId,
        filePath,
        pathParts: filePath.split('/'),
        userIdFromPath: filePath.split('/')[1]
      });

      // Ler o arquivo como ArrayBuffer (compatível com React Native)
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      // Upload para o Supabase Storage (com upsert: true para substituir)
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true, // Substitui se já existir
        });

      if (error) {
        logError('Erro no upload do avatar:', error);
        throw error;
      }

      // Obter URL pública da imagem (com timestamp para evitar cache)
      const { data: publicUrlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Adicionar timestamp para evitar cache do navegador
      const finalUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      log('=== AVATAR UPLOADED ===', { path: data.path, url: finalUrl });
      return { url: finalUrl, error: null };

    } catch (error: any) {
      logError('=== ERRO NO UPLOAD AVATAR ===', error);
      return { url: null, error: error.message || 'Erro no upload da imagem' };
    }
  }

  async updateProfile(profileData: UpdateProfileData) {
    try {
      log('=== UPDATE PROFILE ===', profileData);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      let avatarUrl = null;

      // Upload da imagem se foi fornecida
      log('=== CHECKING AVATAR ===', {
        hasAvatar: !!profileData.avatar,
        avatarValue: profileData.avatar,
        isFileUri: profileData.avatar?.startsWith('file://'),
      });

      if (profileData.avatar && profileData.avatar.startsWith('file://')) {
        // Buscar avatar atual para deletar antes de fazer upload
        const { data: currentUserData } = await supabase
          .from('users')
          .select('avatar')
          .eq('id', user.id)
          .single();

        const currentAvatar = currentUserData?.avatar || null;

        const { url, error: uploadError } = await this.uploadAvatar(
          user.id,
          profileData.avatar,
          currentAvatar
        );

        if (uploadError) {
          throw new Error(`Erro no upload da imagem: ${uploadError}`);
        }

        avatarUrl = url;
      } else if (profileData.avatar) {
        // Se já é uma URL, manter
        avatarUrl = profileData.avatar;
      }

      // Atualizar dados no Supabase Auth se email foi alterado
      if (profileData.email && profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });

        if (emailError) {
          logError('Erro ao atualizar email no auth:', emailError);
          throw emailError;
        }
      }

      // Preparar dados para atualização
      const updateData: any = {
        name: profileData.name,
        phone: profileData.phone,
      };

      // Adicionar avatar se disponível
      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      // Atualizar dados na tabela users
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logError('Erro ao atualizar perfil:', error);
        throw error;
      }

      log('=== PROFILE UPDATED ===', data);
      return { data, error: null };

    } catch (error: any) {
      logError('=== ERRO NO UPDATE PROFILE ===', error);

      let errorMessage = error.message || 'Erro inesperado ao atualizar perfil';

      if (errorMessage.includes('duplicate key value')) {
        errorMessage = 'Este e-mail já está em uso';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'E-mail inválido';
      } else if (errorMessage.includes('Erro no upload da imagem')) {
        errorMessage = error.message;
      }

      return { data: null, error: errorMessage };
    }
  }

  async sendEmailVerification(newEmail: string) {
    try {
      log('=== ENVIANDO VERIFICAÇÃO DE EMAIL ===', { newEmail });

      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .single();

      if (existingUser) {
        const { data: { user } } = await supabase.auth.getUser();

        // Se é outro usuário usando este email
        if (existingUser.id !== user?.id) {
          return { error: 'Este e-mail já está em uso' };
        }
      }

      // Para desenvolvimento com Expo, usar URL do Expo
      const redirectTo = __DEV__
        ? 'exp://192.168.0.4:8081/--/email-updated'
        : 'vapapp://email-updated';

      log('=== REDIRECT URL ===', { redirectTo });

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      }, {
        emailRedirectTo: redirectTo,
      });

      if (error) {
        logError('Erro ao enviar verificação de email:', error);
        let errorMessage = error.message;

        if (errorMessage.includes('same as current')) {
          errorMessage = 'Este e-mail já é o seu e-mail atual';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('already') || errorMessage.includes('registered')) {
          errorMessage = 'Este e-mail já está cadastrado por outro usuário';
        }

        return { error: errorMessage };
      }

      return { error: null };
    } catch (error: any) {
      logError('Erro na verificação de email:', error);
      return { error: error.message || 'Erro ao enviar verificação de email' };
    }
  }

  async sendPhoneVerification(phone: string) {
    try {
      log('=== ENVIANDO VERIFICAÇÃO DE TELEFONE ===', { phone });

      // Verificar se o telefone já está em uso por outro usuário
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        const { data: { user } } = await supabase.auth.getUser();

        // Se é outro usuário usando este telefone
        if (existingUser.id !== user?.id) {
          return { error: 'Este telefone já está em uso' };
        }
      }

      // Simular envio de SMS (em produção, usar Twilio ou similar)
      // Gerar código de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Em desenvolvimento, log do código (em produção, enviar SMS)
      if (__DEV__) {
        console.log(`=== CÓDIGO DE VERIFICAÇÃO PARA ${phone}: ${verificationCode} ===`);
      }

      // Armazenar temporariamente (em produção, usar Redis ou similar)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      return {
        verificationCode: __DEV__ ? verificationCode : null,
        expiresAt,
        error: null
      };

    } catch (error: any) {
      logError('Erro na verificação de telefone:', error);
      return { error: error.message || 'Erro ao enviar código de verificação' };
    }
  }

  async verifyPhoneCode(phone: string, code: string, expectedCode: string) {
    try {
      log('=== VERIFICANDO CÓDIGO DO TELEFONE ===', { phone, code });

      if (code !== expectedCode) {
        return { verified: false, error: 'Código incorreto' };
      }

      return { verified: true, error: null };
    } catch (error: any) {
      logError('Erro na verificação do código:', error);
      return { verified: false, error: 'Erro ao verificar código' };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();