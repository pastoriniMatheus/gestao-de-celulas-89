
-- Inserir ministérios fixos se não existirem
INSERT INTO public.ministries (name, description, active) 
VALUES 
  ('Ministério Kids', 'Ministério dedicado às crianças', true),
  ('Ministério Jovens', 'Ministério dedicado aos jovens', true)
ON CONFLICT DO NOTHING;

-- Atualizar a estrutura para identificar ministérios fixos
ALTER TABLE public.ministries 
ADD COLUMN IF NOT EXISTS is_system_ministry BOOLEAN DEFAULT false;

-- Marcar os ministérios Kids e Jovens como ministérios do sistema
UPDATE public.ministries 
SET is_system_ministry = true 
WHERE name IN ('Ministério Kids', 'Ministério Jovens');

-- Criar tabela para armazenar professoras por ministério
CREATE TABLE IF NOT EXISTS public.ministry_teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  teacher_type TEXT NOT NULL CHECK (teacher_type IN ('teacher_1', 'teacher_2')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ministry_id, contact_id, teacher_type)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ministry_teachers_ministry_id ON public.ministry_teachers(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_teachers_contact_id ON public.ministry_teachers(contact_id);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_ministry_teachers_updated_at
  BEFORE UPDATE ON public.ministry_teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
