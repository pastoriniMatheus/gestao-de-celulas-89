
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MessageTemplate {
  id: string;
  name: string;
  template_type: 'custom' | 'birthday' | 'welcome' | 'reminder';
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

      if (error) {
        console.error('Erro ao buscar templates:', error);
        return;
      }

      const formattedTemplates: MessageTemplate[] = (data || []).map((template) => ({
        id: template.id,
        name: template.name,
        template_type: template.template_type as 'custom' | 'birthday' | 'welcome' | 'reminder',
        subject: template.subject || undefined,
        message: template.message,
        variables: Array.isArray(template.variables) 
          ? template.variables.filter((v): v is string => typeof v === 'string')
          : [],
        active: template.active,
        created_at: template.created_at,
        updated_at: template.updated_at
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([template])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar template:', error);
        throw error;
      }

      const formattedTemplate: MessageTemplate = {
        id: data.id,
        name: data.name,
        template_type: data.template_type as 'custom' | 'birthday' | 'welcome' | 'reminder',
        subject: data.subject || undefined,
        message: data.message,
        variables: Array.isArray(data.variables) 
          ? data.variables.filter((v): v is string => typeof v === 'string')
          : [],
        active: data.active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTemplates(prev => [formattedTemplate, ...prev]);
      return formattedTemplate;
    } catch (error) {
      console.error('Erro ao adicionar template:', error);
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar template:', error);
        throw error;
      }

      const formattedTemplate: MessageTemplate = {
        id: data.id,
        name: data.name,
        template_type: data.template_type as 'custom' | 'birthday' | 'welcome' | 'reminder',
        subject: data.subject || undefined,
        message: data.message,
        variables: Array.isArray(data.variables) 
          ? data.variables.filter((v): v is string => typeof v === 'string')
          : [],
        active: data.active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTemplates(prev => prev.map(template => 
        template.id === id ? formattedTemplate : template
      ));
      return formattedTemplate;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar template:', error);
        throw error;
      }

      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
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
