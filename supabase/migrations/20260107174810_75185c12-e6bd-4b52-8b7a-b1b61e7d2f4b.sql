-- Create table for client exercises assigned by doctors
CREATE TABLE public.client_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  sets INTEGER,
  reps INTEGER,
  duration_minutes INTEGER,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_exercises ENABLE ROW LEVEL SECURITY;

-- Clients can view their assigned exercises
CREATE POLICY "Clients can view their exercises"
ON public.client_exercises
FOR SELECT
USING ((client_id = auth.uid()) AND has_role(auth.uid(), 'client'::app_role));

-- Clients can update completion status
CREATE POLICY "Clients can update their exercise completion"
ON public.client_exercises
FOR UPDATE
USING ((client_id = auth.uid()) AND has_role(auth.uid(), 'client'::app_role));

-- Doctors can manage client exercises they assigned
CREATE POLICY "Doctors can manage client exercises"
ON public.client_exercises
FOR ALL
USING ((assigned_by = auth.uid()) AND has_role(auth.uid(), 'doctor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_client_exercises_updated_at
BEFORE UPDATE ON public.client_exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();