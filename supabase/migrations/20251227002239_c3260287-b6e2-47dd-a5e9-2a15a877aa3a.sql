-- Recreate VIEW with explicit SECURITY INVOKER option
DROP VIEW IF EXISTS public.public_active_cars;

CREATE VIEW public.public_active_cars 
WITH (security_invoker = true) AS
SELECT 
  c.id,
  c.code,
  c.model,
  c.year,
  c.version,
  c.mileage,
  c.transmission,
  c.fuel,
  c.color,
  c.price,
  c.photos,
  c.is_featured,
  c.created_at,
  c.description,
  b.id as brand_id,
  b.name as brand_name,
  b.logo_url as brand_logo_url
FROM public.cars c
JOIN public.brands b ON c.brand_id = b.id
JOIN public.garages g ON c.garage_id = g.id
WHERE c.status = 'available'
  AND g.is_active = true
  AND b.is_active = true;

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_active_cars TO anon, authenticated;