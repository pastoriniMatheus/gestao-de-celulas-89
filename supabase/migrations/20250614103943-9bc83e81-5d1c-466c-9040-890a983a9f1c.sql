
-- Limpar dados existentes e recriar estrutura de teste
TRUNCATE public.profiles, public.cells, public.contacts, public.events CASCADE;

-- Inserir perfis de teste (sem user_id para evitar problemas de FK)
INSERT INTO public.profiles (name, email, role, active) VALUES
('Admin Sistema', 'admin@sistema.com', 'admin', true),
('João Silva - Líder', 'joao@lider.com', 'leader', true),
('Maria Santos - Líder', 'maria@lider.com', 'leader', true),
('Pedro Costa - Usuário', 'pedro@usuario.com', 'user', true);

-- Inserir células de teste com líderes
INSERT INTO public.cells (name, address, meeting_day, meeting_time, active, leader_id) VALUES
('Célula Centro', 'Rua das Flores, 123 - Centro, São Paulo - SP', 2, '19:30', true, (SELECT id FROM public.profiles WHERE email = 'joao@lider.com')),
('Célula Vila Madalena', 'Av. Paulista, 456 - Vila Madalena, São Paulo - SP', 4, '20:00', true, (SELECT id FROM public.profiles WHERE email = 'maria@lider.com')),
('Célula Bairro Alto', 'Rua da Paz, 789 - Bairro Alto, Rio de Janeiro - RJ', 6, '19:00', true, (SELECT id FROM public.profiles WHERE email = 'joao@lider.com'));

-- Inserir contatos de teste vinculados às cidades e células
INSERT INTO public.contacts (name, neighborhood, age, whatsapp, status, city_id, cell_id) VALUES
('Pedro Oliveira', 'Centro', 28, '(11) 99999-1111', 'pending', (SELECT id FROM public.cities WHERE name = 'São Paulo'), (SELECT id FROM public.cells WHERE name = 'Célula Centro')),
('Ana Costa', 'Vila Madalena', 35, '(11) 99999-2222', 'participating', (SELECT id FROM public.cities WHERE name = 'São Paulo'), (SELECT id FROM public.cells WHERE name = 'Célula Vila Madalena')),
('Carlos Souza', 'Copacabana', 42, '(21) 99999-3333', 'pending', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro'), (SELECT id FROM public.cells WHERE name = 'Célula Bairro Alto')),
('Lucia Ferreira', 'Centro', 29, '(11) 99999-4444', 'participating', (SELECT id FROM public.cities WHERE name = 'São Paulo'), (SELECT id FROM public.cells WHERE name = 'Célula Centro')),
('Roberto Santos', 'Jardim América', 45, '(11) 99999-5555', 'pending', (SELECT id FROM public.cities WHERE name = 'São Paulo'), NULL),
('Patricia Lima', 'Ipanema', 31, '(21) 99999-6666', 'participating', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro'), NULL);

-- Inserir eventos de teste
INSERT INTO public.events (name, keyword, date, qr_code, qr_url, active, scan_count) VALUES
('Conferência Anual 2024', 'CONF2024', '2024-12-15', 'QR_CONF2024_001', 'https://exemplo.com/conf2024', true, 15),
('Retiro Jovens', 'RETIRO2024', '2024-12-20', 'QR_RETIRO2024_002', 'https://exemplo.com/retiro2024', true, 8),
('Seminário Liderança', 'SEMLID2024', '2025-01-10', 'QR_SEMLID2024_003', 'https://exemplo.com/semlid2024', true, 22);

-- Criar tabela de configurações do sistema para salvar as configurações
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de configurações
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Política para configurações - apenas admins podem acessar
CREATE POLICY "system_settings_admin_policy" ON public.system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir configurações padrão
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
ON CONFLICT (key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_system_settings_updated_at 
BEFORE UPDATE ON public.system_settings 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
