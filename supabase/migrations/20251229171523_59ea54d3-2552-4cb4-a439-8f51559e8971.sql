-- ============================================================
-- SECURITY FIXES - BATCH 2: Additional hardening
-- ============================================================

-- 1️⃣ PROFILES: Add explicit block for anon SELECT
-- The REVOKE removed grants but RLS policies still need explicit block
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2️⃣ GARAGES: Already has "Block anonymous access" policy - OK

-- 3️⃣ USER_ROLES: Block INSERT and DELETE for non-super-admins
-- Users can only view their own role, super admin manages all
CREATE POLICY "Block non-admin role modifications"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin());

CREATE POLICY "Block non-admin role deletions"
ON public.user_roles
FOR DELETE
TO authenticated
USING (is_super_admin());

-- 4️⃣ ACTION_LOGS: Block all operations for non-super-admin
CREATE POLICY "Block non-admin access to action_logs"
ON public.action_logs
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Also block anon completely
CREATE POLICY "Block anonymous access to action_logs"
ON public.action_logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 5️⃣ SALES_HISTORY: Make immutable (no UPDATE/DELETE for garages)
CREATE POLICY "Garage cannot update sales history"
ON public.sales_history
FOR UPDATE
TO authenticated
USING (is_super_admin());

CREATE POLICY "Garage cannot delete sales history"
ON public.sales_history
FOR DELETE
TO authenticated
USING (is_super_admin());

-- 6️⃣ USER_ROLES: Block anon completely
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);