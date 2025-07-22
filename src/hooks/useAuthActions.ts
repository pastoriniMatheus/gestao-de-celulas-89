
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Erro no signIn:', error);
      return { error: { message: 'Erro inesperado' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              name,
              email,
              role: 'user',
              active: true,
            },
          ]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { error: { message: 'Erro inesperado' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('useAuthActions: Fazendo logout...');
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuthActions: Erro no logout:', error);
      }
      
      // Limpar storage independente do erro
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('useAuthActions: Erro ao limpar storage:', storageError);
      }
      
      return { error };
    } catch (error) {
      console.error('Erro no signOut:', error);
      
      // Mesmo com erro, tentar limpar storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('useAuthActions: Erro ao limpar storage:', storageError);
      }
      
      return { error: { message: 'Erro inesperado' } };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    loading,
  };
};
