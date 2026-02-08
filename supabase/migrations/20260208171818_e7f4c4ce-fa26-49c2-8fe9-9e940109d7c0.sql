-- Create health_profile_templates table for reusable health profile templates
CREATE TABLE public.health_profile_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  allergies TEXT[] DEFAULT '{}',
  diseases TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  supplements TEXT[] DEFAULT '{}',
  favorite_foods TEXT[] DEFAULT '{}',
  disliked_foods TEXT[] DEFAULT '{}',
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  video_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_profile_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Doctors and admins can manage health profile templates"
ON public.health_profile_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Authenticated users can view health profile templates"
ON public.health_profile_templates
FOR SELECT
USING (true);

-- Create client_health_profile_assignments to assign templates to clients
CREATE TABLE public.client_health_profile_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.health_profile_templates(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  assigned_by UUID,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_health_profile_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Doctors and admins can manage assignments"
ON public.client_health_profile_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Clients can view own assignments"
ON public.client_health_profile_assignments
FOR SELECT
USING (auth.uid() = client_id);

-- Create trigger for updated_at
CREATE TRIGGER update_health_profile_templates_updated_at
BEFORE UPDATE ON public.health_profile_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();