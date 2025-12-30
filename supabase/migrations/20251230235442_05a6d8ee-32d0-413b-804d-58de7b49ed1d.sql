-- Add banner click/position fields
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_type text NOT NULL DEFAULT 'none', -- 'none' | 'link' | 'instagram' | 'whatsapp'
  ADD COLUMN IF NOT EXISTS click_target text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Add ad click fields
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS click_type text NOT NULL DEFAULT 'link', -- 'link' | 'instagram' | 'whatsapp'
  ADD COLUMN IF NOT EXISTS click_target text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;