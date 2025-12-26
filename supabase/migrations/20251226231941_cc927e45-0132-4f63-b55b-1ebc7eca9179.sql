-- 1) Profiles table: Ensure explicit denial of public access
-- Drop existing SELECT policies to recreate with explicit auth check
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with explicit auth.uid() IS NOT NULL checks
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Super admin full access on profiles" 
ON public.profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL AND is_super_admin())
WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- 2) Garages table: Ensure explicit denial of public access
-- Drop existing SELECT/UPDATE policies to recreate with explicit auth check
DROP POLICY IF EXISTS "Garage can view own data" ON public.garages;
DROP POLICY IF EXISTS "Garage can update own data" ON public.garages;
DROP POLICY IF EXISTS "Super admin can manage all garages" ON public.garages;

-- Recreate with explicit auth.uid() IS NOT NULL checks
CREATE POLICY "Garage can view own data" 
ON public.garages 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Garage can update own data" 
ON public.garages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Super admin can manage all garages" 
ON public.garages 
FOR ALL 
USING (auth.uid() IS NOT NULL AND is_super_admin())
WITH CHECK (auth.uid() IS NOT NULL AND is_super_admin());