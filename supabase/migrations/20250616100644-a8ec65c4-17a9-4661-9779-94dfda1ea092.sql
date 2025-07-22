
-- Primeiro, vamos verificar quais status existem atualmente na tabela
-- e criar uma constraint que aceite todos os valores existentes mais 'member'

-- Remover a constraint existente
ALTER TABLE public.contacts 
DROP CONSTRAINT IF EXISTS contacts_status_check;

-- Criar constraint mais abrangente incluindo todos os status possíveis
ALTER TABLE public.contacts 
ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('pending', 'assigned', 'active', 'visitor', 'member', 'participating'));

-- Adicionar a coluna birth_date se não existir
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Atualizar a função de trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que o trigger existe na tabela contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
