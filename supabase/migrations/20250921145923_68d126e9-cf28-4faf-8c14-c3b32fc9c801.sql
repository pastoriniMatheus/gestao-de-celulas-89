-- Criar tabela para rastrear quando contatos entram no sistema
CREATE TABLE public.contact_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, -- 'qr_form', 'event_form', 'manual_admin', 'manual_leader'
  created_by UUID REFERENCES public.profiles(user_id),
  source_info JSONB, -- informações adicionais sobre a fonte (evento, QR code, etc)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.contact_entries ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todos os registros
CREATE POLICY "Admins can view all contact entries" 
ON public.contact_entries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Política para inserção de registros
CREATE POLICY "Allow contact entry logging" 
ON public.contact_entries 
FOR INSERT 
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_contact_entries_contact_id ON public.contact_entries(contact_id);
CREATE INDEX idx_contact_entries_entry_type ON public.contact_entries(entry_type);
CREATE INDEX idx_contact_entries_created_at ON public.contact_entries(created_at);
CREATE INDEX idx_contact_entries_created_by ON public.contact_entries(created_by);

-- Função para logar entrada de contato automaticamente
CREATE OR REPLACE FUNCTION public.log_contact_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Log automático quando um contato é criado
  INSERT INTO public.contact_entries (
    contact_id, 
    entry_type, 
    created_by,
    source_info
  ) VALUES (
    NEW.id,
    COALESCE(TG_ARGV[0], 'unknown'),
    auth.uid(),
    COALESCE(TG_ARGV[1]::jsonb, '{}'::jsonb)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para logar automaticamente quando contatos são criados
CREATE TRIGGER log_contact_creation
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_entry('manual_admin');