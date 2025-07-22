
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MessageHistory {
  id: string;
  message_content: string;
  recipients_count: number;
  sent_at: string;
  template_id?: string;
  status: 'sent' | 'failed' | 'partial';
}

export const useMessageHistory = () => {
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessageHistory = async () => {
    try {
      setLoading(true);
      
      // Buscar histórico agrupado por mensagem
      const { data, error } = await supabase
        .from('sent_messages')
        .select('message_content, template_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Agrupar mensagens por conteúdo e data
      const groupedMessages: { [key: string]: MessageHistory } = {};
      
      (data || []).forEach((msg: any) => {
        const key = `${msg.message_content}-${msg.created_at.split('T')[0]}`;
        
        if (!groupedMessages[key]) {
          groupedMessages[key] = {
            id: key,
            message_content: msg.message_content,
            recipients_count: 0,
            sent_at: msg.created_at,
            template_id: msg.template_id,
            status: 'sent'
          };
        }
        
        groupedMessages[key].recipients_count++;
        
        // Atualizar status baseado nos resultados
        if (msg.status === 'failed') {
          groupedMessages[key].status = groupedMessages[key].status === 'sent' ? 'partial' : 'failed';
        }
      });

      setHistory(Object.values(groupedMessages));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMessageToHistory = async (messageContent: string, contactIds: string[], templateId?: string) => {
    try {
      const messagesToSave = contactIds.map(contactId => ({
        contact_id: contactId,
        message_content: messageContent,
        template_id: templateId || null,
        status: 'sent'
      }));

      const { error } = await supabase
        .from('sent_messages')
        .insert(messagesToSave);

      if (error) throw error;

      // Recarregar histórico
      await fetchMessageHistory();
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
    }
  };

  useEffect(() => {
    fetchMessageHistory();
  }, []);

  return {
    history,
    loading,
    fetchMessageHistory,
    saveMessageToHistory
  };
};
