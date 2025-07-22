
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewContact {
  id: string;
  name: string;
  created_at: string;
  whatsapp: string | null;
}

export const useNewContactNotifications = () => {
  const [newContacts, setNewContacts] = useState<NewContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayNewContacts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, created_at, whatsapp')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar novos contatos:', error);
        return;
      }

      setNewContacts(data || []);
    } catch (error) {
      console.error('Erro ao buscar novos contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayNewContacts();
    
    // Escutar mudanças em tempo real para novos contatos
    const channel = supabase
      .channel('new-contacts-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Novo contato detectado:', payload.new);
          const newContact = {
            id: payload.new.id,
            name: payload.new.name,
            created_at: payload.new.created_at,
            whatsapp: payload.new.whatsapp
          };
          
          // Verificar se é de hoje
          const today = new Date().toISOString().split('T')[0];
          const contactDate = new Date(newContact.created_at).toISOString().split('T')[0];
          
          if (contactDate === today) {
            setNewContacts(prev => [newContact, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    newContacts,
    loading,
    refreshNewContacts: fetchTodayNewContacts
  };
};
