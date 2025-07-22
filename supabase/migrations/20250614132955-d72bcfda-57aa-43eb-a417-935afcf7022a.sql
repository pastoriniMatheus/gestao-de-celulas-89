
-- Remover todas as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Remover funções que podem estar causando problemas
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Criar políticas muito simples sem referências à própria tabela
CREATE POLICY "allow_authenticated_select_profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "allow_authenticated_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_profiles" ON public.profiles
  FOR UPDATE USING (true);

CREATE POLICY "allow_authenticated_delete_profiles" ON public.profiles
  FOR DELETE USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
