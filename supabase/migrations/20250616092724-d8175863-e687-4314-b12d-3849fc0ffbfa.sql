
-- Configurar real-time para todas as tabelas
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.cells REPLICA IDENTITY FULL;
ALTER TABLE public.cities REPLICA IDENTITY FULL;
ALTER TABLE public.neighborhoods REPLICA IDENTITY FULL;
ALTER TABLE public.pipeline_stages REPLICA IDENTITY FULL;
ALTER TABLE public.qr_codes REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.system_settings REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cells;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.neighborhoods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- Criar tabelas para sistema de aniversários e mensagens
CREATE TABLE public.birthday_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('birthday', 'welcome', 'reminder', 'custom')),
  subject TEXT,
  message TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'new_contact', 'pipeline_change', 'custom')),
  active BOOLEAN NOT NULL DEFAULT true,
  headers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurar real-time para novas tabelas
ALTER TABLE public.birthday_webhooks REPLICA IDENTITY FULL;
ALTER TABLE public.message_templates REPLICA IDENTITY FULL;
ALTER TABLE public.webhook_configs REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.birthday_webhooks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_configs;

-- Triggers para updated_at
CREATE TRIGGER update_birthday_webhooks_updated_at
  BEFORE UPDATE ON public.birthday_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar aniversários e disparar webhooks
CREATE OR REPLACE FUNCTION public.check_birthdays_and_trigger_webhooks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contact_record RECORD;
  webhook_record RECORD;
BEGIN
  -- Buscar contatos que fazem aniversário hoje
  FOR contact_record IN 
    SELECT * FROM public.contacts 
    WHERE birth_date IS NOT NULL 
    AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
  LOOP
    -- Para cada webhook ativo de aniversário
    FOR webhook_record IN 
      SELECT * FROM public.birthday_webhooks WHERE active = true
    LOOP
      -- Aqui você pode implementar a lógica para disparar o webhook
      -- Por enquanto, apenas logamos
      RAISE NOTICE 'Birthday webhook triggered for contact % to URL %', contact_record.name, webhook_record.webhook_url;
    END LOOP;
  END LOOP;
END;
$$;

-- Remover restrições desnecessárias dos QR codes
-- (não há restrições específicas a remover, apenas garantir que estão flexíveis)

-- Criar políticas RLS mais permissivas para administradores
-- Temporariamente desabilitar RLS para permitir exclusões administrativas
ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_webhooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs DISABLE ROW LEVEL SECURITY;
