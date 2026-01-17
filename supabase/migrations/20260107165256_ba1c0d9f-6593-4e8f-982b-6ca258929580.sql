-- Create muscles table
CREATE TABLE public.muscles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.muscles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for muscles
CREATE POLICY "Doctors can manage their muscles" ON public.muscles
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can view all muscles" ON public.muscles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for equipment
CREATE POLICY "Doctors can manage their equipment" ON public.equipment
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can view all equipment" ON public.equipment
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_muscles_updated_at BEFORE UPDATE ON public.muscles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();