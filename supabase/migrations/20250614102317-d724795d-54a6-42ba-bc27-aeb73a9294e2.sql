
-- Remover todas as políticas RLS problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Enable read access for all authenticated users on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON public.profiles;

-- Remover políticas das outras tabelas também
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.cells;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.cities;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.neighborhoods;

-- Criar políticas muito simples sem referências circulares
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para outras tabelas
CREATE POLICY "cells_all_policy" ON public.cells
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "contacts_all_policy" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "events_all_policy" ON public.events
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "cities_all_policy" ON public.cities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "neighborhoods_all_policy" ON public.neighborhoods
  FOR ALL USING (auth.role() = 'authenticated');

-- Garantir que os usuários de teste existam com user_id válido
DO $$
DECLARE
    admin_user_id uuid;
    leader_user_id uuid;
BEGIN
    -- Tentar encontrar usuários existentes no auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@sistema.com' LIMIT 1;
    SELECT id INTO leader_user_id FROM auth.users WHERE email = 'lider@sistema.com' LIMIT 1;
    
    -- Se não encontrar, criar perfis sem user_id (para teste)
    INSERT INTO public.profiles (name, email, role, active, user_id) VALUES
    ('Admin Sistema', 'admin@sistema.com', 'admin', true, admin_user_id),
    ('João Silva - Líder', 'lider@sistema.com', 'leader', true, leader_user_id)
    ON CONFLICT (email) DO UPDATE SET 
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      active = EXCLUDED.active,
      user_id = EXCLUDED.user_id;
END $$;
