
-- Permitir status adicionais para o campo contacts.status
ALTER TABLE public.contacts
  DROP CONSTRAINT IF EXISTS contacts_status_check;

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_status_check
    CHECK (status IN ('pending', 'assigned', 'active', 'visitor', 'participating'));
