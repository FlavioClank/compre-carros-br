-- ============================================
-- SCHEMA EXPORT FOR MIGRATION TO EXTERNAL SUPABASE
-- Generated for: CarConnect Platform
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM ('super_admin', 'garage');
CREATE TYPE public.car_status AS ENUM ('available', 'sold');
CREATE TYPE public.fuel_type AS ENUM ('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid');
CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'semi_automatic');

-- ============================================
-- 2. SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS public.car_code_seq START 1;

-- ============================================
-- 3. TABLES
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Brands table
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    category TEXT NOT NULL DEFAULT 'car',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Garages table
CREATE TABLE public.garages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    can_add_vehicles BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT garages_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Cars table
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    garage_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    model TEXT NOT NULL,
    version TEXT,
    year INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    mileage INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    fuel public.fuel_type NOT NULL,
    transmission public.transmission_type NOT NULL,
    doors INTEGER DEFAULT 4,
    engine_cc INTEGER,
    description TEXT,
    photos TEXT[] DEFAULT '{}'::TEXT[],
    status public.car_status NOT NULL DEFAULT 'available',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    garage_is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT NOT NULL DEFAULT 'car',
    motorcycle_category TEXT,
    condition TEXT DEFAULT 'used',
    cooling_type TEXT,
    slug TEXT,
    sold_at TIMESTAMP WITH TIME ZONE,
    sold_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT cars_garage_id_fkey FOREIGN KEY (garage_id) REFERENCES public.garages(id),
    CONSTRAINT cars_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

-- Sales history table
CREATE TABLE public.sales_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL,
    garage_id UUID NOT NULL,
    car_snapshot JSONB NOT NULL,
    sold_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sold_reason TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID,
    is_suspicious BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT sales_history_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id),
    CONSTRAINT sales_history_garage_id_fkey FOREIGN KEY (garage_id) REFERENCES public.garages(id)
);

-- Ads table
CREATE TABLE public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url_home TEXT,
    image_url_search TEXT,
    click_type TEXT NOT NULL DEFAULT 'link',
    click_target TEXT,
    link TEXT,
    whatsapp_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Banners table
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    click_type TEXT NOT NULL DEFAULT 'none',
    click_target TEXT,
    whatsapp_number TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Action logs table
CREATE TABLE public.action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Check if current user is garage
CREATE OR REPLACE FUNCTION public.is_garage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'garage')
$$;

-- Get current user's garage ID
CREATE OR REPLACE FUNCTION public.get_user_garage_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.garages WHERE user_id = auth.uid()
$$;

-- Generate car code
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

-- Generate car slug
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

-- Set car slug trigger function
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

-- Update updated_at column
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

-- Set car garage_is_active on insert
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

-- Sync garage is_active to cars
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

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Car code generation
CREATE TRIGGER trigger_generate_car_code
    BEFORE INSERT ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_car_code();

-- Car slug generation
CREATE TRIGGER trigger_set_car_slug
    BEFORE INSERT OR UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.set_car_slug();

-- Car garage_is_active on insert
CREATE TRIGGER trigger_set_car_garage_is_active
    BEFORE INSERT ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.set_car_garage_is_active();

-- Sync garage is_active to cars
CREATE TRIGGER trigger_sync_garage_is_active
    AFTER UPDATE ON public.garages
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_garage_is_active();

-- Updated_at triggers
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_update_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_update_garages_updated_at
    BEFORE UPDATE ON public.garages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 6. ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "Block anonymous access to profiles" ON public.profiles FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Authenticated users can view own profile only" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can update own profile only" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Super admin full access on profiles" ON public.profiles FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- USER_ROLES
CREATE POLICY "Block anonymous access to user_roles" ON public.user_roles FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admin can manage roles" ON public.user_roles FOR ALL USING (is_super_admin());
CREATE POLICY "Block non-admin role modifications" ON public.user_roles FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "Block non-admin role deletions" ON public.user_roles FOR DELETE USING (is_super_admin());

-- BRANDS
CREATE POLICY "Anyone can view all brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Super admin can manage brands" ON public.brands FOR ALL USING (is_super_admin());

-- GARAGES
CREATE POLICY "Block anonymous access to garages" ON public.garages FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Garage can only view own data" ON public.garages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Garage can only update own data" ON public.garages FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Super admin full access on garages" ON public.garages FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- CARS
CREATE POLICY "Public (anon) can view available cars" ON public.cars FOR SELECT USING (status = 'available' AND garage_is_active = true);
CREATE POLICY "Public (authenticated non-garage) can view available cars" ON public.cars FOR SELECT USING (
    status = 'available' AND garage_is_active = true AND NOT EXISTS (
        SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage'
    )
);
CREATE POLICY "Garage can view own cars" ON public.cars FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage')
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid())
);
CREATE POLICY "Garage can insert own cars with permission" ON public.cars FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage')
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid())
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid() AND g.can_add_vehicles = true)
);
CREATE POLICY "Garage can update own cars" ON public.cars FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage')
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'garage')
    AND garage_id IN (SELECT g.id FROM garages g WHERE g.user_id = auth.uid())
);
CREATE POLICY "Super admin full access on cars" ON public.cars FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
);

-- SALES_HISTORY
CREATE POLICY "Block public access to sales_history" ON public.sales_history FOR SELECT USING (false);
CREATE POLICY "Garage can view own sales" ON public.sales_history FOR SELECT USING (garage_id = get_user_garage_id());
CREATE POLICY "Garage can insert own sales" ON public.sales_history FOR INSERT WITH CHECK (garage_id = get_user_garage_id());
CREATE POLICY "Garage cannot update sales history" ON public.sales_history FOR UPDATE USING (is_super_admin());
CREATE POLICY "Garage cannot delete sales history" ON public.sales_history FOR DELETE USING (is_super_admin());
CREATE POLICY "Super admin can manage sales history" ON public.sales_history FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ADS
CREATE POLICY "Public can view active ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Super admin full access on ads" ON public.ads FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- BANNERS
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Super admin full access on banners" ON public.banners FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ACTION_LOGS
CREATE POLICY "Block anonymous access to action_logs" ON public.action_logs FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Super admin can view all logs" ON public.action_logs FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admin can insert logs" ON public.action_logs FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "Block non-admin access to action_logs" ON public.action_logs FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('car-photos', 'car-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- ============================================
-- 9. STORAGE POLICIES
-- ============================================

-- car-photos bucket
CREATE POLICY "Public can view car photos" ON storage.objects FOR SELECT USING (bucket_id = 'car-photos');
CREATE POLICY "Garage can upload own car photos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Garage can update own car photos" ON storage.objects FOR UPDATE USING (
    bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Garage can delete own car photos" ON storage.objects FOR DELETE USING (
    bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Super admin full access on car-photos" ON storage.objects FOR ALL USING (
    bucket_id = 'car-photos' AND is_super_admin()
);

-- ad-images bucket
CREATE POLICY "Public can view ad images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Super admin full access on ad-images" ON storage.objects FOR ALL USING (
    bucket_id = 'ad-images' AND is_super_admin()
);

-- banners bucket
CREATE POLICY "Public can view banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Super admin full access on banners" ON storage.objects FOR ALL USING (
    bucket_id = 'banners' AND is_super_admin()
);

-- ============================================
-- END OF SCHEMA EXPORT
-- ============================================
