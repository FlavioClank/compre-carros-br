-- ============================================================
-- SCRIPT COMPLETO DE MIGRAÇÃO PARA SUPABASE EXTERNO
-- Gerado em: 2026-01-30
-- Projeto: Compre Carros BR
-- ============================================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Execute este script no SQL Editor do seu Supabase externo
-- 2. Após a estrutura, execute os scripts de dados (separados)
-- 3. Configure os Storage Buckets manualmente ou via SQL
-- 4. Migre os arquivos do Storage
-- 5. Atualize as URLs de imagem nos dados
--
-- ============================================================

-- ============================================================
-- PARTE 1: ENUMS
-- ============================================================

-- Criar enum app_role (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('super_admin', 'garage');
    END IF;
END$$;

-- Criar enum car_status (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'car_status') THEN
        CREATE TYPE public.car_status AS ENUM ('available', 'sold');
    END IF;
END$$;

-- Criar enum fuel_type (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
        CREATE TYPE public.fuel_type AS ENUM ('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid');
    END IF;
END$$;

-- Criar enum transmission_type (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission_type') THEN
        CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'semi_automatic');
    END IF;
END$$;

-- ============================================================
-- PARTE 2: SEQUÊNCIAS
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.car_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ============================================================
-- PARTE 3: TABELAS
-- ============================================================

-- PROFILES (relacionado ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    logo_url text,
    category text NOT NULL DEFAULT 'car'::text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- GARAGES
CREATE TABLE IF NOT EXISTS public.garages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    name text NOT NULL,
    phone text,
    address text,
    city text,
    state text,
    is_active boolean NOT NULL DEFAULT true,
    can_add_vehicles boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- CARS
CREATE TABLE IF NOT EXISTS public.cars (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    garage_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    model text NOT NULL,
    version text,
    year integer NOT NULL,
    color text NOT NULL,
    mileage integer NOT NULL DEFAULT 0,
    transmission public.transmission_type NOT NULL,
    fuel public.fuel_type NOT NULL,
    price numeric NOT NULL,
    status public.car_status NOT NULL DEFAULT 'available'::car_status,
    sold_at timestamp with time zone,
    sold_reason text,
    photos text[] DEFAULT '{}'::text[],
    description text,
    is_featured boolean NOT NULL DEFAULT false,
    doors integer DEFAULT 4,
    engine_cc integer,
    condition text DEFAULT 'used'::text,
    slug text,
    category text NOT NULL DEFAULT 'car'::text,
    cooling_type text,
    motorcycle_category text,
    code text NOT NULL UNIQUE,
    garage_is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ADS
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    category text NOT NULL,
    image_url_home text,
    image_url_search text,
    link text,
    click_type text NOT NULL DEFAULT 'link'::text,
    click_target text,
    whatsapp_number text,
    slug text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- AD_BILLING
CREATE TABLE IF NOT EXISTS public.ad_billing (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_id uuid NOT NULL UNIQUE,
    company_name text NOT NULL,
    whatsapp_number text,
    monthly_fee numeric NOT NULL DEFAULT 0,
    billing_day integer NOT NULL,
    metrics_reset_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- AD_BILLING_PAYMENTS
CREATE TABLE IF NOT EXISTS public.ad_billing_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    billing_id uuid NOT NULL,
    reference_month integer NOT NULL,
    reference_year integer NOT NULL,
    paid_at timestamp with time zone NOT NULL DEFAULT now(),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(billing_id, reference_month, reference_year)
);

-- BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url text NOT NULL,
    image_desktop text,
    image_mobile text,
    click_type text NOT NULL DEFAULT 'none'::text,
    click_target text,
    whatsapp_number text,
    position integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- INTERNAL_EXPENSES
CREATE TABLE IF NOT EXISTS public.internal_expenses (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'outros'::text,
    amount numeric NOT NULL DEFAULT 0,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    status text NOT NULL DEFAULT 'pending'::text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- SALES_HISTORY
CREATE TABLE IF NOT EXISTS public.sales_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id uuid NOT NULL,
    garage_id uuid NOT NULL,
    car_snapshot jsonb NOT NULL,
    sold_at timestamp with time zone NOT NULL DEFAULT now(),
    sold_reason text,
    notes text,
    confirmed_by uuid,
    confirmed_at timestamp with time zone,
    is_suspicious boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ACTION_LOGS
CREATE TABLE IF NOT EXISTS public.action_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================================
-- PARTE 4: FOREIGN KEYS
-- ============================================================

-- garages -> profiles
ALTER TABLE public.garages 
    DROP CONSTRAINT IF EXISTS garages_user_id_profiles_fkey;
ALTER TABLE public.garages 
    ADD CONSTRAINT garages_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- cars -> garages
ALTER TABLE public.cars 
    DROP CONSTRAINT IF EXISTS cars_garage_id_fkey;
ALTER TABLE public.cars 
    ADD CONSTRAINT cars_garage_id_fkey 
    FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE;

-- cars -> brands
ALTER TABLE public.cars 
    DROP CONSTRAINT IF EXISTS cars_brand_id_fkey;
ALTER TABLE public.cars 
    ADD CONSTRAINT cars_brand_id_fkey 
    FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE RESTRICT;

-- ad_billing -> ads
ALTER TABLE public.ad_billing 
    DROP CONSTRAINT IF EXISTS ad_billing_ad_id_fkey;
ALTER TABLE public.ad_billing 
    ADD CONSTRAINT ad_billing_ad_id_fkey 
    FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;

-- ad_billing_payments -> ad_billing
ALTER TABLE public.ad_billing_payments 
    DROP CONSTRAINT IF EXISTS ad_billing_payments_billing_id_fkey;
ALTER TABLE public.ad_billing_payments 
    ADD CONSTRAINT ad_billing_payments_billing_id_fkey 
    FOREIGN KEY (billing_id) REFERENCES public.ad_billing(id) ON DELETE CASCADE;

-- sales_history -> cars
ALTER TABLE public.sales_history 
    DROP CONSTRAINT IF EXISTS sales_history_car_id_fkey;
ALTER TABLE public.sales_history 
    ADD CONSTRAINT sales_history_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;

-- sales_history -> garages
ALTER TABLE public.sales_history 
    DROP CONSTRAINT IF EXISTS sales_history_garage_id_fkey;
ALTER TABLE public.sales_history 
    ADD CONSTRAINT sales_history_garage_id_fkey 
    FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE;

-- ============================================================
-- PARTE 5: ÍNDICES
-- ============================================================

-- brands indexes
CREATE INDEX IF NOT EXISTS idx_brands_category ON public.brands USING btree (category);
CREATE INDEX IF NOT EXISTS idx_brands_active_category ON public.brands USING btree (is_active, category, name) WHERE (is_active = true);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_brands_name_category ON public.brands USING btree (lower(name), category);

-- cars indexes
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON public.cars USING btree (brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_garage_id ON public.cars USING btree (garage_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars USING btree (status);
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars USING btree (category);
CREATE INDEX IF NOT EXISTS idx_cars_color ON public.cars USING btree (color);
CREATE INDEX IF NOT EXISTS idx_cars_condition ON public.cars USING btree (condition);
CREATE INDEX IF NOT EXISTS idx_cars_doors ON public.cars USING btree (doors);
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON public.cars USING btree (fuel);
CREATE INDEX IF NOT EXISTS idx_cars_transmission ON public.cars USING btree (transmission);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars USING btree (price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON public.cars USING btree (year);
CREATE INDEX IF NOT EXISTS idx_cars_mileage ON public.cars USING btree (mileage);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_is_featured ON public.cars USING btree (is_featured) WHERE (is_featured = true);
CREATE INDEX IF NOT EXISTS idx_cars_featured_listing ON public.cars USING btree (is_featured DESC, created_at DESC) WHERE ((status = 'available'::car_status) AND (garage_is_active = true));
CREATE INDEX IF NOT EXISTS idx_cars_public_listing ON public.cars USING btree (status, garage_is_active, is_featured DESC, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS cars_slug_unique ON public.cars USING btree (slug) WHERE (slug IS NOT NULL);

-- ads indexes
CREATE UNIQUE INDEX IF NOT EXISTS ads_slug_unique ON public.ads USING btree (slug) WHERE (slug IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads USING btree (is_active, created_at) WHERE (is_active = true);

-- banners indexes
CREATE INDEX IF NOT EXISTS idx_banners_active_position ON public.banners USING btree (is_active, position) WHERE (is_active = true);

-- ad_billing indexes
CREATE INDEX IF NOT EXISTS idx_ad_billing_ad_id ON public.ad_billing USING btree (ad_id);

-- ad_billing_payments indexes
CREATE INDEX IF NOT EXISTS idx_ad_billing_payments_billing_id ON public.ad_billing_payments USING btree (billing_id);
CREATE INDEX IF NOT EXISTS idx_ad_billing_payments_reference ON public.ad_billing_payments USING btree (reference_year, reference_month);

-- action_logs indexes
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON public.action_logs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_logs_entity ON public.action_logs USING btree (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_action ON public.action_logs USING btree (action);

-- ============================================================
-- PARTE 6: FUNÇÕES
-- ============================================================

-- Função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Função is_garage
CREATE OR REPLACE FUNCTION public.is_garage()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'garage')
$$;

-- Função get_user_garage_id
CREATE OR REPLACE FUNCTION public.get_user_garage_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.garages WHERE user_id = auth.uid()
$$;

-- Função update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função normalize_slug
CREATE OR REPLACE FUNCTION public.normalize_slug(input_text text)
RETURNS text
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

-- Função generate_car_slug
CREATE OR REPLACE FUNCTION public.generate_car_slug(p_brand_name text, p_model text, p_version text, p_year integer)
RETURNS text
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

-- Função generate_car_code (trigger)
CREATE OR REPLACE FUNCTION public.generate_car_code()
RETURNS trigger
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

-- Função set_car_slug (trigger)
CREATE OR REPLACE FUNCTION public.set_car_slug()
RETURNS trigger
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

-- Função cars_set_garage_is_active (trigger)
CREATE OR REPLACE FUNCTION public.cars_set_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  SELECT g.is_active
    INTO NEW.garage_is_active
  FROM public.garages g
  WHERE g.id = NEW.garage_id;
  RETURN NEW;
END;
$$;

-- Função garages_sync_cars_garage_is_active (trigger)
CREATE OR REPLACE FUNCTION public.garages_sync_cars_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
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

-- Trigger para gerar código do carro
DROP TRIGGER IF EXISTS trg_generate_car_code ON public.cars;
CREATE TRIGGER trg_generate_car_code
    BEFORE INSERT ON public.cars
    FOR EACH ROW
    WHEN (NEW.code IS NULL OR NEW.code = '')
    EXECUTE FUNCTION public.generate_car_code();

-- Trigger para gerar slug do carro
DROP TRIGGER IF EXISTS trg_set_car_slug ON public.cars;
CREATE TRIGGER trg_set_car_slug
    BEFORE INSERT OR UPDATE OF model, version, year, brand_id ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.set_car_slug();

-- Trigger para atualizar updated_at em cars
DROP TRIGGER IF EXISTS trg_cars_updated_at ON public.cars;
CREATE TRIGGER trg_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar updated_at em garages
DROP TRIGGER IF EXISTS trg_garages_updated_at ON public.garages;
CREATE TRIGGER trg_garages_updated_at
    BEFORE UPDATE ON public.garages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar updated_at em brands
DROP TRIGGER IF EXISTS trg_brands_updated_at ON public.brands;
CREATE TRIGGER trg_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar updated_at em ads
DROP TRIGGER IF EXISTS trg_ads_updated_at ON public.ads;
CREATE TRIGGER trg_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar updated_at em ad_billing
DROP TRIGGER IF EXISTS trg_ad_billing_updated_at ON public.ad_billing;
CREATE TRIGGER trg_ad_billing_updated_at
    BEFORE UPDATE ON public.ad_billing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para atualizar updated_at em internal_expenses
DROP TRIGGER IF EXISTS trg_internal_expenses_updated_at ON public.internal_expenses;
CREATE TRIGGER trg_internal_expenses_updated_at
    BEFORE UPDATE ON public.internal_expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Trigger para definir garage_is_active em novos carros
DROP TRIGGER IF EXISTS trg_cars_set_garage_is_active ON public.cars;
CREATE TRIGGER trg_cars_set_garage_is_active
    BEFORE INSERT ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.cars_set_garage_is_active();

-- Trigger para sincronizar garage_is_active quando garage muda
DROP TRIGGER IF EXISTS trg_garages_sync_cars ON public.garages;
CREATE TRIGGER trg_garages_sync_cars
    AFTER UPDATE OF is_active ON public.garages
    FOR EACH ROW
    EXECUTE FUNCTION public.garages_sync_cars_garage_is_active();

-- ============================================================
-- PARTE 8: HABILITAR RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PARTE 9: POLICIES RLS
-- ============================================================

-- ==================== PROFILES ====================
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
CREATE POLICY "Block anonymous access to profiles" ON public.profiles
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Authenticated users can view own profile only" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile only" ON public.profiles
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can update own profile only" ON public.profiles;
CREATE POLICY "Authenticated users can update own profile only" ON public.profiles
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
CREATE POLICY "Super admin full access on profiles" ON public.profiles
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== USER_ROLES ====================
DROP POLICY IF EXISTS "Block anonymous access to user_roles" ON public.user_roles;
CREATE POLICY "Block anonymous access to user_roles" ON public.user_roles
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admin can manage roles" ON public.user_roles;
CREATE POLICY "Super admin can manage roles" ON public.user_roles
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Block non-admin role modifications" ON public.user_roles;
CREATE POLICY "Block non-admin role modifications" ON public.user_roles
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Block non-admin role deletions" ON public.user_roles;
CREATE POLICY "Block non-admin role deletions" ON public.user_roles
    AS PERMISSIVE FOR DELETE TO authenticated
    USING (is_super_admin());

-- ==================== BRANDS ====================
DROP POLICY IF EXISTS "Anyone can view all brands" ON public.brands;
CREATE POLICY "Anyone can view all brands" ON public.brands
    AS PERMISSIVE FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Super admin can manage brands" ON public.brands;
CREATE POLICY "Super admin can manage brands" ON public.brands
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin());

-- ==================== GARAGES ====================
DROP POLICY IF EXISTS "Block anonymous access to garages" ON public.garages;
CREATE POLICY "Block anonymous access to garages" ON public.garages
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Garage can only view own data" ON public.garages;
CREATE POLICY "Garage can only view own data" ON public.garages
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Garage can only update own data" ON public.garages;
CREATE POLICY "Garage can only update own data" ON public.garages
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin full access on garages" ON public.garages;
CREATE POLICY "Super admin full access on garages" ON public.garages
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== CARS ====================
DROP POLICY IF EXISTS "Public (anon) can view available cars" ON public.cars;
CREATE POLICY "Public (anon) can view available cars" ON public.cars
    AS PERMISSIVE FOR SELECT TO anon
    USING ((status = 'available'::car_status) AND (garage_is_active = true));

DROP POLICY IF EXISTS "Public (authenticated non-garage) can view available cars" ON public.cars;
CREATE POLICY "Public (authenticated non-garage) can view available cars" ON public.cars
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (
        (status = 'available'::car_status) 
        AND (garage_is_active = true) 
        AND (NOT (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'::app_role)))
    );

DROP POLICY IF EXISTS "Garage can view own cars" ON public.cars;
CREATE POLICY "Garage can view own cars" ON public.cars
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (
        (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'::app_role))
        AND (garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Garage can insert own cars with permission" ON public.cars;
CREATE POLICY "Garage can insert own cars with permission" ON public.cars
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (
        (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'::app_role))
        AND (garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()))
        AND (garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid() AND g.can_add_vehicles = true))
    );

DROP POLICY IF EXISTS "Garage can update own cars" ON public.cars;
CREATE POLICY "Garage can update own cars" ON public.cars
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (
        (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'::app_role))
        AND (garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()))
    )
    WITH CHECK (
        (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'::app_role))
        AND (garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Super admin full access on cars" ON public.cars;
CREATE POLICY "Super admin full access on cars" ON public.cars
    AS PERMISSIVE FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::app_role))
    WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'::app_role));

-- ==================== ADS ====================
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads" ON public.ads
    AS PERMISSIVE FOR SELECT TO public
    USING (is_active = true);

DROP POLICY IF EXISTS "Super admin full access on ads" ON public.ads;
CREATE POLICY "Super admin full access on ads" ON public.ads
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== AD_BILLING ====================
DROP POLICY IF EXISTS "Block anonymous access to ad_billing" ON public.ad_billing;
CREATE POLICY "Block anonymous access to ad_billing" ON public.ad_billing
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on ad_billing" ON public.ad_billing;
CREATE POLICY "Super admin full access on ad_billing" ON public.ad_billing
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== AD_BILLING_PAYMENTS ====================
DROP POLICY IF EXISTS "Block anonymous access to ad_billing_payments" ON public.ad_billing_payments;
CREATE POLICY "Block anonymous access to ad_billing_payments" ON public.ad_billing_payments
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on ad_billing_payments" ON public.ad_billing_payments;
CREATE POLICY "Super admin full access on ad_billing_payments" ON public.ad_billing_payments
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== BANNERS ====================
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners
    AS PERMISSIVE FOR SELECT TO public
    USING (is_active = true);

DROP POLICY IF EXISTS "Super admin full access on banners" ON public.banners;
CREATE POLICY "Super admin full access on banners" ON public.banners
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== INTERNAL_EXPENSES ====================
DROP POLICY IF EXISTS "Block anonymous access to internal_expenses" ON public.internal_expenses;
CREATE POLICY "Block anonymous access to internal_expenses" ON public.internal_expenses
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Super admin full access on internal_expenses" ON public.internal_expenses;
CREATE POLICY "Super admin full access on internal_expenses" ON public.internal_expenses
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== SALES_HISTORY ====================
DROP POLICY IF EXISTS "Block public access to sales_history" ON public.sales_history;
CREATE POLICY "Block public access to sales_history" ON public.sales_history
    AS PERMISSIVE FOR SELECT TO anon
    USING (false);

DROP POLICY IF EXISTS "Garage can view own sales" ON public.sales_history;
CREATE POLICY "Garage can view own sales" ON public.sales_history
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (garage_id = get_user_garage_id());

DROP POLICY IF EXISTS "Garage can insert own sales" ON public.sales_history;
CREATE POLICY "Garage can insert own sales" ON public.sales_history
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (garage_id = get_user_garage_id());

DROP POLICY IF EXISTS "Garage cannot update sales history" ON public.sales_history;
CREATE POLICY "Garage cannot update sales history" ON public.sales_history
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Garage cannot delete sales history" ON public.sales_history;
CREATE POLICY "Garage cannot delete sales history" ON public.sales_history
    AS PERMISSIVE FOR DELETE TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can manage sales history" ON public.sales_history;
CREATE POLICY "Super admin can manage sales history" ON public.sales_history
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ==================== ACTION_LOGS ====================
DROP POLICY IF EXISTS "Block anonymous access to action_logs" ON public.action_logs;
CREATE POLICY "Block anonymous access to action_logs" ON public.action_logs
    AS PERMISSIVE FOR ALL TO anon
    USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Block non-admin access to action_logs" ON public.action_logs;
CREATE POLICY "Block non-admin access to action_logs" ON public.action_logs
    AS PERMISSIVE FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admin can view all logs" ON public.action_logs;
CREATE POLICY "Super admin can view all logs" ON public.action_logs
    AS PERMISSIVE FOR SELECT TO authenticated
    USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can insert logs" ON public.action_logs;
CREATE POLICY "Super admin can insert logs" ON public.action_logs
    AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (is_super_admin());

-- ============================================================
-- PARTE 10: STORAGE BUCKETS
-- ============================================================

-- Criar buckets (execute após as tabelas)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-photos', 'car-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies para car-photos
DROP POLICY IF EXISTS "Public can view car photos" ON storage.objects;
CREATE POLICY "Public can view car photos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Authenticated users can upload car photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload car photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Authenticated users can update car photos" ON storage.objects;
CREATE POLICY "Authenticated users can update car photos" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'car-photos');

DROP POLICY IF EXISTS "Authenticated users can delete car photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete car photos" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'car-photos');

-- Storage Policies para ad-images
DROP POLICY IF EXISTS "Public can view ad images" ON storage.objects;
CREATE POLICY "Public can view ad images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Super admin can manage ad images" ON storage.objects;
CREATE POLICY "Super admin can manage ad images" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'ad-images' AND is_super_admin())
    WITH CHECK (bucket_id = 'ad-images' AND is_super_admin());

-- Storage Policies para banners
DROP POLICY IF EXISTS "Public can view banners" ON storage.objects;
CREATE POLICY "Public can view banners" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Super admin can manage banners storage" ON storage.objects;
CREATE POLICY "Super admin can manage banners storage" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'banners' AND is_super_admin())
    WITH CHECK (bucket_id = 'banners' AND is_super_admin());

-- ============================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- ============================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute o script de exportação de dados (separado)
-- 2. Crie os usuários no auth.users (via Admin API)
-- 3. Migre os arquivos do Storage
-- 4. Atualize as URLs de imagem nos dados
-- 5. Configure as variáveis de ambiente no seu projeto
--
-- ============================================================
