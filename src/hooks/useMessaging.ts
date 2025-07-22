
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  status: string;
  encounter_with_god: boolean;
  cell_id: string | null;
  pipeline_stage_id: string | null;
  neighborhood: string;
}

interface Cell {
  id: string;
  name: string;
}

interface PipelineStage {
  id: string;
  name: string;
}

interface MessageFilter {
  encounterWithGod?: boolean;
  cellId?: string;
  pipelineStageId?: string;
  status?: string;
  searchName?: string;
}

export const useMessaging = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsData, cellsData, stagesData] = await Promise.all([
        supabase.from('contacts').select('*').order('name'),
        supabase.from('cells').select('id, name').eq('active', true).order('name'),
        supabase.from('pipeline_stages').select('id, name').eq('active', true).order('position')
      ]);

      if (contactsData.error) throw contactsData.error;
      if (cellsData.error) throw cellsData.error;
      if (stagesData.error) throw stagesData.error;

      setContacts(contactsData.data || []);
      setCells(cellsData.data || []);
      setPipelineStages(stagesData.data || []);
      setFilteredContacts(contactsData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados para mensageria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters: MessageFilter) => {
    let filtered = contacts;

    if (filters.encounterWithGod !== undefined) {
      filtered = filtered.filter(c => c.encounter_with_god === filters.encounterWithGod);
    }

    if (filters.cellId) {
      filtered = filtered.filter(c => c.cell_id === filters.cellId);
    }

    if (filters.pipelineStageId) {
      filtered = filtered.filter(c => c.pipeline_stage_id === filters.pipelineStageId);
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.searchName) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(filters.searchName!.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const sendMessage = async (contactIds: string[], message: string, templateId?: string) => {
    try {
      const contactsToMessage = contacts.filter(c => contactIds.includes(c.id));
      const messagesToSend = contactsToMessage.map(contact => ({
        contact_id: contact.id,
        template_id: templateId || null,
        message_content: message,
        phone_number: contact.whatsapp,
        status: contact.whatsapp ? 'pending' : 'failed'
      }));

      const { error } = await supabase.from('sent_messages').insert(messagesToSend);

      if (error) throw error;

      // Abrir WhatsApp para cada contato com WhatsApp
      const contactsWithWhatsapp = contactsToMessage.filter(c => c.whatsapp);
      
      contactsWithWhatsapp.forEach(contact => {
        const whatsappUrl = `https://wa.me/55${contact.whatsapp!.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      });

      toast({
        title: "Mensagens enviadas",
        description: `${contactsWithWhatsapp.length} mensagens enviadas via WhatsApp`
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    contacts: filteredContacts,
    cells,
    pipelineStages,
    selectedContacts,
    loading,
    setSelectedContacts,
    applyFilters,
    sendMessage,
    refreshData: fetchData
  };
};
