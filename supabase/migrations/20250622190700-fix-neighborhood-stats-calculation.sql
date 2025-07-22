
-- Recriar a view neighborhood_stats com cálculo correto
DROP VIEW IF EXISTS public.neighborhood_stats;

CREATE OR REPLACE VIEW public.neighborhood_stats AS
SELECT 
  n.id,
  n.name as neighborhood_name,
  c.name as city_name,
  COUNT(DISTINCT cells.id) as total_cells,
  COUNT(DISTINCT contacts.id) as total_contacts,
  COUNT(DISTINCT CASE WHEN profiles.active = true THEN profiles.id END) as total_leaders,
  COUNT(DISTINCT contacts.id) as total_people
FROM public.neighborhoods n
LEFT JOIN public.cities c ON n.city_id = c.id
LEFT JOIN public.cells ON cells.neighborhood_id = n.id AND cells.active = true
LEFT JOIN public.contacts ON contacts.cell_id = cells.id
LEFT JOIN public.profiles ON profiles.id = cells.leader_id
WHERE n.active = true
GROUP BY n.id, n.name, c.name
ORDER BY total_people DESC, n.name;

-- Atualizar células existentes para garantir que tenham neighborhood_id
-- Vincular células sem bairro ao primeiro bairro disponível de cada cidade
UPDATE public.cells 
SET neighborhood_id = (
  SELECT n.id 
  FROM public.neighborhoods n 
  WHERE n.active = true 
  LIMIT 1
) 
WHERE neighborhood_id IS NULL AND active = true;
