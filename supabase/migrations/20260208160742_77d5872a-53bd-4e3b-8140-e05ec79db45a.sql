-- Add position field to promo_banners table to distinguish between top and bottom sliders
ALTER TABLE public.promo_banners 
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'top' CHECK (position IN ('top', 'bottom'));

-- Update existing banners to be 'top' position
UPDATE public.promo_banners SET position = 'top' WHERE position IS NULL;