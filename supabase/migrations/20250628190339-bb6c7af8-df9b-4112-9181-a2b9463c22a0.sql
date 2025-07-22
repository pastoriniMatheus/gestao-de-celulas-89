
-- Criar tabela de ministérios
CREATE TABLE public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.contacts(id),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros dos ministérios
CREATE TABLE public.ministry_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(ministry_id, contact_id)
);

-- Adicionar campo ministry_id na tabela contacts
ALTER TABLE public.contacts 
ADD COLUMN ministry_id UUID REFERENCES public.ministries(id);

-- Criar índices para melhor performance
CREATE INDEX idx_ministry_members_ministry_id ON public.ministry_members(ministry_id);
CREATE INDEX idx_ministry_members_contact_id ON public.ministry_members(contact_id);
CREATE INDEX idx_contacts_ministry_id ON public.contacts(ministry_id);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
