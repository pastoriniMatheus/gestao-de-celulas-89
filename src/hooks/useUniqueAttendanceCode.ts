
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUniqueAttendanceCode = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateUniqueAttendanceCode = async (contactName?: string): Promise<string> => {
    setIsGenerating(true);
    
    try {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        let code = '';
        
        if (contactName) {
          // Nova lógica: primeira letra do nome + primeira letra da segunda palavra + 4 dígitos + 1 letra
          const nameParts = contactName.trim().split(' ').filter(part => part.length > 0);
          const firstLetter = nameParts[0]?.charAt(0).toUpperCase() || 'A';
          const secondLetter = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : 'B';
          const fourDigits = Math.floor(1000 + Math.random() * 9000).toString();
          const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
          
          code = firstLetter + secondLetter + fourDigits + randomLetter;
        } else {
          // Fallback para código antigo se não tiver nome
          code = Math.floor(100000 + Math.random() * 900000).toString();
        }
        
        // Verificar se já existe
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('attendance_code', code)
          .maybeSingle();
        
        if (!existingContact) {
          return code;
        }
        
        attempts++;
      }
      
      // Se não conseguiu gerar após várias tentativas, usar timestamp + random
      return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
      
    } catch (error) {
      console.error('Erro ao gerar código único:', error);
      // Fallback para timestamp + random
      return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateUniqueAttendanceCode,
    isGenerating
  };
};
