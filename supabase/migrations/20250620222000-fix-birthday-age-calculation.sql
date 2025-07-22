
CREATE OR REPLACE FUNCTION public.get_today_birthdays()
RETURNS TABLE(contact_id uuid, contact_name text, birth_date date, whatsapp text, age integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.birth_date,
    c.whatsapp,
    CASE 
      WHEN c.birth_date IS NOT NULL THEN 
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.birth_date))::integer
      ELSE 
        NULL
    END as calculated_age
  FROM public.contacts c
  WHERE c.birth_date IS NOT NULL
    AND EXTRACT(MONTH FROM c.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM c.birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
    AND c.status = 'member';
END;
$function$
