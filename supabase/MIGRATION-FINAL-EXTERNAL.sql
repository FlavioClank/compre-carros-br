-- ============================================================
-- SCRIPT DE MIGRAÇÃO COMPLETO E IDEMPOTENTE
-- De: Lovable Cloud (kgtscjvgipowuvuindxt.supabase.co)
-- Para: Seu Supabase Externo
-- ============================================================
-- Este script é idempotente - pode ser executado múltiplas vezes
-- sem causar erros ou duplicação de dados.
-- ============================================================

-- ============================================================
-- PARTE 1: ENUMS (CREATE IF NOT EXISTS via DO block)
-- ============================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'garage');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'car_status') THEN
    CREATE TYPE public.car_status AS ENUM ('available', 'sold');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
    CREATE TYPE public.fuel_type AS ENUM ('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission_type') THEN
    CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'semi_automatic');
  END IF;
END $$;

-- ============================================================
-- PARTE 2: SEQUÊNCIA
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.car_code_seq START WITH 12;

-- Ajustar sequência para o valor atual
SELECT setval('public.car_code_seq', 12, true);

-- ============================================================
-- PARTE 3: TABELAS (CREATE IF NOT EXISTS)
-- ============================================================

-- BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL DEFAULT 'car',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- GARAGES
CREATE TABLE IF NOT EXISTS public.garages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  can_add_vehicles BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CARS
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  code TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  transmission public.transmission_type NOT NULL,
  fuel public.fuel_type NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  status public.car_status NOT NULL DEFAULT 'available',
  sold_at TIMESTAMPTZ,
  sold_reason TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  doors INTEGER DEFAULT 4,
  engine_cc INTEGER,
  condition TEXT DEFAULT 'used',
  category TEXT NOT NULL DEFAULT 'car',
  cooling_type TEXT,
  motorcycle_category TEXT,
  slug TEXT,
  garage_is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ADS
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  click_type TEXT NOT NULL DEFAULT 'link',
  click_target TEXT,
  link TEXT,
  whatsapp_number TEXT,
  image_url_home TEXT,
  image_url_search TEXT,
  slug TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AD_BILLING
CREATE TABLE IF NOT EXISTS public.ad_billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  billing_day INTEGER NOT NULL,
  whatsapp_number TEXT,
  metrics_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AD_BILLING_PAYMENTS
CREATE TABLE IF NOT EXISTS public.ad_billing_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_id UUID NOT NULL,
  reference_month INTEGER NOT NULL,
  reference_year INTEGER NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_desktop TEXT,
  image_mobile TEXT,
  click_type TEXT NOT NULL DEFAULT 'none',
  click_target TEXT,
  whatsapp_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INTERNAL_EXPENSES
CREATE TABLE IF NOT EXISTS public.internal_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'outros',
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SALES_HISTORY
CREATE TABLE IF NOT EXISTS public.sales_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL,
  garage_id UUID NOT NULL,
  car_snapshot JSONB NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_reason TEXT,
  notes TEXT,
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACTION_LOGS
CREATE TABLE IF NOT EXISTS public.action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PARTE 4: FOREIGN KEYS (ADD IF NOT EXISTS)
-- ============================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'garages_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.garages 
    ADD CONSTRAINT garages_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_garage_id_fkey'
  ) THEN
    ALTER TABLE public.cars 
    ADD CONSTRAINT cars_garage_id_fkey 
    FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_brand_id_fkey'
  ) THEN
    ALTER TABLE public.cars 
    ADD CONSTRAINT cars_brand_id_fkey 
    FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE RESTRICT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ad_billing_ad_id_fkey'
  ) THEN
    ALTER TABLE public.ad_billing 
    ADD CONSTRAINT ad_billing_ad_id_fkey 
    FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ad_billing_payments_billing_id_fkey'
  ) THEN
    ALTER TABLE public.ad_billing_payments 
    ADD CONSTRAINT ad_billing_payments_billing_id_fkey 
    FOREIGN KEY (billing_id) REFERENCES public.ad_billing(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_history_car_id_fkey'
  ) THEN
    ALTER TABLE public.sales_history 
    ADD CONSTRAINT sales_history_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE RESTRICT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_history_garage_id_fkey'
  ) THEN
    ALTER TABLE public.sales_history 
    ADD CONSTRAINT sales_history_garage_id_fkey 
    FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- ============================================================
