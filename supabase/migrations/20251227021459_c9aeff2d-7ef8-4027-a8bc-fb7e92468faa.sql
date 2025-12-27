-- Revoke all permissions from anon role on profiles table
REVOKE ALL ON public.profiles FROM anon;

-- Drop the existing blocking policy (it uses RESTRICTIVE which might cause issues)
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- Create a new permissive policy that explicitly requires authentication
-- This ensures only authenticated users can access their own profile
CREATE POLICY "Authenticated users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Drop the old redundant policy
DROP POLICY IF EXISTS "Users can only view own profile" ON public.profiles;

-- Ensure the update policy is also restricted to authenticated role
DROP POLICY IF EXISTS "Users can only update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Revoke any permissions from public role as well
REVOKE ALL ON public.profiles FROM public;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Ensure super_admin policy remains intact (it was already there)
-- No changes needed for super_admin policy