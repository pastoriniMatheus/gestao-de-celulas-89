
-- Adicionar coluna attendance_code na tabela contacts (código único do membro para confirmação por QR)
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS attendance_code TEXT;

-- Se a tabela cells já gera QR codes pela palavra-chave/id, não precisa criar outro campo.
-- Mas caso prefira armazenar a imagem ou token do QR diretamente:
ALTER TABLE public.cells
ADD COLUMN IF NOT EXISTS qr_code_token TEXT;

-- Opcional: Índice para busca rápida por attendance_code
CREATE INDEX IF NOT EXISTS idx_contacts_attendance_code ON public.contacts(attendance_code);

-- Preencher os attendance_codes existentes (poderá ser feito via job/script depois)
-- Exemplo:
-- UPDATE public.contacts SET attendance_code = encode(gen_random_bytes(4), 'hex') WHERE attendance_code IS NULL;

