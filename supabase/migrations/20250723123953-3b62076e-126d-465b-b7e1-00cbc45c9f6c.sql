
-- Criar tabela para controle de acesso aos ministérios
CREATE TABLE IF NOT EXISTS public.user_ministry_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_access_ministries BOOLEAN NOT NULL DEFAULT false,
  can_access_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_ministry_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seu próprio acesso" ON public.user_ministry_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todos os acessos" ON public.user_ministry_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_user_ministry_access_updated_at
  BEFORE UPDATE ON public.user_ministry_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
