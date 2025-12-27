-- Create banners table for home page banner carousel
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'banners'
      AND policyname = 'Public can view active banners'
  ) THEN
    CREATE POLICY "Public can view active banners"
    ON public.banners
    FOR SELECT
    USING (is_active = true);
  END IF;
END $$;

-- Super admin full access on banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'banners'
      AND policyname = 'Super admin full access on banners'
  ) THEN
    CREATE POLICY "Super admin full access on banners"
    ON public.banners
    FOR ALL
    USING (is_super_admin())
    WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Create storage bucket for banner images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to banner images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read access to banner images'
  ) THEN
    CREATE POLICY "Public read access to banner images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'banners');
  END IF;
END $$;

-- Allow super admins to manage banner images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Super admin full access to banner images'
  ) THEN
    CREATE POLICY "Super admin full access to banner images"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'banners' AND is_super_admin())
    WITH CHECK (bucket_id = 'banners' AND is_super_admin());
  END IF;
END $$;