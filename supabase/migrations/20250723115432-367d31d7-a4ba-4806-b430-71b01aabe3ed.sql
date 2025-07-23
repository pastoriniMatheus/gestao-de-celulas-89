
-- Tabela para controlar acesso aos ministérios por usuário
CREATE TABLE IF NOT EXISTS public.user_ministry_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  can_access_ministries BOOLEAN NOT NULL DEFAULT false,
  can_access_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_user_ministry_access_updated_at
  BEFORE UPDATE ON public.user_ministry_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.user_ministry_access ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ver e gerenciar todos os acessos
CREATE POLICY "Admins can manage all ministry access" ON public.user_ministry_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para usuários verem apenas seu próprio acesso
CREATE POLICY "Users can view their own ministry access" ON public.user_ministry_access
  FOR SELECT USING (user_id = auth.uid());
