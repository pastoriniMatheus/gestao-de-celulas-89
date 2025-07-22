
-- Adicionar campo fundador na tabela contacts
ALTER TABLE public.contacts 
ADD COLUMN founder boolean NOT NULL DEFAULT false;

-- Adicionar campo leader_id para vincular contatos a líderes do sistema
ALTER TABLE public.contacts 
ADD COLUMN leader_id uuid REFERENCES public.profiles(id);
