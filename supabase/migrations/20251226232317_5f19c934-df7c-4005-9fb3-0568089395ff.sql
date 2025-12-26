-- FINAL SECURITY HARDENING - RLS POLICIES

-- 1) PROFILES TABLE: Explicit public denial
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Block public (unauthenticated) access completely
CREATE POLICY "Block public access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Authenticated users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Super admin full access
CREATE POLICY "Super admin full access on profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2) GARAGES TABLE: Complete public block
DROP POLICY IF EXISTS "Garage can view own data" ON public.garages;
DROP POLICY IF EXISTS "Garage can update own data" ON public.garages;
DROP POLICY IF EXISTS "Super admin can manage all garages" ON public.garages;

-- Block public (unauthenticated) access completely
CREATE POLICY "Block public access to garages"
ON public.garages
FOR SELECT
TO anon
USING (false);

-- Garage owner can view own data
CREATE POLICY "Garage can view own data" 
ON public.garages 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Garage owner can update own data
CREATE POLICY "Garage can update own data" 
ON public.garages 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Super admin full access
CREATE POLICY "Super admin can manage all garages" 
ON public.garages 
FOR ALL 
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 3) SALES_HISTORY TABLE: Strengthen garage isolation
DROP POLICY IF EXISTS "Garage can view own sales" ON public.sales_history;
DROP POLICY IF EXISTS "Super admin can manage sales history" ON public.sales_history;

-- Block public (unauthenticated) access completely
CREATE POLICY "Block public access to sales_history"
ON public.sales_history
FOR SELECT
TO anon
USING (false);

-- Garage can only view own sales with explicit auth check
CREATE POLICY "Garage can view own sales" 
ON public.sales_history 
FOR SELECT 
TO authenticated
USING (garage_id = get_user_garage_id());

-- Garage can insert own sales
CREATE POLICY "Garage can insert own sales"
ON public.sales_history
FOR INSERT
TO authenticated
WITH CHECK (garage_id = get_user_garage_id());

-- Super admin full access
CREATE POLICY "Super admin can manage sales history" 
ON public.sales_history 
FOR ALL 
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());