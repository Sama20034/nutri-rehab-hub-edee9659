-- Create promo_banners table for store promotional images
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  title_ar TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public read access for active banners
CREATE POLICY "Anyone can view active promo banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage promo banners"
ON public.promo_banners
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Insert default promo banners
INSERT INTO public.promo_banners (image_url, title, title_ar, display_order) VALUES
('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&q=80', 'Fitness Banner 1', 'بانر رياضي 1', 0),
('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop&q=80', 'Fitness Banner 2', 'بانر رياضي 2', 1),
('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&q=80', 'Fitness Banner 3', 'بانر رياضي 3', 2);