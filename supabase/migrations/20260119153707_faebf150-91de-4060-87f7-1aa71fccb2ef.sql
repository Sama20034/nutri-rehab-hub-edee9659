-- Create transformations/success stories table
CREATE TABLE public.transformations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT,
    is_combined_image BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'weight_loss',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    use_emoji_mask BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

-- Public can view active transformations
CREATE POLICY "Anyone can view active transformations"
ON public.transformations
FOR SELECT
USING (is_active = true);

-- Admins can manage all transformations
CREATE POLICY "Admins can manage transformations"
ON public.transformations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_transformations_updated_at
BEFORE UPDATE ON public.transformations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for transformation images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transformations', 'transformations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for transformations bucket
CREATE POLICY "Anyone can view transformation images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'transformations');

CREATE POLICY "Admins can upload transformation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'transformations' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transformation images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'transformations' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete transformation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'transformations' AND public.has_role(auth.uid(), 'admin'));