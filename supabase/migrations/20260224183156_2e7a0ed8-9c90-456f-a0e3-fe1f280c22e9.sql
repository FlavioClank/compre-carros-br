CREATE OR REPLACE FUNCTION public.get_active_cities()
RETURNS TABLE(city text, state text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT g.city, g.state
  FROM garages g
  INNER JOIN cars c ON c.garage_id = g.id
  WHERE g.is_active = true
    AND g.city IS NOT NULL
    AND g.state IS NOT NULL
    AND c.status = 'available'
    AND c.garage_is_active = true
  ORDER BY g.city;
$$;