-- Fix public Home/Search content for anonymous visitors.
-- Run this same SQL on the external production database if it is not managed by Lovable.

-- Keep sensitive phone columns private on the base tables for logged-out users.
REVOKE SELECT ON public.banners FROM anon;
REVOKE SELECT ON public.ads FROM anon;

-- Public, safe banner/showcase view. Default view security lets visitors read
-- only the selected columns below without direct access to whatsapp_number.
DROP VIEW IF EXISTS public.banners_public;
CREATE VIEW public.banners_public AS
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

-- Public, safe partner listing view. Do not expose whatsapp_number.
DROP VIEW IF EXISTS public.ads_public;
CREATE VIEW public.ads_public AS
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

-- Footer/city links used by public pages. SECURITY DEFINER avoids public access
-- to garage contact fields while exposing only city/state pairs.
CREATE OR REPLACE FUNCTION public.get_active_cities()
RETURNS TABLE(city text, state text)
LANGUAGE sql
STABLE
SECURITY DEFINER
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