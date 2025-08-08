
-- Remover políticas existentes muito permissivas para contatos
DROP POLICY IF EXISTS "Usuários podem visualizar contatos" ON public.contacts;
DROP POLICY IF EXISTS "Usuários podem atualizar contatos" ON public.contacts;
DROP POLICY IF EXISTS "Usuários podem inserir contatos" ON public.contacts;
DROP POLICY IF EXISTS "Usuários podem deletar contatos" ON public.contacts;

-- Manter as políticas de admin existentes e adicionar novas para líderes
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

-- Líderes podem atualizar apenas contatos das suas células
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