-- PARTE 5: ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_garage_id ON public.cars(garage_id);
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON public.cars(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_slug ON public.cars(slug);
CREATE INDEX IF NOT EXISTS idx_cars_garage_is_active ON public.cars(garage_is_active);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON public.ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_slug ON public.ads(slug);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON public.banners(position);
CREATE INDEX IF NOT EXISTS idx_action_logs_entity_type ON public.action_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_action_logs_entity_id ON public.action_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON public.action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_category ON public.brands(category);

-- ============================================================
-- PARTE 6: FUNÇÕES
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_garage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'garage')
$$;

CREATE OR REPLACE FUNCTION public.get_user_garage_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.garages WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_car_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := 'CC-' || LPAD(nextval('car_code_seq')::TEXT, 6, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := LOWER(COALESCE(input_text, ''));
  normalized := translate(normalized, 'áàâãäåéèêëíìîïóòôõöúùûüñç', 'aaaaaaeeeeiiiiooooouuuunc');
  normalized := regexp_replace(normalized, '[^a-z0-9\s-]', '', 'g');
  normalized := regexp_replace(normalized, '\s+', '-', 'g');
  normalized := regexp_replace(normalized, '-+', '-', 'g');
  normalized := trim(both '-' from normalized);
  RETURN normalized;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_car_slug(p_brand_name TEXT, p_model TEXT, p_version TEXT, p_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
BEGIN
  base_slug := LOWER(
    COALESCE(p_brand_name, '') || ' ' ||
    COALESCE(p_model, '') || ' ' ||
    COALESCE(p_version, '') || ' ' ||
    COALESCE(p_year::TEXT, '')
  );
  base_slug := translate(base_slug, 'áàâãäåéèêëíìîïóòôõöúùûüñç', 'aaaaaaeeeeiiiiooooouuuunc');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  RETURN base_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_car_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand_name TEXT;
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  SELECT name INTO brand_name FROM public.brands WHERE id = NEW.brand_id;
  base_slug := public.generate_car_slug(brand_name, NEW.model, NEW.version, NEW.year);
  final_slug := base_slug;
  IF EXISTS (SELECT 1 FROM public.cars WHERE slug = final_slug AND id != NEW.id) THEN
    final_slug := base_slug || '-' || NEW.code;
  END IF;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_car_garage_is_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT is_active INTO NEW.garage_is_active
  FROM public.garages
  WHERE id = NEW.garage_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_garage_is_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    UPDATE public.cars
    SET garage_is_active = NEW.is_active
    WHERE garage_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- PARTE 7: TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_garages_updated_at ON public.garages;
CREATE TRIGGER update_garages_updated_at
  BEFORE UPDATE ON public.garages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_cars_updated_at ON public.cars;
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_ad_billing_updated_at ON public.ad_billing;
CREATE TRIGGER update_ad_billing_updated_at
  BEFORE UPDATE ON public.ad_billing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_internal_expenses_updated_at ON public.internal_expenses;
CREATE TRIGGER update_internal_expenses_updated_at
  BEFORE UPDATE ON public.internal_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_car_code ON public.cars;
CREATE TRIGGER set_car_code
  BEFORE INSERT ON public.cars
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION public.generate_car_code();

DROP TRIGGER IF EXISTS set_car_slug_trigger ON public.cars;
CREATE TRIGGER set_car_slug_trigger
  BEFORE INSERT OR UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.set_car_slug();

DROP TRIGGER IF EXISTS set_car_garage_is_active_trigger ON public.cars;
CREATE TRIGGER set_car_garage_is_active_trigger
  BEFORE INSERT ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.set_car_garage_is_active();

DROP TRIGGER IF EXISTS sync_garage_is_active_trigger ON public.garages;
CREATE TRIGGER sync_garage_is_active_trigger
  AFTER UPDATE ON public.garages
  FOR EACH ROW EXECUTE FUNCTION public.sync_garage_is_active();

-- ============================================================
-- PARTE 8: RLS (ROW LEVEL SECURITY)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- BRANDS POLICIES
DROP POLICY IF EXISTS "Anyone can view all brands" ON public.brands;
CREATE POLICY "Anyone can view all brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admin can manage brands" ON public.brands;
CREATE POLICY "Super admin can manage brands" ON public.brands FOR ALL USING (is_super_admin());

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
CREATE POLICY "Block anonymous access to profiles" ON public.profiles FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Authenticated users can view own profile only" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile only" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can update own profile only" ON public.profiles;
CREATE POLICY "Authenticated users can update own profile only" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
CREATE POLICY "Super admin full access on profiles" ON public.profiles FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- USER_ROLES POLICIES
DROP POLICY IF EXISTS "Block anonymous access to user_roles" ON public.user_roles;
CREATE POLICY "Block anonymous access to user_roles" ON public.user_roles FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admin can manage roles" ON public.user_roles;
CREATE POLICY "Super admin can manage roles" ON public.user_roles FOR ALL TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "Block non-admin role modifications" ON public.user_roles;
CREATE POLICY "Block non-admin role modifications" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Block non-admin role deletions" ON public.user_roles;
CREATE POLICY "Block non-admin role deletions" ON public.user_roles FOR DELETE TO authenticated USING (is_super_admin());

-- GARAGES POLICIES
DROP POLICY IF EXISTS "Block anonymous access to garages" ON public.garages;
CREATE POLICY "Block anonymous access to garages" ON public.garages FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Garage can only view own data" ON public.garages;
CREATE POLICY "Garage can only view own data" ON public.garages FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Garage can only update own data" ON public.garages;
CREATE POLICY "Garage can only update own data" ON public.garages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin full access on garages" ON public.garages;
CREATE POLICY "Super admin full access on garages" ON public.garages FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- CARS POLICIES
DROP POLICY IF EXISTS "Public (anon) can view available cars" ON public.cars;
CREATE POLICY "Public (anon) can view available cars" ON public.cars FOR SELECT TO anon USING (status = 'available' AND garage_is_active = true);

DROP POLICY IF EXISTS "Public (authenticated non-garage) can view available cars" ON public.cars;
CREATE POLICY "Public (authenticated non-garage) can view available cars" ON public.cars FOR SELECT TO authenticated
  USING (status = 'available' AND garage_is_active = true AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'));

DROP POLICY IF EXISTS "Garage can view own cars" ON public.cars;
CREATE POLICY "Garage can view own cars" ON public.cars FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage') AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()));

DROP POLICY IF EXISTS "Garage can update own cars" ON public.cars;
CREATE POLICY "Garage can update own cars" ON public.cars FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage') AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage') AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()));

