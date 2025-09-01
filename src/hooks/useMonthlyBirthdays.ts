
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateAgeOnBirthday, isBirthdayToday } from '@/utils/dateUtils';

interface MonthlyBirthdayContact {
  id: string;
  name: string;
  birth_date: string;
  whatsapp: string | null;
  age: number | null;
  day: number;
  isBirthdayToday: boolean;
}

export const useMonthlyBirthdays = () => {
  const [monthlyBirthdays, setMonthlyBirthdays] = useState<MonthlyBirthdayContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyBirthdays = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, birth_date, whatsapp')
        .not('birth_date', 'is', null)
        .eq('status', 'member');

      if (error) {
        console.error('Erro ao buscar aniversariantes do mês:', error);
        return;
      }

      // Filtrar por mês e calcular idade corretamente
      const monthBirthdays = data
        ?.filter(contact => {
          const dateParts = contact.birth_date.split('-');
          if (dateParts.length !== 3) return false;
          const birthMonth = parseInt(dateParts[1]);
          return birthMonth === currentMonth;
        })
        .map(contact => {
          const dateParts = contact.birth_date.split('-');
          const day = parseInt(dateParts[2]);
          
          return {
            ...contact,
            age: calculateAgeOnBirthday(contact.birth_date),
            day,
            isBirthdayToday: isBirthdayToday(contact.birth_date)
          };
        })
        .sort((a, b) => a.day - b.day) || [];

      console.log('Aniversariantes do mês com idade no aniversário:', monthBirthdays);
      setMonthlyBirthdays(monthBirthdays);
    } catch (error) {
      console.error('Erro ao buscar aniversariantes do mês:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyBirthdays();
  }, []);

  return {
    monthlyBirthdays,
    loading,
    refreshMonthlyBirthdays: fetchMonthlyBirthdays
  };
};
