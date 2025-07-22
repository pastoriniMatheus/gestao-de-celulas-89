
-- Criar tabela de cidades
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de bairros vinculados às cidades
CREATE TABLE public.neighborhoods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, city_id)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cidades - todos podem ver e admins podem gerenciar
CREATE POLICY "Anyone can view cities" ON public.cities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL USING (public.is_admin());

-- Políticas RLS para bairros - todos podem ver e admins podem gerenciar
CREATE POLICY "Anyone can view neighborhoods" ON public.neighborhoods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage neighborhoods" ON public.neighborhoods
  FOR ALL USING (public.is_admin());

-- Inserir cidades de exemplo
INSERT INTO public.cities (name, state) VALUES
  ('São Paulo', 'SP'),
  ('Rio de Janeiro', 'RJ'),
  ('Belo Horizonte', 'MG'),
  ('Salvador', 'BA'),
  ('Brasília', 'DF'),
  ('Fortaleza', 'CE'),
  ('Curitiba', 'PR'),
  ('Recife', 'PE'),
  ('Porto Alegre', 'RS'),
  ('Goiânia', 'GO');

-- Inserir bairros para São Paulo
INSERT INTO public.neighborhoods (name, city_id) VALUES
  ('Centro', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Vila Madalena', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Jardim Europa', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Moema', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Ipiranga', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Liberdade', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Bela Vista', (SELECT id FROM public.cities WHERE name = 'São Paulo')),
  ('Consolação', (SELECT id FROM public.cities WHERE name = 'São Paulo'));

-- Inserir bairros para Rio de Janeiro
INSERT INTO public.neighborhoods (name, city_id) VALUES
  ('Copacabana', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Ipanema', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Botafogo', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Tijuca', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Barra da Tijuca', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Centro', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro')),
  ('Leblon', (SELECT id FROM public.cities WHERE name = 'Rio de Janeiro'));

-- Inserir bairros para Belo Horizonte
INSERT INTO public.neighborhoods (name, city_id) VALUES
  ('Centro', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte')),
  ('Savassi', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte')),
  ('Pampulha', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte')),
  ('Funcionários', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte')),
  ('Santo Antônio', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte')),
  ('Lourdes', (SELECT id FROM public.cities WHERE name = 'Belo Horizonte'));

-- Inserir bairros para outras cidades
INSERT INTO public.neighborhoods (name, city_id) VALUES
  ('Pelourinho', (SELECT id FROM public.cities WHERE name = 'Salvador')),
  ('Barra', (SELECT id FROM public.cities WHERE name = 'Salvador')),
  ('Campo Grande', (SELECT id FROM public.cities WHERE name = 'Salvador')),
  ('Pituba', (SELECT id FROM public.cities WHERE name = 'Salvador')),
  ('Asa Norte', (SELECT id FROM public.cities WHERE name = 'Brasília')),
  ('Asa Sul', (SELECT id FROM public.cities WHERE name = 'Brasília')),
  ('Águas Claras', (SELECT id FROM public.cities WHERE name = 'Brasília')),
  ('Aldeota', (SELECT id FROM public.cities WHERE name = 'Fortaleza')),
  ('Meireles', (SELECT id FROM public.cities WHERE name = 'Fortaleza')),
  ('Centro', (SELECT id FROM public.cities WHERE name = 'Curitiba')),
  ('Batel', (SELECT id FROM public.cities WHERE name = 'Curitiba'));

-- Atualizar tabela de contatos para usar bairros vinculados às cidades
-- Primeiro, vamos adicionar uma coluna city_id na tabela contacts
ALTER TABLE public.contacts ADD COLUMN city_id UUID REFERENCES public.cities(id);

-- Atualizar os contatos existentes para vincular à cidade de São Paulo (exemplo)
UPDATE public.contacts SET city_id = (SELECT id FROM public.cities WHERE name = 'São Paulo' LIMIT 1) WHERE city_id IS NULL;

-- Criar trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON public.neighborhoods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
