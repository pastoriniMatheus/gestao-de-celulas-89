
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

// Função utilitária para calcular idade corretamente
const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  
  try {
    const birth = new Date(birthDate + 'T00:00:00'); // Adicionar hora para evitar problemas de timezone
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return null;
  }
};

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

      // Recalcular idade para cada contato
      const birthdaysWithCorrectAge = (data || []).map(birthday => ({
        ...birthday,
        age: calculateAge(birthday.birth_date)
      }));

      setTodayBirthdays(birthdaysWithCorrectAge);
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
