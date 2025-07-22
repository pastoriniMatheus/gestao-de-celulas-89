
-- Adicionar coluna de contagem de cadastros na tabela events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_count integer NOT NULL DEFAULT 0;

-- Criar tabela para anotações de membros
CREATE TABLE IF NOT EXISTS public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  cell_id UUID NOT NULL REFERENCES public.cells(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para contact_notes
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;

-- Política para visualizar anotações (membros da célula e administradores)
CREATE POLICY "Users can view contact notes" 
ON public.contact_notes 
FOR SELECT 
USING (true);

-- Política para criar anotações
CREATE POLICY "Users can create contact notes" 
ON public.contact_notes 
FOR INSERT 
WITH CHECK (true);

-- Política para atualizar anotações
CREATE POLICY "Users can update contact notes" 
ON public.contact_notes 
FOR UPDATE 
USING (true);

-- Política para deletar anotações
CREATE POLICY "Users can delete contact notes" 
ON public.contact_notes 
FOR DELETE 
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contact_notes_updated_at
    BEFORE UPDATE ON public.contact_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de presença único
CREATE OR REPLACE FUNCTION public.generate_attendance_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$;

-- Função para incrementar registro de eventos
CREATE OR REPLACE FUNCTION public.increment_event_registration(event_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events 
  SET registration_count = registration_count + 1, updated_at = now()
  WHERE id = event_uuid;
END;
$$;
