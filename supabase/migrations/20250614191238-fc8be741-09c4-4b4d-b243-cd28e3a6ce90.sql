
-- Habilitar RLS na tabela attendances
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer usuário autenticado visualize presenças
CREATE POLICY "Usuários podem visualizar presenças" 
  ON public.attendances 
  FOR SELECT 
  USING (true);

-- Política para permitir que qualquer usuário autenticado insira presenças
CREATE POLICY "Usuários podem inserir presenças" 
  ON public.attendances 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que qualquer usuário autenticado atualize presenças
CREATE POLICY "Usuários podem atualizar presenças" 
  ON public.attendances 
  FOR UPDATE 
  USING (true);

-- Política para permitir que qualquer usuário autenticado delete presenças
CREATE POLICY "Usuários podem deletar presenças" 
  ON public.attendances 
  FOR DELETE 
  USING (true);

-- Aplicar políticas similares para a tabela contacts se necessário
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar contatos" 
  ON public.contacts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem inserir contatos" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar contatos" 
  ON public.contacts 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuários podem deletar contatos" 
  ON public.contacts 
  FOR DELETE 
  USING (true);

-- Aplicar políticas para a tabela cells
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar células" 
  ON public.cells 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem inserir células" 
  ON public.cells 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar células" 
  ON public.cells 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuários podem deletar células" 
  ON public.cells 
  FOR DELETE 
  USING (true);
