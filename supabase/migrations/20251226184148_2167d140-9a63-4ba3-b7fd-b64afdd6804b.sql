-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policies for profiles table

-- Super Admin can do everything (SELECT, INSERT, UPDATE)
CREATE POLICY "Super admin full access on profiles"
ON public.profiles
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);