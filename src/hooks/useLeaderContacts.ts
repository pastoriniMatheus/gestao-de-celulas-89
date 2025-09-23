
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  city_id: string | null;
  cell_id: string | null;
  ministry_id: string | null;
  status: string;
  encounter_with_god: boolean;
  baptized: boolean;
  pipeline_stage_id: string | null;
  age: number | null;
  birth_date: string | null;
  attendance_code: string | null;
  referred_by: string | null;
  photo_url: string | null;
  founder: boolean;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  address?: string;
}

export const useLeaderContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      console.log('useLeaderContacts: Buscando contatos do líder...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useLeaderContacts: Erro ao buscar contatos:', error);
        return;
      }

      console.log('useLeaderContacts: Contatos encontrados:', data?.length || 0);
      setContacts(data || []);
    } catch (error) {
      console.error('useLeaderContacts: Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      console.log('useLeaderContacts: Atualizando contato:', id, updates);
      
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useLeaderContacts: Erro ao atualizar contato:', error);
        throw error;
      }

      // Log entry if this is a significant change (like assigning to cell for first time)
      if (updates.cell_id && !contacts.find(c => c.id === id)?.cell_id) {
        try {
          await supabase.from('contact_entries').insert({
            contact_id: id,
            entry_type: 'manual_leader',
            source_info: {
              assigned_to_cell: updates.cell_id,
              created_via: 'leader_assignment',
              action: 'cell_assignment'
            },
            user_agent: navigator.userAgent
          });
        } catch (logError) {
          console.error('Erro ao logar entrada do contato:', logError);
        }
      }

      console.log('useLeaderContacts: Contato atualizado com sucesso:', data);
      
      // Atualizar o estado local
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...data } : contact
      ));

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('useLeaderContacts: Erro ao atualizar contato:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();

    // Real-time updates
    const channel = supabase
      .channel(`leader-contacts-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('useLeaderContacts: Contato alterado:', payload);
          fetchContacts(); // Re-fetch para garantir que apenas contatos permitidos sejam mostrados
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const deleteContact = async (id: string) => {
    try {
      // Get contact info before deleting
      const contact = contacts.find(c => c.id === id);
      if (!contact) {
        throw new Error('Contato não encontrado');
      }

      console.log('useLeaderContacts: Deletando contato:', contact.name);

      // Delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar contato:', error);
        throw error;
      }

      console.log('useLeaderContacts: Contato deletado do banco com sucesso');

      // Log the deletion for reporting
      try {
        await supabase.from('contact_deletions').insert({
          contact_id: id,
          contact_name: contact.name,
          ip_address: null, // Not available in this context
          user_agent: navigator.userAgent
        });
        console.log('useLeaderContacts: Deleção logada com sucesso');
      } catch (logError) {
        console.error('Erro ao logar deleção do contato:', logError);
        // Don't fail the main deletion if logging fails
      }

      // Update local state
      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      console.log('useLeaderContacts: Estado local atualizado');
    } catch (error) {
      console.error('useLeaderContacts: Erro ao deletar contato:', error);
      throw error;
    }
  };

  return {
    contacts,
    loading,
    updateContact,
    deleteContact,
    fetchContacts
  };
};
