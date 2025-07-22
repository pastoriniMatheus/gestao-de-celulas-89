
-- Corrigir foreign key constraints para permitir deleção em cascata
-- Primeiro, remover as constraints existentes
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_city_id_fkey;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_cell_id_fkey;
ALTER TABLE cells DROP CONSTRAINT IF EXISTS cells_leader_id_fkey;
ALTER TABLE cells DROP CONSTRAINT IF EXISTS cells_neighborhood_id_fkey;
ALTER TABLE neighborhoods DROP CONSTRAINT IF EXISTS neighborhoods_city_id_fkey;

-- Recriar as constraints com comportamento ON DELETE SET NULL para permitir deleção
ALTER TABLE contacts 
ADD CONSTRAINT contacts_city_id_fkey 
FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

ALTER TABLE contacts 
ADD CONSTRAINT contacts_cell_id_fkey 
FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE SET NULL;

ALTER TABLE cells 
ADD CONSTRAINT cells_leader_id_fkey 
FOREIGN KEY (leader_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE cells 
ADD CONSTRAINT cells_neighborhood_id_fkey 
FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL;

ALTER TABLE neighborhoods 
ADD CONSTRAINT neighborhoods_city_id_fkey 
FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;
