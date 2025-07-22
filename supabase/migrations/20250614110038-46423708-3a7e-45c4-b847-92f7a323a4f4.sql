
-- Primeiro, vamos verificar se existem dados na tabela system_settings
SELECT * FROM public.system_settings;

-- Corrigir as políticas RLS para system_settings - permitir acesso para usuários autenticados
DROP POLICY IF EXISTS "system_settings_admin_policy" ON public.system_settings;

-- Criar política mais permissiva para configurações
CREATE POLICY "system_settings_authenticated_policy" ON public.system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Garantir que as configurações padrão existam
INSERT INTO public.system_settings (key, value) VALUES
('church_settings', '{
  "name": "Igreja Batista Central",
  "admin_email": "admin@igrejabatistacentral.com",
  "selected_city": "",
  "webhook_url": "",
  "primary_color": "#3B82F6",
  "secondary_color": "#64748B",
  "logo": "",
  "favicon": ""
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Verificar se as cidades existem, se não, criar algumas
INSERT INTO public.cities (name, state) VALUES
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG')
ON CONFLICT DO NOTHING;

-- Verificar se os bairros existem
DO $$
DECLARE
    sp_city_id UUID;
    rj_city_id UUID;
BEGIN
    -- Obter IDs das cidades
    SELECT id INTO sp_city_id FROM public.cities WHERE name = 'São Paulo' AND state = 'SP';
    SELECT id INTO rj_city_id FROM public.cities WHERE name = 'Rio de Janeiro' AND state = 'RJ';
    
    -- Inserir bairros se as cidades existirem
    IF sp_city_id IS NOT NULL THEN
        INSERT INTO public.neighborhoods (name, city_id, active) VALUES
        ('Centro', sp_city_id, true),
        ('Vila Madalena', sp_city_id, true),
        ('Jardim América', sp_city_id, true)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF rj_city_id IS NOT NULL THEN
        INSERT INTO public.neighborhoods (name, city_id, active) VALUES
        ('Copacabana', rj_city_id, true),
        ('Ipanema', rj_city_id, true),
        ('Leblon', rj_city_id, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
