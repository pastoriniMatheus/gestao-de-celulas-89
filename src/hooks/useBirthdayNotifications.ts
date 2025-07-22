
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BirthdayContact {
  contact_id: string;
  contact_name: string;
  birth_date: string;
  whatsapp: string | null;
  age: number | null;
}

export const useBirthdayNotifications = () => {
  const [todayBirthdays, setTodayBirthdays] = useState<BirthdayContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayBirthdays = async () => {
    try {
      const { data, error } = await supabase.rpc('get_today_birthdays');
      
      if (error) {
        console.error('Erro ao buscar aniversariantes:', error);
        return;
      }

      setTodayBirthdays(data || []);
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationSent = async (contactId: string) => {
    try {
      await supabase.from('birthday_notifications').insert({
        contact_id: contactId,
        notification_date: new Date().toISOString().split('T')[0],
        sent: true,
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como enviada:', error);
    }
  };

  useEffect(() => {
    fetchTodayBirthdays();
    
    // Atualizar a cada hora
    const interval = setInterval(fetchTodayBirthdays, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    todayBirthdays,
    loading,
    refreshBirthdays: fetchTodayBirthdays,
    markNotificationSent
  };
};
