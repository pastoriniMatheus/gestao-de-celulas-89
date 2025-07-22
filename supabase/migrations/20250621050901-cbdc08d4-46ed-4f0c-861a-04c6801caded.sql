
-- Create function to increment event scan count
CREATE OR REPLACE FUNCTION public.increment_event_scan_count(event_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.events 
  SET scan_count = scan_count + 1, updated_at = now()
  WHERE id = event_uuid;
END;
$function$
