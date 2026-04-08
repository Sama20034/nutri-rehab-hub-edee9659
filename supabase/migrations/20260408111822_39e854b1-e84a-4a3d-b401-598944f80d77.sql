
CREATE TABLE public.mission_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active mission images"
ON public.mission_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage mission images"
ON public.mission_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
