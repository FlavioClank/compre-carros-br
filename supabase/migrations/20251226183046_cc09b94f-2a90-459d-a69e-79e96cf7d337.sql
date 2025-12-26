-- Create storage bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-photos', 'car-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view car photos (public bucket)
CREATE POLICY "Anyone can view car photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'car-photos');

-- Allow authenticated users to upload car photos
CREATE POLICY "Authenticated users can upload car photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-photos');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own car photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own car photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'car-photos' AND auth.uid()::text = (storage.foldername(name))[1]);