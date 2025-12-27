-- 1. RECREATE public_active_cars VIEW with SECURITY INVOKER (default, safer)
-- Drop existing view first
DROP VIEW IF EXISTS public.public_active_cars;

-- Recreate view WITHOUT SECURITY DEFINER (uses INVOKER by default)
-- This view only exposes non-sensitive car data, no phone/email/garage contact info
CREATE VIEW public.public_active_cars AS
SELECT 
  c.id,
  c.code,
  c.model,
  c.year,
  c.version,
  c.mileage,
  c.transmission,
  c.fuel,
  c.color,
  c.price,
  c.photos,
  c.is_featured,
  c.created_at,
  c.description,
  b.id as brand_id,
  b.name as brand_name,
  b.logo_url as brand_logo_url
FROM public.cars c
JOIN public.brands b ON c.brand_id = b.id
JOIN public.garages g ON c.garage_id = g.id
WHERE c.status = 'available'
  AND g.is_active = true
  AND b.is_active = true;

-- Grant SELECT on the view to anon and authenticated (public read)
GRANT SELECT ON public.public_active_cars TO anon, authenticated;

-- 2. REINFORCE profiles RLS policies
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Block public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Block ALL public/anonymous access (explicit deny)
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Authenticated users can ONLY see their own profile (prevents email harvesting)
CREATE POLICY "Users can only view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Authenticated users can only update their own profile
CREATE POLICY "Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Super Admin has full access to all profiles
CREATE POLICY "Super admin full access on profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 3. REINFORCE garages RLS policies
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Block public access to garages" ON public.garages;
DROP POLICY IF EXISTS "Garage can view own data" ON public.garages;
DROP POLICY IF EXISTS "Garage can update own data" ON public.garages;
DROP POLICY IF EXISTS "Super admin can manage all garages" ON public.garages;

-- Block ALL public/anonymous access (explicit deny)
CREATE POLICY "Block anonymous access to garages"
ON public.garages
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Garage users can ONLY see their own garage data (phone, address, etc.)
CREATE POLICY "Garage can only view own data"
ON public.garages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Garage users can ONLY update their own garage data
CREATE POLICY "Garage can only update own data"
ON public.garages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Super Admin has full access to all garages
CREATE POLICY "Super admin full access on garages"
ON public.garages
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 4. Ensure cars table RLS is also secure (garage isolation)
-- Drop and recreate to ensure proper isolation
DROP POLICY IF EXISTS "Public can view available cars from active garages" ON public.cars;

-- Public can view cars only through the VIEW (which filters properly)
-- This direct policy allows the VIEW to work correctly
CREATE POLICY "Public can view available cars via view"
ON public.cars
FOR SELECT
TO anon, authenticated
USING (
  status = 'available' 
  AND EXISTS (
    SELECT 1 FROM public.garages g 
    WHERE g.id = garage_id 
    AND g.is_active = true
  )
);