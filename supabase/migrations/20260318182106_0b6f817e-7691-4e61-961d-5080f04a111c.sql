
-- Consortium settings table (singleton)
CREATE TABLE public.consortium_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT false,
  whatsapp_number text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.consortium_settings (is_enabled, whatsapp_number) VALUES (false, '');

-- Enable RLS
ALTER TABLE public.consortium_settings ENABLE ROW LEVEL SECURITY;

-- Only super admin can manage
CREATE POLICY "Super admin full access on consortium_settings"
  ON public.consortium_settings FOR ALL
  TO public
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Public can read (to check if enabled)
CREATE POLICY "Public can view consortium settings"
  ON public.consortium_settings FOR SELECT
  TO public
  USING (true);

-- Consortium leads table
CREATE TYPE public.consortium_lead_status AS ENUM ('novo', 'encaminhado', 'em_negociacao', 'fechado', 'nao_fechou');

CREATE TABLE public.consortium_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date NOT NULL,
  email text NOT NULL,
  cpf text NOT NULL,
  phone text NOT NULL,
  vehicle_info text,
  vehicle_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  status consortium_lead_status NOT NULL DEFAULT 'novo',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consortium_leads ENABLE ROW LEVEL SECURITY;

-- Super admin full access
CREATE POLICY "Super admin full access on consortium_leads"
  ON public.consortium_leads FOR ALL
  TO public
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Public can insert (lead submission)
CREATE POLICY "Public can insert consortium leads"
  ON public.consortium_leads FOR INSERT
  TO public
  WITH CHECK (true);

-- Block anonymous read
CREATE POLICY "Block anonymous read on consortium_leads"
  ON public.consortium_leads FOR SELECT
  TO anon
  USING (false);
