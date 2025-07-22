
-- Criar tabela de usuários/profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'leader', 'user')) DEFAULT 'user',
  photo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de células
CREATE TABLE public.cells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(id),
  address TEXT NOT NULL,
  meeting_day INTEGER NOT NULL CHECK (meeting_day BETWEEN 0 AND 6), -- 0 = Domingo, 6 = Sábado
  meeting_time TIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contatos
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  age INTEGER,
  whatsapp TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'participating')) DEFAULT 'pending',
  cell_id UUID REFERENCES public.cells(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  keyword TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  qr_code TEXT NOT NULL,
  qr_url TEXT NOT NULL,
  scan_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de presenças
CREATE TABLE public.attendances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cell_id UUID REFERENCES public.cells(id) NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) NOT NULL,
  attendance_date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cell_id, contact_id, attendance_date)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para cells
CREATE POLICY "Everyone can view cells" ON public.cells FOR SELECT USING (true);
CREATE POLICY "Leaders can manage their cells" ON public.cells FOR ALL USING (
  leader_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para contacts
CREATE POLICY "Everyone can view contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Leaders can manage contacts in their cells" ON public.contacts FOR ALL USING (
  cell_id IN (SELECT id FROM public.cells WHERE leader_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para events
CREATE POLICY "Everyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para attendances
CREATE POLICY "Leaders can view attendances of their cells" ON public.attendances FOR SELECT USING (
  cell_id IN (SELECT id FROM public.cells WHERE leader_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Leaders can manage attendances of their cells" ON public.attendances FOR ALL USING (
  cell_id IN (SELECT id FROM public.cells WHERE leader_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Inserir dados de amostra

-- Profiles (usuários)
INSERT INTO public.profiles (id, name, email, role, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Admin Principal', 'admin@igreja.com', 'admin', true),
('550e8400-e29b-41d4-a716-446655440002', 'João Silva', 'joao@igreja.com', 'leader', true),
('550e8400-e29b-41d4-a716-446655440003', 'Maria Santos', 'maria@igreja.com', 'leader', true),
('550e8400-e29b-41d4-a716-446655440004', 'Pedro Lima', 'pedro@igreja.com', 'leader', true);

-- Cells (células)
INSERT INTO public.cells (id, name, leader_id, address, meeting_day, meeting_time, active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Célula Esperança', '550e8400-e29b-41d4-a716-446655440002', 'Rua das Flores, 123 - Centro', 3, '19:30:00', true),
('660e8400-e29b-41d4-a716-446655440002', 'Célula Fé', '550e8400-e29b-41d4-a716-446655440003', 'Av. Principal, 456 - Jardim Europa', 5, '20:00:00', true),
('660e8400-e29b-41d4-a716-446655440003', 'Célula Amor', '550e8400-e29b-41d4-a716-446655440004', 'Rua da Paz, 789 - Vila Nova', 2, '19:00:00', true);

-- Contacts (contatos)
INSERT INTO public.contacts (name, neighborhood, age, whatsapp, status, cell_id) VALUES
('Maria Silva', 'Centro', 34, '(11) 99999-9999', 'participating', '660e8400-e29b-41d4-a716-446655440001'),
('Sofia Oliveira', 'Centro', 26, '(11) 55555-5555', 'participating', '660e8400-e29b-41d4-a716-446655440001'),
('Ana Costa', 'Jardim Europa', 42, '(11) 77777-7777', 'participating', '660e8400-e29b-41d4-a716-446655440002'),
('João Santos', 'Jardim Europa', 28, '(11) 88888-8888', 'pending', null),
('Pedro Lima Jr', 'Vila Nova', 31, '(11) 66666-6666', 'pending', null),
('Carla Souza', 'Centro', 29, '(11) 44444-4444', 'participating', '660e8400-e29b-41d4-a716-446655440003'),
('Roberto Alves', 'Vila Nova', 45, '(11) 33333-3333', 'participating', '660e8400-e29b-41d4-a716-446655440003');

-- Events (eventos)
INSERT INTO public.events (name, keyword, date, qr_code, qr_url, scan_count, active) VALUES
('Encontro de Células', 'encontro-celulas', '2024-06-14', 'QR123456', 'https://paaffmonmovorgyantux.supabase.co/evento/encontro-celulas/qr_123456', 45, true),
('Culto de Jovens', 'culto-jovens', '2024-06-15', 'QR789012', 'https://paaffmonmovorgyantux.supabase.co/evento/culto-jovens/qr_789012', 23, true),
('Retiro Espiritual', 'retiro-espiritual', '2024-06-16', 'QR345678', 'https://paaffmonmovorgyantux.supabase.co/evento/retiro-espiritual/qr_345678', 8, false);

-- Attendances (presenças) - dados de exemplo das últimas semanas
INSERT INTO public.attendances (cell_id, contact_id, attendance_date, present) VALUES
-- Célula Esperança - Quartas-feiras
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.contacts WHERE name = 'Maria Silva'), '2024-06-05', true),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.contacts WHERE name = 'Sofia Oliveira'), '2024-06-05', true),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.contacts WHERE name = 'Maria Silva'), '2024-06-12', true),
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.contacts WHERE name = 'Sofia Oliveira'), '2024-06-12', false),
-- Célula Fé - Sextas-feiras
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.contacts WHERE name = 'Ana Costa'), '2024-06-07', true),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.contacts WHERE name = 'Ana Costa'), '2024-06-14', true),
-- Célula Amor - Terças-feiras
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.contacts WHERE name = 'Carla Souza'), '2024-06-04', true),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.contacts WHERE name = 'Roberto Alves'), '2024-06-04', true),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.contacts WHERE name = 'Carla Souza'), '2024-06-11', false),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.contacts WHERE name = 'Roberto Alves'), '2024-06-11', true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cells_updated_at BEFORE UPDATE ON public.cells FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
