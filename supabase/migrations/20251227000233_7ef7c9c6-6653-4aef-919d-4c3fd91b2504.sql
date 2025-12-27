-- Drop and recreate the VIEW with description field
DROP VIEW IF EXISTS public.public_active_cars;

CREATE OR REPLACE VIEW public.public_active_cars AS
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
  c.description,
  c.is_featured,
  c.created_at,
  b.id AS brand_id,
  b.name AS brand_name,
  b.logo_url AS brand_logo_url
FROM public.cars c
INNER JOIN public.garages g ON g.id = c.garage_id
INNER JOIN public.brands b ON b.id = c.brand_id
WHERE c.status = 'available'
  AND g.is_active = true
  AND b.is_active = true;

-- Grant SELECT access to anonymous users (public)
GRANT SELECT ON public.public_active_cars TO anon;
GRANT SELECT ON public.public_active_cars TO authenticated;