DROP POLICY IF EXISTS "Garage can insert own cars with permission" ON public.cars;
CREATE POLICY "Garage can insert own cars with permission" ON public.cars FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage')
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid())
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid() AND g.can_add_vehicles = true)
  );

DROP POLICY IF EXISTS "Super admin full access on cars" ON public.cars;
CREATE POLICY "Super admin full access on cars" ON public.cars FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

-- ADS POLICIES
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads" ON public.ads FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Super admin full access on ads" ON public.ads;
CREATE POLICY "Super admin full access on ads" ON public.ads FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- AD_BILLING POLICIES
DROP POLICY IF EXISTS "Block anonymous access to ad_billing" ON public.ad_billing;
CREATE POLICY "Block anonymous access to ad_billing" ON public.ad_billing FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on ad_billing" ON public.ad_billing;
CREATE POLICY "Super admin full access on ad_billing" ON public.ad_billing FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- AD_BILLING_PAYMENTS POLICIES
DROP POLICY IF EXISTS "Block anonymous access to ad_billing_payments" ON public.ad_billing_payments;
CREATE POLICY "Block anonymous access to ad_billing_payments" ON public.ad_billing_payments FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on ad_billing_payments" ON public.ad_billing_payments;
CREATE POLICY "Super admin full access on ad_billing_payments" ON public.ad_billing_payments FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- BANNERS POLICIES
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Super admin full access on banners" ON public.banners;
CREATE POLICY "Super admin full access on banners" ON public.banners FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- INTERNAL_EXPENSES POLICIES
DROP POLICY IF EXISTS "Block anonymous access to internal_expenses" ON public.internal_expenses;
CREATE POLICY "Block anonymous access to internal_expenses" ON public.internal_expenses FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on internal_expenses" ON public.internal_expenses;
CREATE POLICY "Super admin full access on internal_expenses" ON public.internal_expenses FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- SALES_HISTORY POLICIES
DROP POLICY IF EXISTS "Block public access to sales_history" ON public.sales_history;
CREATE POLICY "Block public access to sales_history" ON public.sales_history FOR SELECT TO anon USING (false);

DROP POLICY IF EXISTS "Garage can view own sales" ON public.sales_history;
CREATE POLICY "Garage can view own sales" ON public.sales_history FOR SELECT TO authenticated USING (garage_id = get_user_garage_id());

DROP POLICY IF EXISTS "Garage can insert own sales" ON public.sales_history;
CREATE POLICY "Garage can insert own sales" ON public.sales_history FOR INSERT TO authenticated WITH CHECK (garage_id = get_user_garage_id());

