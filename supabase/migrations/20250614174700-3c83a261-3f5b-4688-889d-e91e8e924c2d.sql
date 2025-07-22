
-- Remover TODAS as políticas de TODAS as tabelas para garantir que não há conflitos
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Remove todas as políticas da tabela profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Remove todas as políticas da tabela contacts
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'contacts' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.contacts';
    END LOOP;
    
    -- Remove todas as políticas da tabela cells
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'cells' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.cells';
    END LOOP;
    
    -- Remove todas as políticas da tabela cities
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'cities' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.cities';
    END LOOP;
    
    -- Remove todas as políticas da tabela neighborhoods
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'neighborhoods' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.neighborhoods';
    END LOOP;
    
    -- Remove todas as políticas da tabela qr_codes
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'qr_codes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.qr_codes';
    END LOOP;
    
    -- Remove todas as políticas da tabela events
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.events';
    END LOOP;
    
    -- Remove todas as políticas da tabela qr_scans
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'qr_scans' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.qr_scans';
    END LOOP;
    
    -- Remove todas as políticas da tabela system_settings
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'system_settings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.system_settings';
    END LOOP;
END $$;

-- Agora criar políticas simples para todas as tabelas
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "contacts_all_policy" ON public.contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "cells_all_policy" ON public.cells
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "cities_all_policy" ON public.cities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "neighborhoods_all_policy" ON public.neighborhoods
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "qr_codes_all_policy" ON public.qr_codes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "qr_scans_all_policy" ON public.qr_scans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "events_all_policy" ON public.events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "system_settings_all_policy" ON public.system_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
