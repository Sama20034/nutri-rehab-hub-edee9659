-- Add image_url column to store_categories for category images
ALTER TABLE public.store_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update main categories with placeholder images
UPDATE public.store_categories SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=600&fit=crop&q=80' WHERE name = 'Proteins & Amino Acids' AND parent_id IS NULL;
UPDATE public.store_categories SET image_url = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80' WHERE name = 'Pre-Workout & Energy' AND parent_id IS NULL;
UPDATE public.store_categories SET image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80' WHERE name = 'Weight Loss' AND parent_id IS NULL;
UPDATE public.store_categories SET image_url = 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&q=80' WHERE name = 'General Health' AND parent_id IS NULL;
UPDATE public.store_categories SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80' WHERE name = 'Fitness Equipment' AND parent_id IS NULL;