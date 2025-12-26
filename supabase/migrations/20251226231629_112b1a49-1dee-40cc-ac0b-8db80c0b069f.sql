-- 1) Fix garages table: Remove public read access
DROP POLICY IF EXISTS "Public can view active garages" ON public.garages;

-- 2) Fix action_logs INSERT policy: Replace WITH CHECK true with proper validation
DROP POLICY IF EXISTS "Super admin can insert logs" ON public.action_logs;

CREATE POLICY "Super admin can insert logs" 
ON public.action_logs 
FOR INSERT 
WITH CHECK (is_super_admin());