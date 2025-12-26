-- Add foreign key from garages.user_id to profiles.id
ALTER TABLE public.garages 
ADD CONSTRAINT garages_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;