DROP POLICY IF EXISTS "Garage cannot update sales history" ON public.sales_history;
CREATE POLICY "Garage cannot update sales history" ON public.sales_history FOR UPDATE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "Garage cannot delete sales history" ON public.sales_history;
CREATE POLICY "Garage cannot delete sales history" ON public.sales_history FOR DELETE TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can manage sales history" ON public.sales_history;
CREATE POLICY "Super admin can manage sales history" ON public.sales_history FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ACTION_LOGS POLICIES
DROP POLICY IF EXISTS "Block anonymous access to action_logs" ON public.action_logs;
CREATE POLICY "Block anonymous access to action_logs" ON public.action_logs FOR ALL TO anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin can view all logs" ON public.action_logs;
CREATE POLICY "Super admin can view all logs" ON public.action_logs FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can insert logs" ON public.action_logs;
CREATE POLICY "Super admin can insert logs" ON public.action_logs FOR INSERT TO authenticated WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Block non-admin access to action_logs" ON public.action_logs;
CREATE POLICY "Block non-admin access to action_logs" ON public.action_logs FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ============================================================
-- PARTE 9: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('car-photos', 'car-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('ad-images', 'ad-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public can view car photos" ON storage.objects;
CREATE POLICY "Public can view car photos" ON storage.objects FOR SELECT USING (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Authenticated can upload car photos" ON storage.objects;
CREATE POLICY "Authenticated can upload car photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Authenticated can update car photos" ON storage.objects;
CREATE POLICY "Authenticated can update car photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Super admin can delete car photos" ON storage.objects;
CREATE POLICY "Super admin can delete car photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'car-photos' AND is_super_admin());

DROP POLICY IF EXISTS "Public can view ad images" ON storage.objects;
CREATE POLICY "Public can view ad images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Super admin can manage ad images" ON storage.objects;
CREATE POLICY "Super admin can manage ad images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'ad-images' AND is_super_admin()) WITH CHECK (bucket_id = 'ad-images' AND is_super_admin());

DROP POLICY IF EXISTS "Public can view banners" ON storage.objects;
CREATE POLICY "Public can view banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Super admin can manage banners" ON storage.objects;
CREATE POLICY "Super admin can manage banners" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'banners' AND is_super_admin()) WITH CHECK (bucket_id = 'banners' AND is_super_admin());

-- ============================================================
-- PARTE 10: MIGRAÇÃO DE DADOS (IDEMPOTENTE - UPSERT)
-- ============================================================

-- BRANDS (31 registros)
INSERT INTO public.brands (id, name, logo_url, category, is_active, created_at, updated_at)
VALUES
  ('a823e762-3c68-4f68-b465-6f90f65c4d2a', 'Audi', 'https://www.carlogos.org/car-logos/audi-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('87f24d4f-ca95-4856-ac48-53ea0e3e241e', 'BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('42067307-37bd-47c9-947b-162cf8af2895', 'BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'motorcycle', false, '2025-12-28T06:06:19.728213+00:00', '2025-12-28T06:46:37.918174+00:00'),
  ('b0b96a07-688c-4343-a222-0992d8e07c35', 'Chevrolet', 'https://www.carlogos.org/car-logos/chevrolet-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('63b7038f-14cc-40d9-8ec2-b4c05e33d11a', 'Citroën', 'https://www.carlogos.org/car-logos/citroen-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('78bb179a-5f7f-4508-a663-45e4b40086b2', 'Dafra', '/logos/dafra-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:34.678144+00:00'),
  ('b877b67c-cd3e-4e27-9168-ac6c9993570d', 'Ducati', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:33.41374+00:00'),
  ('19fb93b0-f85b-431f-a72d-81d24503c874', 'Fiat', 'https://www.carlogos.org/car-logos/fiat-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('12c64fa1-ef72-4cbc-a286-3dd148324422', 'Ford', 'https://www.carlogos.org/car-logos/ford-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('96dc9b75-a536-447c-8a6b-703fcb44f899', 'Harley-Davidson', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:24.611618+00:00'),
  ('417babd9-13c8-4160-9d86-ec83b9cdba35', 'Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('ad27e3d9-dc98-43c8-95cb-157b6c43000c', 'Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', 'motorcycle', false, '2025-12-28T06:06:19.728213+00:00', '2025-12-28T06:46:19.149485+00:00'),
  ('ec5ff594-40fe-4386-9abf-07e1390389dd', 'Hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('28435b8e-64e6-4e89-bb1c-1381b4056bf8', 'Jeep', 'https://www.carlogos.org/car-logos/jeep-logo.png', 'car', false, '2025-12-24T04:58:47.396006+00:00', '2025-12-26T18:33:24.78598+00:00'),
  ('633e220d-d340-4007-b024-59d4c76a6f2b', 'Kawasaki', 'https://www.carlogos.org/motorcycle-logos/kawasaki-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:16.740106+00:00'),
  ('7fe6e636-aeef-4ac6-8844-a6af4c38db54', 'Kia', 'https://www.carlogos.org/car-logos/kia-logo.png', 'car', false, '2025-12-24T04:58:47.396006+00:00', '2025-12-27T20:35:01.221227+00:00'),
  ('fbf624b1-34ce-4fc2-85fd-75a5b8f9f570', 'KTM', 'https://www.carlogos.org/motorcycle-logos/ktm-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:13.448806+00:00'),
  ('280289b7-6cff-427c-955b-c9142610913e', 'Land Rover', 'https://www.carlogos.org/car-logos/land-rover-logo.png', 'car', false, '2025-12-24T04:58:47.396006+00:00', '2025-12-26T18:33:28.336412+00:00'),
  ('5eb4f6a2-6c8b-4f87-a827-409550fbb5bc', 'Mercedes-Benz', 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('0516333f-26a0-4049-a66b-11c5627ca9dc', 'Mitsubishi', 'https://www.carlogos.org/car-logos/mitsubishi-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('f954f225-f65d-4070-8efb-742416f6783e', 'Nissan', 'https://www.carlogos.org/car-logos/nissan-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('eef5bb1c-dce8-44d7-876c-0a5a44ebceda', 'Peugeot', 'https://www.carlogos.org/car-logos/peugeot-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('0f398e58-b68d-4f17-b36e-06c2c5f64acd', 'Renault', 'https://www.carlogos.org/car-logos/renault-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('ed4b96cb-b13b-4e94-a85f-ef17d4a66c4b', 'Shineray', '/logos/shineray-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:10.221116+00:00'),
  ('8f0f3bfe-74ef-4c19-91d0-0db9dc3ead62', 'Suzuki', 'https://www.carlogos.org/motorcycle-logos/suzuki-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:07.049653+00:00'),
  ('6fc1415f-39e8-420e-a33f-ae6e6b438f76', 'Toyota', 'https://www.carlogos.org/car-logos/toyota-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('82cc3b07-c9a5-4ab6-9bd6-b5ceb8012d80', 'Triumph', 'https://www.carlogos.org/motorcycle-logos/triumph-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:46:04.121746+00:00'),
  ('4d56000c-6aca-4373-8baa-ebf31724f9e8', 'Volkswagen', 'https://www.carlogos.org/car-logos/volkswagen-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('9e1b9a69-8bed-4ff7-9f2a-afb8c60ae2a4', 'Volvo', 'https://www.carlogos.org/car-logos/volvo-logo.png', 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00'),
  ('d9e5896c-4f6e-4f9a-a11b-1df9ddb4ada7', 'Yamaha', 'https://www.carlogos.org/motorcycle-logos/yamaha-logo.png', 'motorcycle', false, '2025-12-28T05:35:25.405065+00:00', '2025-12-28T06:45:59.878878+00:00'),
  ('b01da0a9-0cd7-4dee-8fa6-d6b5d1a01e6d', 'Outra', NULL, 'car', true, '2025-12-24T04:58:47.396006+00:00', '2025-12-24T04:58:47.396006+00:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- PROFILES (4 registros)
INSERT INTO public.profiles (id, email, name, created_at, updated_at)
VALUES
  ('3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'flaviofernandesv@gmail.com', 'Super Admin', '2025-12-26T18:31:10.077864+00:00', '2025-12-26T18:31:10.077864+00:00'),
  ('c7314718-33e5-41f0-96c6-61d3c3300086', 'primeveiculos@gmail.com', 'Teste', '2025-12-26T18:47:50.946514+00:00', '2025-12-31T22:40:03.925042+00:00'),
  ('aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'elitecar@gmail.com', 'Teste2@gmail.com', '2025-12-26T23:53:59.807046+00:00', '2025-12-31T22:38:03.763384+00:00'),
  ('2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'g12@gmail.com', 'G12 Automóveis', '2025-12-31T23:02:33.91722+00:00', '2025-12-31T23:02:33.91722+00:00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- USER_ROLES (4 registros)
INSERT INTO public.user_roles (id, user_id, role, created_at)
VALUES
  ('03adabd5-5b14-46e0-9683-102e68557722', '3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'super_admin', '2025-12-26T18:31:10.255127+00:00'),
  ('693796c6-7927-4bdb-844f-f2782b744312', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'garage', '2025-12-26T18:47:51.148617+00:00'),
  ('cae90481-008f-4d17-b2d1-bd6c9e6b6c1c', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'garage', '2025-12-26T23:54:00.002599+00:00'),
  ('1951c69b-0d56-4182-9b81-30e1c375923e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'garage', '2025-12-31T23:02:34.090377+00:00')
ON CONFLICT (id) DO NOTHING;

-- GARAGES (3 registros)
INSERT INTO public.garages (id, user_id, name, phone, address, city, state, is_active, can_add_vehicles, created_at, updated_at)
VALUES
  ('f0da0aeb-e1d6-4e9c-a127-7e0457dfb8bc', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'Prime Veiculos', '(65) 99961-4400', 'R. Padre Cassemiro, 376 - Jardim Marajoara', 'Cáceres', 'MT', true, true, '2025-12-26T18:47:51.338504+00:00', '2025-12-31T22:39:17.192724+00:00'),
  ('ac12ed0b-0f6f-411a-bb73-6b5d61708ec8', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'EliteCar', '(65) 99610-0077', 'Av. Getúlio Vargas, 971 - Monte Verde', 'Cáceres', 'MT', true, true, '2025-12-26T23:54:00.194124+00:00', '2025-12-31T21:01:01.046659+00:00'),
  ('84f29ff1-f98c-410a-8fbc-0f93307a8c6e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'G12 Automóveis', '65999999999', 'Rua Padre Cassemiro, 239, Cep 78205365', 'Cáceres', 'MT', true, true, '2025-12-31T23:02:34.294671+00:00', '2026-01-09T19:09:04.354904+00:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  is_active = EXCLUDED.is_active,
  can_add_vehicles = EXCLUDED.can_add_vehicles,
  updated_at = EXCLUDED.updated_at;

-- ADS (12 registros)
-- Nota: Após migrar storage, atualize as URLs com o script de atualização de URLs
INSERT INTO public.ads (id, title, category, click_type, click_target, link, whatsapp_number, image_url_home, image_url_search, slug, is_active, created_at, updated_at)
VALUES
  ('b344d785-cdd3-4b5a-ab9e-e50d5271a45f', 'Negrão Auto Center', 'mecanica', 'whatsapp', NULL, NULL, '65981156716', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767634270025-besyjt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766986557270-hve5p.png', 'negrao-auto-center', true, '2025-12-29T04:50:18.019812+00:00', '2026-01-10T22:34:08.359178+00:00'),
  ('daed7d4b-9fce-4e55-81b2-d6148ce1845f', 'Magrão Matic', 'mecanica', 'whatsapp', NULL, NULL, '65998161550', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767720542329-ecq9z.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767717869675-jn78ua.png', 'magrao-matic', true, '2026-01-05T21:44:06.13176+00:00', '2026-01-10T22:32:51.09058+00:00'),
  ('2cfc16fa-938b-461a-a255-456bf79f5705', 'Armazém Auto Latas', 'mecanica', 'whatsapp', NULL, NULL, '6599067306', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084245677-hn4lug.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084247604-8r7pe.png', 'armazem-auto-latas', true, '2026-01-07T18:39:01.547619+00:00', '2026-01-10T22:51:23.640821+00:00'),
  ('6aa38edc-de3a-4b47-bfa9-e29d17219085', 'Exame Veicular', 'outros', 'whatsapp', NULL, NULL, '65996100077', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813554188-aqyw8.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813555507-44c1ss.png', 'exame-veicular', true, '2026-01-07T19:19:17.041428+00:00', '2026-01-10T22:57:11.505264+00:00'),
  ('8092e9bc-f382-4c67-af0b-c0a97931f5d3', 'Rafa Diesel', 'mecanica', 'whatsapp', NULL, NULL, '556532241630', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084203053-bwzkm.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084204286-x8bt1i.png', 'rafa-diesel', true, '2026-01-07T20:33:08.071285+00:00', '2026-01-10T22:30:07.055233+00:00'),
  ('b20a8f96-25d2-4bcf-a82b-78fe998aafc7', 'Mecânica do Valdir', 'mecanica', 'whatsapp', NULL, NULL, '65998097236', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819840992-07h7k.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819842699-85lgqu.png', 'mecanica-do-valdir', true, '2026-01-07T21:04:03.758054+00:00', '2026-01-10T22:34:53.436242+00:00'),
  ('66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', 'borracharia', 'whatsapp', NULL, NULL, '65999002981', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084164001-ofk02p.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084165564-yw93eg.png', 'borracharia-radial', true, '2026-01-07T21:55:47.095771+00:00', '2026-01-10T22:29:27.681762+00:00'),
  ('793dc469-bfde-40bc-81c9-132269ca46fd', 'Retífica Power', 'mecanica', 'whatsapp', NULL, NULL, '65996137559', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084123349-gmn6pt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084128234-k06jmv.png', 'retifica-power', true, '2026-01-07T22:27:16.45243+00:00', '2026-01-10T22:29:04.663326+00:00'),
  ('98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', 'outros', 'whatsapp', NULL, NULL, '65999888812', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891748469-7qlvo8.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891750176-su5kc.jpg', '8bus', true, '2026-01-08T17:02:32.802778+00:00', '2026-01-10T22:53:10.832455+00:00'),
  ('22a88163-f606-402e-8372-3109fe6fdc3c', 'Via Car', 'mecanica', 'whatsapp', NULL, NULL, '65996210771', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768120905541-i6gsjq.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768120907187-sev9u4.png', 'via-car', true, '2026-01-10T13:41:48.99209+00:00', '2026-01-11T00:35:05.866917+00:00'),
  ('dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', 'borracharia', 'whatsapp', NULL, NULL, '65999891046', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768122951181-0flh1o.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768122952668-d5u2v.png', 'borracharia-bandeirantes', true, '2026-01-10T14:15:53.330116+00:00', '2026-01-11T00:15:54.098979+00:00'),
  ('cf8b22cd-8307-4cdc-be72-3e1944d97fa0', 'Status Tapeçaria', 'outros', 'whatsapp', NULL, NULL, '65999629098', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768135310429-j38d8.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768135312252-e1u7ym.png', 'status-tapecaria', true, '2026-01-10T17:41:53.651152+00:00', '2026-01-10T22:41:03.818017+00:00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  click_type = EXCLUDED.click_type,
  whatsapp_number = EXCLUDED.whatsapp_number,
  image_url_home = EXCLUDED.image_url_home,
  image_url_search = EXCLUDED.image_url_search,
  slug = EXCLUDED.slug,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- AD_BILLING (4 registros)
INSERT INTO public.ad_billing (id, ad_id, company_name, monthly_fee, billing_day, whatsapp_number, metrics_reset_at, created_at, updated_at)
VALUES
  ('ed430e1d-7c36-4c70-a634-69fc99f03408', '98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', 250, 25, '6599999999999', '2026-01-25T04:45:25.870579+00:00', '2026-01-25T04:45:06.707+00:00', '2026-01-25T04:45:25.870579+00:00'),
  ('ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', '66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', 250, 5, '65999002981', '2026-01-11T00:15:38.412+00:00', '2026-02-05T03:00:00+00:00', '2026-01-11T00:15:39.140511+00:00'),
  ('8d859dd2-a551-48df-b3b7-b9743c2da986', 'dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', 250, 5, '65999891046', '2026-01-11T00:16:31.888+00:00', '2026-02-05T03:00:00+00:00', '2026-01-11T00:16:32.609036+00:00'),
  ('53722f04-eaff-470a-904c-1e162f34b1d3', '793dc469-bfde-40bc-81c9-132269ca46fd', 'Retifica Power', 250, 5, '65996137559', '2026-01-11T00:17:09.454+00:00', '2026-02-05T03:00:00+00:00', '2026-01-11T00:17:10.177817+00:00')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  monthly_fee = EXCLUDED.monthly_fee,
  billing_day = EXCLUDED.billing_day,
  whatsapp_number = EXCLUDED.whatsapp_number,
  metrics_reset_at = EXCLUDED.metrics_reset_at,
  updated_at = EXCLUDED.updated_at;

-- AD_BILLING_PAYMENTS (7 registros)
INSERT INTO public.ad_billing_payments (id, billing_id, reference_month, reference_year, paid_at, notes, created_at)
VALUES
  ('34496937-ba4b-4359-ae4d-fafee79a1f5d', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 2, 2026, '2026-02-05T03:00:00+00:00', NULL, '2026-01-11T00:15:34.650684+00:00'),
  ('e349e999-dac1-42e1-86ba-ffd9b62a0cc6', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 1, 2026, '2026-01-11T00:15:38.858472+00:00', NULL, '2026-01-11T00:15:38.858472+00:00'),
  ('4008246e-9cac-4548-b2af-a821086af750', '8d859dd2-a551-48df-b3b7-b9743c2da986', 2, 2026, '2026-02-05T03:00:00+00:00', NULL, '2026-01-11T00:16:29.633383+00:00'),
  ('53d4239a-1a6b-42b2-97a6-e84e97047e4a', '8d859dd2-a551-48df-b3b7-b9743c2da986', 1, 2026, '2026-01-11T00:16:32.332429+00:00', NULL, '2026-01-11T00:16:32.332429+00:00'),
  ('5254dacc-b2d9-47b8-bfe3-7f8a9d1fa8c7', '53722f04-eaff-470a-904c-1e162f34b1d3', 2, 2026, '2026-02-05T03:00:00+00:00', NULL, '2026-01-11T00:17:07.596953+00:00'),
  ('660cde8b-407d-4e1f-89b3-2f8121ac7bb1', '53722f04-eaff-470a-904c-1e162f34b1d3', 1, 2026, '2026-01-11T00:17:09.89684+00:00', NULL, '2026-01-11T00:17:09.89684+00:00'),
  ('34f654cc-bc50-49bc-8b6a-eb9b8b547ffa', 'ed430e1d-7c36-4c70-a634-69fc99f03408', 1, 2026, '2026-01-25T04:45:06.707+00:00', NULL, '2026-01-25T04:45:26.197547+00:00')
ON CONFLICT (id) DO NOTHING;

-- BANNERS (6 registros)
INSERT INTO public.banners (id, image_url, image_desktop, image_mobile, click_type, click_target, whatsapp_number, is_active, position, created_at)
VALUES
  ('e26bad14-6533-4149-999e-d7336ae79bf9', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769477476523.png', 'link', 'https://www.disbravaford.com.br/', NULL, true, 0, '2026-01-27T01:31:19.975845+00:00'),
  ('ecfc890f-54a1-4571-a6ee-d9a2254905ad', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478481599.png', 'link', 'https://www.cometavolkswagen.com.br/', NULL, true, 1, '2026-01-27T00:26:56.323418+00:00'),
  ('3033e602-7a0d-44b9-a8de-df3f09ff3a1f', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'none', NULL, NULL, false, 1, '2025-12-28T04:32:27.531166+00:00'),
  ('7ad933e3-e4c9-425a-85e5-cf1ec0956f9c', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478777655.png', 'link', 'https://www.sagabyd.com.br/saga-byd-caceres?utm_source=google&utm_medium=search&utm_campaign=institucional&gad_source=1&gad_campaignid=22795327621&gbraid=0AAAAAo_TfHrB-1LRacjfiJAOnXGfZflbm&gclid=Cj0KCQiAvtzLBhCPARIsALwhxdpfxugyhGZt-J-80uqUHIQHTFqxAHqlAsfVs2DKIY1mYL6yLltW6y4aAs0eEALw_wcB', NULL, true, 2, '2025-12-28T07:02:47.484279+00:00'),
  ('2ae4eeda-815f-4a83-b447-b7f549e2c760', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'none', NULL, NULL, false, 2, '2025-12-28T04:32:45.678573+00:00'),
  ('1c614a78-0293-4aa8-b14b-3821665686b2', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478256656.png', 'link', 'https://www.jeep.sunauto.com.br/', NULL, true, 3, '2026-01-27T00:34:04.68074+00:00')
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  image_desktop = EXCLUDED.image_desktop,
  image_mobile = EXCLUDED.image_mobile,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target,
  is_active = EXCLUDED.is_active,
  position = EXCLUDED.position;

-- INTERNAL_EXPENSES (1 registro)
INSERT INTO public.internal_expenses (id, name, description, category, amount, expense_date, status, notes, created_at, updated_at)
VALUES
  ('3d0fdd39-ec6a-47eb-b484-59bb81bfd4c0', 'Posto gasolina', 'Gasto', 'combustivel', 120, '2026-01-05', 'paid', NULL, '2026-01-05T23:49:04.883852+00:00', '2026-01-29T17:47:15.239243+00:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  amount = EXCLUDED.amount,
  expense_date = EXCLUDED.expense_date,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- ============================================================
-- 
-- PRÓXIMOS PASSOS MANUAIS:
-- 
-- 1. CRIAR USUÁRIOS NO AUTH.USERS
--    - Execute os comandos curl no arquivo docs/GUIA-MIGRACAO-USUARIOS-AUTH.md
--    - Ou crie via Dashboard > Authentication > Users
--    - Mantenha os mesmos UUIDs!
--
-- 2. MIGRAR CARROS (inserir separadamente devido ao tamanho das descrições)
--    - Veja o arquivo MIGRATION-CARS-DATA.sql
--
-- 3. MIGRAR IMAGENS DO STORAGE
--    - Baixe os arquivos do bucket Cloud
--    - Faça upload para o seu Supabase externo
--    - Execute o script de atualização de URLs
--
-- 4. ATUALIZAR VARIÁVEIS DE AMBIENTE
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_PUBLISHABLE_KEY
--    - SUPABASE_SERVICE_ROLE_KEY (secrets)
--
-- 5. DEPLOY DAS EDGE FUNCTIONS
--    - supabase functions deploy create-garage
--    - supabase functions deploy reset-garage-password
--    - supabase functions deploy track-analytics
--    - supabase functions deploy update-garage-email
--    - supabase functions deploy sitemap
--
-- ============================================================
