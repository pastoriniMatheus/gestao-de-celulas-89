
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthSession: Inicializando...');
    
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        // Verificar se há tokens de auth na URL (para callback de confirmação)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('access_token')) {
          console.log('Detectado token de acesso na URL, processando...');
          const { data, error } = await supabase.auth.getSession();
          if (data.session && mounted) {
            console.log('Sessão obtida do token da URL:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
            setLoading(false);
            // Limpar a URL após processar o token
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        }

        if (mounted) {
          console.log('Sessão inicial:', initialSession?.user?.email || 'nenhuma');
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }

        // Setup auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;

            console.log('Auth state changed:', event, session?.user?.email);
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('Usuário logado:', session.user.email);
            } else if (event === 'SIGNED_OUT') {
              console.log('Usuário deslogado');
              // Forçar limpeza completa do estado
              setSession(null);
              setUser(null);
            }
          }
        );

        authSubscription = subscription;

      } catch (error) {
        console.error('Erro na inicialização auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        console.log('Limpando subscription de auth...');
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return { user, session, loading };
};
