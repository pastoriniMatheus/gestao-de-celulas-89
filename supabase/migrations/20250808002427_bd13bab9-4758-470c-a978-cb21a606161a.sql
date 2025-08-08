
-- Remover políticas existentes muito permissivas para contatos
DROP POLICY IF EXISTS "Allow read access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all operations on contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_all_policy" ON public.contacts;

-- Criar políticas mais restritivas para contatos
-- Admins podem ver todos os contatos
CREATE POLICY "Admins can view all contacts" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Líderes podem ver apenas contatos das suas células
CREATE POLICY "Leaders can view their cell contacts" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'leader'
    )
    AND cell_id IN (
      SELECT cells.id FROM public.cells
      JOIN public.profiles ON cells.leader_id = profiles.id
      WHERE profiles.user_id = auth.uid()
    )
  );

-- Políticas para INSERT - Admins e líderes podem inserir contatos
CREATE POLICY "Admins can insert contacts" ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'leader')
    )
  );

-- Políticas para UPDATE - Admins podem atualizar todos, líderes apenas das suas células
CREATE POLICY "Admins can update all contacts" ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Leaders can update their cell contacts" ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'leader'
    )
    AND cell_id IN (
      SELECT cells.id FROM public.cells
      JOIN public.profiles ON cells.leader_id = profiles.id
      WHERE profiles.user_id = auth.uid()
    )
  );

-- Políticas para DELETE - Apenas admins podem deletar
CREATE POLICY "Only admins can delete contacts" ON public.contacts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Ajustar políticas para user_ministry_access para ser mais restritiva
DROP POLICY IF EXISTS "Usuários podem ver seu próprio acesso" ON public.user_ministry_access;
DROP POLICY IF EXISTS "Users can view their own ministry access" ON public.user_ministry_access;

-- Criar política mais específica para user_ministry_access
CREATE POLICY "Users can view their ministry access" ON public.user_ministry_access
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
