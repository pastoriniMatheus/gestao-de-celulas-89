
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro no callback de autenticação:', error);
          toast({
            title: "Erro na confirmação",
            description: "Houve um erro ao confirmar sua conta. Tente fazer login.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (data.session) {
          console.log('Usuário confirmado com sucesso:', data.session.user.email);
          toast({
            title: "Conta confirmada!",
            description: "Sua conta foi confirmada com sucesso. Você já está logado.",
          });
        }

        // Redirecionar sempre para a página principal
        navigate('/');
      } catch (error) {
        console.error('Erro inesperado no callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Confirmando sua conta...</p>
      </div>
    </div>
  );
};
