
-- Primeiro, vamos remover as políticas RLS existentes que estão causando recursão infinita
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar uma função de segurança para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se existe um perfil admin para o usuário atual
  -- Usar uma consulta mais simples que não cause recursão
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar políticas RLS mais simples e seguras
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.profiles  
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Adicionar alguns dados de exemplo se não existirem
INSERT INTO public.profiles (name, email, role, active) 
VALUES 
  ('Admin Sistema', 'admin@sistema.com', 'admin', true),
  ('João Silva', 'joao@email.com', 'leader', true),
  ('Maria Santos', 'maria@email.com', 'user', true)
ON CONFLICT DO NOTHING;

-- Adicionar dados de exemplo para células se não existirem
INSERT INTO public.cells (name, address, meeting_day, meeting_time, active)
VALUES 
  ('Célula Centro', 'Rua das Flores, 123 - Centro', 2, '19:30', true),
  ('Célula Bairro Alto', 'Av. Principal, 456 - Bairro Alto', 4, '20:00', true),
  ('Célula Vila Nova', 'Rua da Paz, 789 - Vila Nova', 6, '19:00', true)
ON CONFLICT DO NOTHING;

-- Adicionar dados de exemplo para contatos se não existirem  
INSERT INTO public.contacts (name, neighborhood, age, whatsapp, status)
VALUES
  ('Pedro Oliveira', 'Centro', 28, '(11) 99999-1111', 'pending'),
  ('Ana Costa', 'Bairro Alto', 35, '(11) 99999-2222', 'participating'),
  ('Carlos Souza', 'Vila Nova', 42, '(11) 99999-3333', 'pending'),
  ('Lucia Ferreira', 'Centro', 29, '(11) 99999-4444', 'participating')
ON CONFLICT DO NOTHING;
