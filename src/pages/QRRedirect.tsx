
import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const QRRedirect = () => {
  const { keyword } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Capturar todos os parâmetros
        const evento = searchParams.get('evento');
        const cod = searchParams.get('cod');
        
        console.log('QRRedirect: Processando redirecionamento:', { 
          keyword, 
          evento, 
          cod,
          allParams: Object.fromEntries(searchParams.entries()),
          currentOrigin: window.location.origin
        });

        // Se tem evento, verificar se existe e está ativo
        if (evento) {
          console.log('QRRedirect: Verificando evento:', evento);
          
          const { data: eventData, error } = await supabase
            .from('events')
            .select('id, active, keyword')
            .eq('id', evento)
            .single();

          if (error || !eventData) {
            console.log('QRRedirect: Evento não encontrado:', error);
            navigate('/form?error=evento_nao_encontrado', { replace: true });
            return;
          }

          if (!eventData.active) {
            console.log('QRRedirect: Evento inativo');
            navigate('/form?error=evento_inativo', { replace: true });
            return;
          }

          // Registrar o scan do evento
          try {
            const response = await fetch('/api/track-qr-scan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                eventId: evento,
                keyword: cod || eventData.keyword
              }),
            });

            if (!response.ok) {
              console.warn('Erro ao registrar scan do evento:', response.statusText);
            } else {
              console.log('Scan do evento registrado com sucesso');
            }
          } catch (trackError) {
            console.warn('Erro ao chamar função de tracking:', trackError);
          }

          // Evento válido, redirecionar com parâmetros corretos
          const redirectUrl = `/form?evento=${evento}&cod=${cod || keyword || eventData.keyword}`;
          console.log('QRRedirect: Redirecionando para evento válido:', redirectUrl);
          navigate(redirectUrl, { replace: true });
          return;
        }

        // Se não tem evento mas tem keyword, verificar se é um QR code simples
        if (keyword) {
          console.log('QRRedirect: Verificando QR code simples:', keyword);
          
          const { data: qrData, error } = await supabase
            .from('qr_codes')
            .select('id, active, keyword')
            .eq('keyword', keyword)
            .single();

          if (error || !qrData) {
            console.log('QRRedirect: QR code não encontrado:', error);
            navigate('/form?error=codigo_nao_encontrado', { replace: true });
            return;
          }

          if (!qrData.active) {
            console.log('QRRedirect: QR code inativo');
            navigate('/form?error=codigo_inativo', { replace: true });
            return;
          }

          // Registrar o scan do QR code
          try {
            const response = await fetch('/api/track-qr-scan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                keyword: keyword
              }),
            });

            if (!response.ok) {
              console.warn('Erro ao registrar scan do QR code:', response.statusText);
            } else {
              console.log('Scan do QR code registrado com sucesso');
            }
          } catch (trackError) {
            console.warn('Erro ao chamar função de tracking:', trackError);
          }

          // QR code válido
          const redirectUrl = `/form?cod=${keyword}`;
          console.log('QRRedirect: Redirecionando para QR code válido:', redirectUrl);
          navigate(redirectUrl, { replace: true });
          return;
        }

        // Se chegou até aqui, não tem parâmetros válidos
        console.log('QRRedirect: Nenhum parâmetro válido encontrado');
        navigate('/form', { replace: true });
        
      } catch (error) {
        console.error('QRRedirect: Erro inesperado:', error);
        navigate('/form?error=erro_interno', { replace: true });
      }
    };

    handleRedirect();
  }, [keyword, searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Verificando código...</h3>
          <p className="text-sm text-gray-500">Aguarde um momento</p>
        </CardContent>
      </Card>
    </div>
  );
};
