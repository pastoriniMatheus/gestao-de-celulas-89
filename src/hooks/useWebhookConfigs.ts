
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  event_type: 'birthday' | 'new_contact' | 'pipeline_change' | 'custom';
  headers: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWebhookConfigs = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        event_type: item.event_type as 'birthday' | 'new_contact' | 'pipeline_change' | 'custom'
      }));
      
      setWebhooks(transformedData);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addWebhook = async (webhookData: Omit<WebhookConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .insert([webhookData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateWebhook = async (id: string, updates: Partial<WebhookConfig>) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Webhook atualizado com sucesso!"
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
        .from('webhook_configs')
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
    const channelName = `webhook-configs-${Date.now()}`;
    console.log('Creating webhook configs channel:', channelName);

    // Real-time updates
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_configs'
        },
        () => {
          console.log('Webhook configs table changed, refetching...');
          fetchWebhooks();
        }
      )
      .subscribe((status) => {
        console.log('Webhook configs channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up webhook configs channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    webhooks,
    loading,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    refreshWebhooks: fetchWebhooks
  };
};
