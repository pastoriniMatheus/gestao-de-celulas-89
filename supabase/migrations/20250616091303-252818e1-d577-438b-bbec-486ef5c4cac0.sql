
-- Criar tabela para estágios do pipeline
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  position INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir estágios padrão
INSERT INTO public.pipeline_stages (name, color, position) VALUES
  ('Ganhar', '#10B981', 1),
  ('Consolidar', '#F59E0B', 2),
  ('Discipular', '#8B5CF6', 3),
  ('Enviar', '#EF4444', 4);

-- Adicionar campo pipeline_stage_id na tabela contacts
ALTER TABLE public.contacts ADD COLUMN pipeline_stage_id UUID REFERENCES public.pipeline_stages(id);

-- Atualizar todos os contatos existentes para o primeiro estágio (Ganhar)
UPDATE public.contacts 
SET pipeline_stage_id = (
  SELECT id FROM public.pipeline_stages WHERE position = 1 LIMIT 1
)
WHERE pipeline_stage_id IS NULL;

-- Criar trigger para automaticamente colocar novos contatos no primeiro estágio
CREATE OR REPLACE FUNCTION public.set_default_pipeline_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pipeline_stage_id IS NULL THEN
    NEW.pipeline_stage_id := (
      SELECT id FROM public.pipeline_stages 
      WHERE active = true 
      ORDER BY position ASC 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_default_pipeline_stage_trigger
  BEFORE INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_pipeline_stage();

-- Habilitar RLS na tabela pipeline_stages
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Policy para pipeline_stages (todos podem visualizar, apenas admins podem modificar)
CREATE POLICY "Everyone can view pipeline stages" 
  ON public.pipeline_stages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage pipeline stages" 
  ON public.pipeline_stages 
  FOR ALL 
  USING (true);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
