CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Super admin can manage site settings"
ON public.site_settings FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.site_settings (key, value)
VALUES ('vehicle_whatsapp_enabled', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;