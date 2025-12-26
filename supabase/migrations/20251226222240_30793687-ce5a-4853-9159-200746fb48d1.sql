-- Allow public users to view active garages (needed for cars RLS policy to work)
CREATE POLICY "Public can view active garages"
ON public.garages
FOR SELECT
USING (is_active = true);