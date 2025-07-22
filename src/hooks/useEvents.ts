import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Event {
  id: string;
  name: string;
  date: string;
  keyword: string;
  qr_code: string;
  qr_url: string;
  scan_count: number;
  registration_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Buscando eventos...');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar eventos",
          variant: "destructive"
        });
        return;
      }

      console.log('Eventos encontrados:', data);
      
      // Atualizar URLs dinamicamente com domínio atual
      const updatedData = (data || []).map(event => ({
        ...event,
        qr_url: `${window.location.origin}/form?evento=${event.id}&cod=${event.keyword}`
      }));
      
      setEvents(updatedData);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para incrementar scan count
  const incrementScanCount = async (eventId: string) => {
    try {
      console.log('Incrementando scan count para evento:', eventId);
      
      const { error } = await supabase.rpc('increment_event_scan_count', {
        event_uuid: eventId
      });

      if (error) {
        console.error('Erro ao incrementar scan count:', error);
      } else {
        console.log('Scan count incrementado com sucesso');
        await fetchEvents(); // Recarregar eventos para atualizar contadores
      }
    } catch (error) {
      console.error('Erro ao incrementar scan count:', error);
    }
  };

  // Função para incrementar registration count
  const incrementRegistrationCount = async (eventId: string) => {
    try {
      console.log('Incrementando registration count para evento:', eventId);
      
      const { error } = await supabase.rpc('increment_event_registration', {
        event_uuid: eventId
      });

      if (error) {
        console.error('Erro ao incrementar registration count:', error);
      } else {
        console.log('Registration count incrementado com sucesso');
        await fetchEvents(); // Recarregar eventos para atualizar contadores
      }
    } catch (error) {
      console.error('Erro ao incrementar registration count:', error);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'scan_count' | 'registration_count' | 'qr_code' | 'qr_url'>) => {
    try {
      console.log('Criando evento:', eventData);
      
      // Normalizar keyword
      const normalizedKeyword = eventData.keyword.toLowerCase().trim();
      
      // Verificar se keyword já existe
      const { data: existingEvent } = await supabase
        .from('events')
        .select('keyword')
        .eq('keyword', normalizedKeyword)
        .maybeSingle();

      if (existingEvent) {
        toast({
          title: "Erro",
          description: "Esta palavra-chave já existe. Escolha outra.",
          variant: "destructive"
        });
        throw new Error('Keyword já existe');
      }

      // Gerar URL correta para o formulário
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/form?evento=TEMP_ID&cod=${normalizedKeyword}`;
      
      // Gerar QR code temporário
      const { default: QRCode } = await import('qrcode');
      const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Inserir evento
      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert([{ 
          ...eventData, 
          keyword: normalizedKeyword,
          qr_url: '', // Será atualizado após ter o ID
          qr_code: qrCodeDataUrl,
          scan_count: 0,
          registration_count: 0
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar evento:', insertError);
        toast({
          title: "Erro",
          description: `Erro ao criar evento: ${insertError.message}`,
          variant: "destructive"
        });
        throw insertError;
      }

      // Atualizar URL correta com o ID real
      const finalUrl = `${baseUrl}/form?evento=${newEvent.id}&cod=${normalizedKeyword}`;
      
      // Regenerar QR code com URL correta
      const finalQrCode = await QRCode.toDataURL(finalUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Atualizar evento com dados finais
      const { data: updatedEvent, error: updateError } = await supabase
        .from('events')
        .update({
          qr_url: finalUrl,
          qr_code: finalQrCode
        })
        .eq('id', newEvent.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar evento:', updateError);
        throw updateError;
      }

      console.log('Evento criado com sucesso:', updatedEvent);
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });

      await fetchEvents();
      return updatedEvent;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      // Se estiver atualizando keyword, regenerar QR code com URL correta
      if (updates.keyword) {
        const normalizedKeyword = updates.keyword.toLowerCase().trim();
        
        // Verificar se keyword já existe (exceto no próprio evento)
        const { data: existingEvent } = await supabase
          .from('events')
          .select('id')
          .eq('keyword', normalizedKeyword)
          .neq('id', id)
          .maybeSingle();

        if (existingEvent) {
          toast({
            title: "Erro",
            description: "Esta palavra-chave já existe. Escolha outra.",
            variant: "destructive"
          });
          throw new Error('Keyword já existe');
        }

        const baseUrl = window.location.origin;
        const redirectUrl = `${baseUrl}/form?evento=${id}&cod=${normalizedKeyword}`;
        
        console.log('useEvents: Atualizando QR code para URL correta:', redirectUrl);
        
        const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        updates.keyword = normalizedKeyword;
        updates.qr_url = redirectUrl;
        updates.qr_code = qrCodeDataUrl;
      }

      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!"
      });

      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  };

  const toggleEventStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento ${active ? 'ativado' : 'desativado'} com sucesso!`
      });

      await fetchEvents();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do evento",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!"
      });

      await fetchEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();

    if (channelRef.current) {
      console.log('Removing existing events channel...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    if (!isSubscribedRef.current) {
      const channelName = `events_changes_${Date.now()}_${Math.random()}`;
      console.log('Creating new events channel:', channelName);

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events'
          },
          (payload) => {
            console.log('Evento alterado:', payload);
            fetchEvents();
          }
        );

      channel.subscribe((status) => {
        console.log('Events channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

      channelRef.current = channel;
    }

    return () => {
      console.log('Cleaning up events channel...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, []);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    toggleEventStatus,
    deleteEvent,
    fetchEvents,
    incrementScanCount,
    incrementRegistrationCount
  };
};
