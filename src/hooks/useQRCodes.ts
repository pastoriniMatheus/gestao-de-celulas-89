import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export interface QRCode {
  id: string;
  keyword: string;
  title: string;
  url: string;
  qr_code_data: string;
  scan_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useQRCodes = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      console.log('Buscando QR codes...');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar QR codes:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar QR codes",
          variant: "destructive"
        });
        return;
      }

      console.log('QR codes encontrados:', data);
      
      // Atualizar URLs dinamicamente com domínio atual
      const updatedData = (data || []).map(qr => ({
        ...qr,
        url: `${window.location.origin}/qr/${qr.keyword}`
      }));
      
      setQRCodes(updatedData);
    } catch (error) {
      console.error('Erro crítico ao buscar QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQRCode = async (keyword: string, title: string) => {
    try {
      console.log('Criando QR code:', { keyword, title });
      
      // Normalizar keyword (lowercase e trim)
      const normalizedKeyword = keyword.toLowerCase().trim();
      
      // Verificar se keyword já existe
      const { data: existingQR } = await supabase
        .from('qr_codes')
        .select('keyword')
        .eq('keyword', normalizedKeyword)
        .maybeSingle();

      if (existingQR) {
        toast({
          title: "Erro",
          description: "Esta palavra-chave já existe. Escolha outra.",
          variant: "destructive"
        });
        return null;
      }

      // Gerar URL baseada no domínio atual
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/qr/${normalizedKeyword}`;
      
      console.log('URL do QR code:', redirectUrl);
      
      // Gerar QR code data
      const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('QR code gerado, inserindo no banco...');

      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{
          keyword: normalizedKeyword,
          title: title.trim(),
          url: redirectUrl,
          qr_code_data: qrCodeDataUrl,
          created_by: user?.id,
          scan_count: 0,
          active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar QR code no banco:', error);
        toast({
          title: "Erro",
          description: `Erro ao criar QR code: ${error.message}`,
          variant: "destructive"
        });
        return null;
      }

      console.log('QR code criado com sucesso:', data);
      
      toast({
        title: "Sucesso",
        description: "QR code criado com sucesso!"
      });

      return data;
    } catch (error: any) {
      console.error('Erro crítico ao criar QR code:', error);
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const toggleQRCodeStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `QR code ${active ? 'ativado' : 'desativado'} com sucesso!`
      });

      await fetchQRCodes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do QR code",
        variant: "destructive"
      });
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "QR code deletado com sucesso!"
      });

      await fetchQRCodes();
    } catch (error) {
      console.error('Erro ao deletar QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar QR code",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }
  }, [user]);

  // Configurar atualização em tempo real
  useEffect(() => {
    if (!user) return;

    const channelName = `qr_codes_changes_${Date.now()}`;
    console.log('Creating QR codes channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_codes'
        },
        (payload) => {
          console.log('QR code alterado:', payload);
          fetchQRCodes();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up QR codes channel...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    qrCodes,
    loading,
    createQRCode,
    toggleQRCodeStatus,
    deleteQRCode,
    refreshQRCodes: fetchQRCodes
  };
};
