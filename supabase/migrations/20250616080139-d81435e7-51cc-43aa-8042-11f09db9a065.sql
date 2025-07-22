
-- Adicionar configurações padrão para o sistema se não existirem
INSERT INTO system_settings (key, value) 
VALUES 
  ('site_logo', '{"url": "", "alt": "Logo da Igreja"}'),
  ('form_title', '{"text": "Sistema de Células"}'),
  ('form_description', '{"text": "Preencha seus dados para nos conectarmos com você"}')
ON CONFLICT (key) DO NOTHING;

-- Atualizar URLs dos QR codes existentes para usar domínio dinâmico
-- Primeiro, vamos limpar as URLs antigas que podem estar com domínios fixos
UPDATE qr_codes 
SET url = CONCAT('${window.location.origin}/qr/', keyword)
WHERE url NOT LIKE '%${window.location.origin}%';

UPDATE events 
SET qr_url = CONCAT('${window.location.origin}/form?evento=', id, '&cod=', keyword)
WHERE qr_url NOT LIKE '%${window.location.origin}%';

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_contacts_cell_id ON contacts(cell_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city_id ON neighborhoods(city_id);

-- Função para verificar se uma cidade pode ser deletada
CREATE OR REPLACE FUNCTION can_delete_city(city_uuid uuid)
RETURNS boolean AS $$
DECLARE
    contact_count integer;
    neighborhood_count integer;
BEGIN
    -- Verificar contatos vinculados
    SELECT COUNT(*) INTO contact_count 
    FROM contacts 
    WHERE city_id = city_uuid;
    
    -- Verificar bairros vinculados
    SELECT COUNT(*) INTO neighborhood_count 
    FROM neighborhoods 
    WHERE city_id = city_uuid;
    
    RETURN (contact_count = 0 AND neighborhood_count = 0);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se um bairro pode ser deletado
CREATE OR REPLACE FUNCTION can_delete_neighborhood(neighborhood_name text)
RETURNS boolean AS $$
DECLARE
    contact_count integer;
BEGIN
    -- Verificar contatos vinculados
    SELECT COUNT(*) INTO contact_count 
    FROM contacts 
    WHERE neighborhood = neighborhood_name;
    
    RETURN (contact_count = 0);
END;
$$ LANGUAGE plpgsql;
