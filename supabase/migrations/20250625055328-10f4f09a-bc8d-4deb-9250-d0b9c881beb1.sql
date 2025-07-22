
-- Add photo field to contacts table
ALTER TABLE public.contacts
ADD COLUMN photo_url TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.contacts.photo_url IS 'URL da foto do contato';
