
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ContactNote {
  id: string;
  contact_id: string;
  cell_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useContactNotes = (contactId: string, cellId: string) => {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .eq('cell_id', cellId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar anotações:', error);
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_notes')
        .insert([{
          contact_id: contactId,
          cell_id: cellId,
          note: note.trim()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar anotação:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar anotação",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Anotação adicionada com sucesso!"
      });

      await fetchNotes();
    } catch (error) {
      console.error('Erro ao criar anotação:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar anotação",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('contact_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Erro ao deletar anotação:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar anotação",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Anotação deletada com sucesso!"
      });

      await fetchNotes();
    } catch (error) {
      console.error('Erro ao deletar anotação:', error);
    }
  };

  useEffect(() => {
    if (contactId && cellId) {
      fetchNotes();
    }
  }, [contactId, cellId]);

  return {
    notes,
    loading,
    addNote,
    deleteNote,
    refreshNotes: fetchNotes
  };
};
