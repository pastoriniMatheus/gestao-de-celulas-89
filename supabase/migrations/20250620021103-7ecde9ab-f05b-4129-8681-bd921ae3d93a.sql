
-- Remover políticas RLS conflitantes e criar políticas simples para permitir acesso
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.cells;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.cities;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.neighborhoods;
DROP POLICY IF EXISTS "Usuários podem visualizar células" ON public.cells;
DROP POLICY IF EXISTS "Usuários podem inserir células" ON public.cells;
DROP POLICY IF EXISTS "Usuários podem atualizar células" ON public.cells;
DROP POLICY IF EXISTS "Usuários podem deletar células" ON public.cells;

-- Criar políticas mais permissivas para permitir acesso mesmo sem autenticação (temporariamente)
CREATE POLICY "Allow read access to cells" ON public.cells
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on cells" ON public.cells
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to contacts" ON public.contacts
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on contacts" ON public.contacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to cities" ON public.cities
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to neighborhoods" ON public.neighborhoods
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to events" ON public.events
  FOR SELECT USING (true);

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on attendances" ON public.attendances
  FOR ALL USING (true) WITH CHECK (true);
