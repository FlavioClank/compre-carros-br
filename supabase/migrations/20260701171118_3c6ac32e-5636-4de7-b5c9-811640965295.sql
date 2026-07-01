
-- Public view for banners (excludes whatsapp_number)
CREATE OR REPLACE VIEW public.banners_public
WITH (security_invoker=on) AS
SELECT id, image_url, image_desktop, image_mobile, position, click_type, click_target, is_active, created_at
FROM public.banners
WHERE is_active = true;

GRANT SELECT ON public.banners_public TO anon, authenticated;

-- ads_public view already exists; ensure anon/authenticated can read it
GRANT SELECT ON public.ads_public TO anon, authenticated;
