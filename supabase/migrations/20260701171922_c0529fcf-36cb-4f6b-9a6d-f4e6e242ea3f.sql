-- Replace public views with security-invoker views and grant only safe columns.
-- This keeps phone/admin fields private while allowing logged-out visitors to read Home/Search content.

DROP VIEW IF EXISTS public.banners_public;
DROP VIEW IF EXISTS public.ads_public;

-- Banners: no public access to whatsapp_number or other admin-only columns.
REVOKE SELECT ON public.banners FROM anon;
GRANT SELECT (id, image_url, image_desktop, image_mobile, position, click_type, click_target, is_active, created_at)
ON public.banners TO anon;
GRANT SELECT (id, image_url, image_desktop, image_mobile, position, click_type, click_target, is_active, created_at)
ON public.banners TO authenticated;

DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners"
ON public.banners
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE VIEW public.banners_public
WITH (security_invoker=on) AS
SELECT
  id,
  image_url,
  image_desktop,
  image_mobile,
  position,
  click_type,
  click_target,
  is_active,
  created_at
FROM public.banners
WHERE is_active = true;

GRANT SELECT ON public.banners_public TO anon, authenticated;

-- Ads/partners: no public access to whatsapp_number or other admin-only columns.
REVOKE SELECT ON public.ads FROM anon;
GRANT SELECT (id, slug, title, category, image_url_home, image_url_search, link, click_type, click_target, is_active, created_at, updated_at)
ON public.ads TO anon;
GRANT SELECT (id, slug, title, category, image_url_home, image_url_search, link, click_type, click_target, is_active, created_at, updated_at)
ON public.ads TO authenticated;

DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads"
ON public.ads
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE VIEW public.ads_public
WITH (security_invoker=on) AS
SELECT
  id,
  slug,
  title,
  category,
  image_url_home,
  image_url_search,
  link,
  click_type,
  click_target,
  is_active,
  created_at,
  updated_at
FROM public.ads
WHERE is_active = true;

GRANT SELECT ON public.ads_public TO anon, authenticated;

-- Public city links use only non-sensitive columns.
GRANT SELECT (id, city, state, is_active) ON public.garages TO anon, authenticated;
GRANT SELECT (garage_id, status, garage_is_active) ON public.cars TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read active garage locations" ON public.garages;
CREATE POLICY "Public can read active garage locations"
ON public.garages
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Public can read available active car location fields" ON public.cars;
CREATE POLICY "Public can read available active car location fields"
ON public.cars
FOR SELECT
TO anon, authenticated
USING (status = 'available' AND garage_is_active = true);

CREATE OR REPLACE FUNCTION public.get_active_cities()
RETURNS TABLE(city text, state text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT g.city, g.state
  FROM public.garages g
  INNER JOIN public.cars c ON c.garage_id = g.id
  WHERE g.is_active = true
    AND g.city IS NOT NULL
    AND g.state IS NOT NULL
    AND c.status = 'available'
    AND c.garage_is_active = true
  ORDER BY g.city;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_cities() TO anon, authenticated;