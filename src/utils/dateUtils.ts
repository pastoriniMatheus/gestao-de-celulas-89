
// Função utilitária centralizada para cálculo de idade
export const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  
  try {
    // Criar data local sem problemas de timezone
    const dateParts = birthDate.split('-');
    if (dateParts.length !== 3) return null;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    const birth = new Date(year, month, day);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Ajustar idade se ainda não fez aniversário este ano
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Validar se a idade faz sentido (entre 0 e 150 anos)
    if (age < 0 || age > 150) return null;
    
    return age;
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return null;
  }
};

// Função para formatar data de nascimento
export const formatBirthDate = (birthDate: string | null): string | null => {
  if (!birthDate) return null;
  
  try {
    const dateParts = birthDate.split('-');
    if (dateParts.length !== 3) return null;
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return null;
  }
};

// Função para verificar se é aniversário hoje
export const isBirthdayToday = (birthDate: string | null): boolean => {
  if (!birthDate) return false;
  
  try {
    const dateParts = birthDate.split('-');
    if (dateParts.length !== 3) return false;
    
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    return month === todayMonth && day === todayDay;
  } catch (error) {
    return false;
  }
};
