
-- Restaurar SELECT completo para authenticated em ads e banners.
-- A proteção contra exposição pública continua: anon não tem SELECT direto,
-- e o público lê apenas pela view ads_public / banners (colunas filtradas).
-- RLS já restringe quais linhas cada authenticated enxerga.

-- ADS
REVOKE SELECT ON public.ads FROM anon, authenticated;
GRANT SELECT ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

-- BANNERS
REVOKE SELECT ON public.banners FROM anon, authenticated;
GRANT SELECT ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

-- Garantir que a view pública de ads permanece acessível ao anon
GRANT SELECT ON public.ads_public TO anon, authenticated;
