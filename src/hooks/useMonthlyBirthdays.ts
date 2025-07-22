
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyBirthdayContact {
  id: string;
  name: string;
  birth_date: string;
  whatsapp: string | null;
  age: number | null;
  day: number;
}

export const useMonthlyBirthdays = () => {
  const [monthlyBirthdays, setMonthlyBirthdays] = useState<MonthlyBirthdayContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyBirthdays = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
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
          const birthDate = new Date(contact.birth_date + 'T00:00:00'); // Adicionar hora para evitar problemas de timezone
          const birthMonth = birthDate.getMonth() + 1;
          return birthMonth === currentMonth;
        })
        .map(contact => {
          const birthDate = new Date(contact.birth_date + 'T00:00:00');
          const day = birthDate.getDate();
          
          // Calcular idade corretamente
          let age = currentYear - birthDate.getFullYear();
          const today = new Date();
          const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
          
          if (today < thisYearBirthday) {
            age--;
          }
          
          return {
            ...contact,
            age,
            day
          };
        })
        .sort((a, b) => a.day - b.day) || [];

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
