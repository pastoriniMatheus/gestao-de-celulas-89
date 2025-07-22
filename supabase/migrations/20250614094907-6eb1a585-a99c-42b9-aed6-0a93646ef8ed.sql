
-- Corrigir as políticas RLS problemáticas que causam recursão infinita

-- Primeiro, remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to manage cells" ON public.cells;
DROP POLICY IF EXISTS "Allow authenticated users to manage contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can manage neighborhoods" ON public.neighborhoods;

-- Criar políticas mais simples e seguras sem recursão
CREATE POLICY "Enable read access for all authenticated users on profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users on profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Enable update for own profile" ON public.profiles  
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Políticas para células - acesso total para usuários autenticados
CREATE POLICY "Enable all operations on cells for authenticated users" ON public.cells
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para contatos - acesso total para usuários autenticados  
CREATE POLICY "Enable all operations on contacts for authenticated users" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para eventos - acesso total para usuários autenticados
CREATE POLICY "Enable all operations on events for authenticated users" ON public.events
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para cidades - permitir inserção e visualização para todos autenticados
CREATE POLICY "Enable read access on cities for authenticated users" ON public.cities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert on cities for authenticated users" ON public.cities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update on cities for authenticated users" ON public.cities
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para bairros - permitir inserção e visualização para todos autenticados
CREATE POLICY "Enable read access on neighborhoods for authenticated users" ON public.neighborhoods
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert on neighborhoods for authenticated users" ON public.neighborhoods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update on neighborhoods for authenticated users" ON public.neighborhoods
  FOR UPDATE USING (auth.role() = 'authenticated');
