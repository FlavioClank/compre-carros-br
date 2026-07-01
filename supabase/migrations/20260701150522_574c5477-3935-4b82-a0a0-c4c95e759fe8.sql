
DROP VIEW IF EXISTS public.ads_public;
CREATE VIEW public.ads_public
WITH (security_invoker = true) AS
SELECT
  id, title, category, slug,
  image_url_home, image_url_search,
  click_type, click_target, link,
  whatsapp_number,
  is_active, created_at, updated_at
FROM public.ads
WHERE is_active = true;

GRANT SELECT ON public.ads_public TO anon, authenticated;

-- Garantir que a coluna whatsapp_number também está no GRANT da tabela
-- (para permitir a view enxergar via security_invoker quando o caller é anon)
GRANT SELECT (id, title, category, slug, image_url_home, image_url_search,
              click_type, click_target, link, whatsapp_number, is_active,
              created_at, updated_at)
  ON public.ads TO anon, authenticated;
