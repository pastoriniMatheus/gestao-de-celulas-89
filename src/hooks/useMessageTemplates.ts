
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MessageTemplate {
  id: string;
  name: string;
  template_type: 'birthday' | 'welcome' | 'reminder' | 'custom';
  subject?: string;
  message: string;
  variables: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: MessageTemplate[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        template_type: item.template_type as 'birthday' | 'welcome' | 'reminder' | 'custom',
        subject: item.subject || undefined,
        message: item.message,
        variables: Array.isArray(item.variables) 
          ? item.variables.filter(v => typeof v === 'string').map(v => String(v))
          : [],
        active: item.active,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setTemplates(transformedData);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates de mensagem",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template de mensagem criado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar template de mensagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template deletado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar template",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTemplates();

    // Criar canal único com nome baseado em timestamp
    const channelName = `message-templates-${Date.now()}`;
    console.log('Creating message templates channel:', channelName);

    // Real-time updates
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_templates'
        },
        () => {
          console.log('Message templates table changed, refetching...');
          fetchTemplates();
        }
      )
      .subscribe((status) => {
        console.log('Message templates channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up message templates channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates
  };
};
