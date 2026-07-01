
DROP VIEW IF EXISTS public.ads_public;
CREATE VIEW public.ads_public
WITH (security_invoker = false) AS
SELECT
  a.id, a.title, a.category, a.slug,
  a.image_url_home, a.image_url_search,
  a.click_type, a.click_target, a.link,
  a.whatsapp_number,
  a.is_active, a.created_at, a.updated_at,
  b.company_name
FROM public.ads a
LEFT JOIN public.ad_billing b ON b.ad_id = a.id
WHERE a.is_active = true;

GRANT SELECT ON public.ads_public TO anon, authenticated;
