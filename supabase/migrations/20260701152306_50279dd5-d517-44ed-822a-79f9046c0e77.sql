
-- ============ 1. ADS: retirar whatsapp_number do acesso público ============
REVOKE SELECT ON public.ads FROM anon, authenticated;
GRANT SELECT (id, title, category, slug, image_url_home, image_url_search,
              click_type, click_target, link, is_active,
              created_at, updated_at)
  ON public.ads TO anon, authenticated;
GRANT ALL ON public.ads TO service_role;

DROP VIEW IF EXISTS public.ads_public;
CREATE VIEW public.ads_public
WITH (security_invoker = true) AS
SELECT id, title, category, slug,
       image_url_home, image_url_search,
       click_type, click_target, link,
       is_active, created_at, updated_at
FROM public.ads
WHERE is_active = true;

GRANT SELECT ON public.ads_public TO anon, authenticated;

-- ============ 2. BANNERS: retirar whatsapp_number do acesso público ============
REVOKE SELECT ON public.banners FROM anon, authenticated;
GRANT SELECT (id, image_url, image_desktop, image_mobile, position,
              click_type, click_target, is_active, created_at)
  ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;

-- ============ 3. CONSORTIUM_LEADS: bloquear INSERT anônimo direto ============
DROP POLICY IF EXISTS "Public can insert consortium leads" ON public.consortium_leads;
REVOKE INSERT ON public.consortium_leads FROM anon, authenticated;
GRANT ALL ON public.consortium_leads TO service_role;

-- ============ 4. Trigger-only SECURITY DEFINER: revogar EXECUTE público ============
DO $$
DECLARE
  fn text;
  trigger_fns text[] := ARRAY[
    'generate_car_code()',
    'generate_car_slug(text, text, text, integer)',
    'set_car_slug()',
    'set_car_garage_is_active()',
    'cars_set_garage_is_active()',
    'garages_sync_cars_garage_is_active()',
    'sync_garage_is_active()',
    'update_updated_at()',
    'normalize_slug(text)'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN OTHERS THEN
      -- função pode não existir; ignorar
      NULL;
    END;
  END LOOP;
END $$;

-- Role-check helpers: usados em policies, precisam apenas de authenticated
-- (nunca chamados como RPC pelo cliente diretamente)
DO $$
DECLARE
  fn text;
  role_fns text[] := ARRAY[
    'has_role(uuid, app_role)',
    'is_super_admin()',
    'is_garage()',
    'get_user_garage_id()'
  ];
BEGIN
  FOREACH fn IN ARRAY role_fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;
