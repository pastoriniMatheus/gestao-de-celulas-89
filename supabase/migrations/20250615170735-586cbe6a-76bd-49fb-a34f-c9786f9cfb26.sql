
-- Adicionar coluna neighborhood_id na tabela cells para vincular células aos bairros
ALTER TABLE public.cells ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES public.neighborhoods(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_cells_neighborhood_id ON public.cells(neighborhood_id);

-- Atualizar células existentes para vincular com bairros (exemplo com Centro)
UPDATE public.cells 
SET neighborhood_id = (
  SELECT n.id 
  FROM public.neighborhoods n 
  JOIN public.cities c ON n.city_id = c.id 
  WHERE n.name = 'Centro' 
  LIMIT 1
) 
WHERE neighborhood_id IS NULL;

-- Criar view para estatísticas dos bairros
CREATE OR REPLACE VIEW public.neighborhood_stats AS
SELECT 
  n.id,
  n.name as neighborhood_name,
  c.name as city_name,
  COUNT(DISTINCT cells.id) as total_cells,
  COUNT(DISTINCT contacts.id) as total_contacts,
  COUNT(DISTINCT profiles.id) as total_leaders,
  (COUNT(DISTINCT contacts.id) + COUNT(DISTINCT profiles.id)) as total_people
FROM public.neighborhoods n
LEFT JOIN public.cities c ON n.city_id = c.id
LEFT JOIN public.cells ON cells.neighborhood_id = n.id AND cells.active = true
LEFT JOIN public.contacts ON contacts.cell_id = cells.id
LEFT JOIN public.profiles ON profiles.id = cells.leader_id AND profiles.active = true
WHERE n.active = true
GROUP BY n.id, n.name, c.name
ORDER BY n.name;
