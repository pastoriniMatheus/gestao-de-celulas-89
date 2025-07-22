
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BirthdayWebhook {
  id: string;
  webhook_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBirthdayWebhooks = () => {
  const [webhooks, setWebhooks] = useState<BirthdayWebhook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('birthday_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar webhooks de aniversário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addWebhook = async (webhook_url: string) => {
    try {
      const { data, error } = await supabase
        .from('birthday_webhooks')
        .insert([{ webhook_url }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook de aniversário adicionado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar webhook de aniversário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('birthday_webhooks')
        .update({ active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Webhook ${active ? 'ativado' : 'desativado'} com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('birthday_webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook deletado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar webhook",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchWebhooks();

    // Criar canal único com nome baseado em timestamp
    const channelName = `birthday-webhooks-${Date.now()}`;
    console.log('Creating birthday webhooks channel:', channelName);

    // Configurar real-time
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'birthday_webhooks'
        },
        () => {
          console.log('Birthday webhooks table changed, refetching...');
          fetchWebhooks();
        }
      )
      .subscribe((status) => {
        console.log('Birthday webhooks channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up birthday webhooks channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    webhooks,
    loading,
    addWebhook,
    toggleWebhook,
    deleteWebhook,
    refreshWebhooks: fetchWebhooks
  };
};
