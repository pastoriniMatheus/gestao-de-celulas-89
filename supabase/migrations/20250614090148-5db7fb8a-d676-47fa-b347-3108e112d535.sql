
-- Primeiro, remover todas as políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;

-- Criar uma função segura para verificar roles sem recursão
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar políticas simples sem recursão
CREATE POLICY "Allow authenticated users to view profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update profiles" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Habilitar RLS nas outras tabelas se não estiver habilitado
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples para as outras tabelas
CREATE POLICY "Allow authenticated users to view cells" ON public.cells
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage cells" ON public.cells
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage contacts" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view events" ON public.events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage events" ON public.events
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view cities" ON public.cities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view neighborhoods" ON public.neighborhoods
  FOR SELECT USING (auth.role() = 'authenticated');
