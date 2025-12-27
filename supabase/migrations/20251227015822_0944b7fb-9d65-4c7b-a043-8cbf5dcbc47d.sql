-- Create ads table for establishment advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Public can view only active ads
CREATE POLICY "Public can view active ads"
ON public.ads
FOR SELECT
USING (is_active = true);

-- Super admin full access
CREATE POLICY "Super admin full access on ads"
ON public.ads
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

-- Storage policies for ad images
CREATE POLICY "Public can view ad images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ad-images');

CREATE POLICY "Super admin can upload ad images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ad-images' AND is_super_admin());

CREATE POLICY "Super admin can update ad images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ad-images' AND is_super_admin());

CREATE POLICY "Super admin can delete ad images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ad-images' AND is_super_admin());