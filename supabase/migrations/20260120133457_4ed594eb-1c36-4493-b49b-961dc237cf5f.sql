-- Remove emoji mask from all transformations
UPDATE public.transformations 
SET use_emoji_mask = false 
WHERE use_emoji_mask = true;