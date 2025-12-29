-- ============================================================
-- SECURITY FIXES - Incremental, non-breaking changes
-- ============================================================

-- 1️⃣ CARS: Enforce can_add_vehicles on INSERT (backend validation)
-- Drop existing INSERT policy for garage and recreate with validation
DROP POLICY IF EXISTS "Garage can insert own cars" ON public.cars;

CREATE POLICY "Garage can insert own cars with permission"
ON public.cars
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must have garage role
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'garage'
  )
  AND
  -- Must be their own garage
  garage_id IN (SELECT g.id FROM public.garages g WHERE g.user_id = auth.uid())
  AND
  -- Garage must have can_add_vehicles = true
  garage_id IN (SELECT g.id FROM public.garages g WHERE g.user_id = auth.uid() AND g.can_add_vehicles = true)
);

-- 2️⃣ USER_ROLES: Block anonymous access explicitly
-- First, drop any existing permissive policies that might allow anon access
-- Then ensure only authenticated users can see their own roles (already exists but let's be explicit)

-- Revoke any default grants to anon
REVOKE ALL ON public.user_roles FROM anon;

-- 3️⃣ PROFILES: Block anonymous access explicitly
-- Already has policies but need to ensure anon is blocked
REVOKE ALL ON public.profiles FROM anon;

-- 4️⃣ GARAGES: Create view for public data, block direct access to sensitive fields
-- The garages table already blocks anon with "Block anonymous access to garages" policy
-- But we need to ensure the public pages still work - they access cars, not garages directly
-- So we just need to ensure the existing policy is enforced (it already is)

-- Double-check: Revoke direct anon access 
REVOKE ALL ON public.garages FROM anon;

-- 5️⃣ STORAGE: Fix car-photos INSERT policy to validate garage ownership
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload car photos" ON storage.objects;

-- Create secure INSERT policy that validates folder belongs to user's garage
CREATE POLICY "Garage can upload to own folder only"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-photos'
  AND
  -- The first folder in the path must be the user's garage ID
  (storage.foldername(name))[1] IN (
    SELECT g.id::text FROM public.garages g WHERE g.user_id = auth.uid()
  )
);

-- Also allow super_admin to upload to any folder
CREATE POLICY "Super admin can upload any car photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-photos'
  AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  )
);

-- Fix UPDATE policy to also allow super_admin
DROP POLICY IF EXISTS "Users can update own car photos" ON storage.objects;

CREATE POLICY "Garage can update own car photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-photos'
  AND (
    -- Own garage folder
    (storage.foldername(name))[1] IN (
      SELECT g.id::text FROM public.garages g WHERE g.user_id = auth.uid()
    )
    OR
    -- Super admin can update any
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  )
);

-- Fix DELETE policy to also allow super_admin
DROP POLICY IF EXISTS "Users can delete own car photos" ON storage.objects;

CREATE POLICY "Garage can delete own car photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-photos'
  AND (
    -- Own garage folder
    (storage.foldername(name))[1] IN (
      SELECT g.id::text FROM public.garages g WHERE g.user_id = auth.uid()
    )
    OR
    -- Super admin can delete any
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  )
);