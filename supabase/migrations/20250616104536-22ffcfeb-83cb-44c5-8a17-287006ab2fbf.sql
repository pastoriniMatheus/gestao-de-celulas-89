
-- Corrigir políticas RLS para cidades e bairros
-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "cities_all_policy" ON public.cities;
DROP POLICY IF EXISTS "neighborhoods_all_policy" ON public.neighborhoods;
DROP POLICY IF EXISTS "system_settings_all_policy" ON public.system_settings;

-- Criar políticas mais permissivas para operações CRUD
CREATE POLICY "cities_full_access" ON public.cities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "neighborhoods_full_access" ON public.neighborhoods
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "system_settings_full_access" ON public.system_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Adicionar política para deletar cidades forçadamente
CREATE POLICY "cities_delete_policy" ON public.cities
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "neighborhoods_delete_policy" ON public.neighborhoods
  FOR DELETE TO authenticated USING (true);

-- Criar tabela para notificações de aniversário
CREATE TABLE IF NOT EXISTS public.birthday_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  notification_date DATE NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Política para notificações
CREATE POLICY "birthday_notifications_full_access" ON public.birthday_notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE public.birthday_notifications ENABLE ROW LEVEL SECURITY;

-- Criar tabela para mensagens enviadas
CREATE TABLE IF NOT EXISTS public.sent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.message_templates(id),
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT NOT NULL DEFAULT 'pending',
  phone_number TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Política para mensagens enviadas
CREATE POLICY "sent_messages_full_access" ON public.sent_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE public.sent_messages ENABLE ROW LEVEL SECURITY;

-- Função para verificar aniversariantes do dia
CREATE OR REPLACE FUNCTION public.get_today_birthdays()
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  birth_date DATE,
  whatsapp TEXT,
  age INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.birth_date,
    c.whatsapp,
    c.age
  FROM public.contacts c
  WHERE c.birth_date IS NOT NULL
    AND EXTRACT(MONTH FROM c.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM c.birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
    AND c.status = 'member';
END;
$$;
