
-- Adicionar campos obrigatórios à tabela contacts que estão faltando
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address text;

-- Atualizar o trigger para definir o estágio padrão do pipeline
DROP TRIGGER IF EXISTS set_default_pipeline_stage_trigger ON public.contacts;
CREATE TRIGGER set_default_pipeline_stage_trigger
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION set_default_pipeline_stage();

-- Garantir que a tabela de cidades tenha dados para o formulário
INSERT INTO public.cities (name, state) 
VALUES ('São Paulo', 'SP'), ('Rio de Janeiro', 'RJ'), ('Belo Horizonte', 'MG')
ON CONFLICT DO NOTHING;

-- Garantir que a tabela de bairros tenha dados para o formulário
INSERT INTO public.neighborhoods (name, city_id) 
SELECT 'Centro', c.id FROM public.cities c WHERE c.name = 'São Paulo' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.neighborhoods (name, city_id) 
SELECT 'Zona Sul', c.id FROM public.cities c WHERE c.name = 'Rio de Janeiro' LIMIT 1
ON CONFLICT DO NOTHING;
