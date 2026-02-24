CREATE OR REPLACE FUNCTION public.get_garage_ids_by_location(p_city text DEFAULT NULL, p_state text DEFAULT NULL)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT g.id
  FROM garages g
  WHERE g.is_active = true
    AND (p_state IS NULL OR g.state ILIKE p_state)
    AND (p_city IS NULL OR g.city ILIKE '%' || p_city || '%')
$$;