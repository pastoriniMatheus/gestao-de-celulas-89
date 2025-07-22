
-- Adicionar campo batismo na tabela contacts
ALTER TABLE public.contacts 
ADD COLUMN baptized boolean NOT NULL DEFAULT false;

-- Alterar a constraint de chave estrangeira para permitir CASCADE na deleção
ALTER TABLE public.attendances 
DROP CONSTRAINT IF EXISTS attendances_contact_id_fkey;

ALTER TABLE public.attendances 
ADD CONSTRAINT attendances_contact_id_fkey 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

-- Comentário: Agora quando um contato for deletado, suas presenças também serão removidas automaticamente
