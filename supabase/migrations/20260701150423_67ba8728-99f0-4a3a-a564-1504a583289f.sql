
-- ============ 1. ADS ============
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;

CREATE POLICY "Super admin reads ads (with sensitive data)"
  ON public.ads FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP VIEW IF EXISTS public.ads_public;
CREATE VIEW public.ads_public
WITH (security_invoker = true) AS
SELECT
  id, title, category,
  image_url_home, image_url_search,
  click_type, click_target, link,
  is_active, created_at, updated_at
FROM public.ads
WHERE is_active = true;

CREATE POLICY "Public can view active ads (safe cols via view)"
  ON public.ads FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

REVOKE SELECT ON public.ads FROM anon, authenticated;
GRANT SELECT (id, title, category, image_url_home, image_url_search,
              click_type, click_target, link, is_active,
              created_at, updated_at)
  ON public.ads TO anon, authenticated;
GRANT ALL ON public.ads TO service_role;

GRANT SELECT ON public.ads_public TO anon, authenticated;

-- ============ 2. CONSORTIUM_LEADS ============
CREATE POLICY "Only super admin reads consortium_leads"
  ON public.consortium_leads FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Public can insert consortium leads" ON public.consortium_leads;
CREATE POLICY "Public can insert consortium leads"
  ON public.consortium_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND phone IS NOT NULL AND length(trim(phone)) > 0
    AND cpf IS NOT NULL AND length(trim(cpf)) > 0
  );

-- ============ 3. AD_BILLING / AD_BILLING_PAYMENTS ============
CREATE POLICY "Only super admin reads ad_billing"
  ON public.ad_billing FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Only super admin reads ad_billing_payments"
  ON public.ad_billing_payments FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- ============ 4. WHATSAPP_LOGS ============
CREATE POLICY "Block non-admin reads on whatsapp_logs"
  ON public.whatsapp_logs FOR SELECT
  TO anon, authenticated
  USING (is_super_admin());
