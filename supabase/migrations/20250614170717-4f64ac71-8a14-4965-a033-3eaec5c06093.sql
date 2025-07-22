
-- Criar tabela para armazenar dados dos QR codes
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para rastrear cada scan individual
CREATE TABLE public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Políticas para qr_codes
CREATE POLICY "Authenticated users can view qr_codes" ON public.qr_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage qr_codes" ON public.qr_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para qr_scans
CREATE POLICY "Authenticated users can view qr_scans" ON public.qr_scans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert qr_scans" ON public.qr_scans
  FOR INSERT WITH CHECK (true);

-- Função para incrementar contador de scan
CREATE OR REPLACE FUNCTION public.increment_qr_scan_count(qr_id UUID, user_ip INET DEFAULT NULL, user_agent_string TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Incrementar contador na tabela qr_codes
  UPDATE public.qr_codes 
  SET scan_count = scan_count + 1, updated_at = now()
  WHERE id = qr_id;
  
  -- Registrar o scan individual
  INSERT INTO public.qr_scans (qr_code_id, ip_address, user_agent)
  VALUES (qr_id, user_ip, user_agent_string);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
