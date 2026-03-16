
-- Create site_settings table (key-value store)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for pixel loader)
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert the current pixel ID
INSERT INTO public.site_settings (key, value) VALUES ('facebook_pixel_id', '891541746797169');
