-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  equipment TEXT,
  level TEXT DEFAULT 'مبتدئ',
  gender TEXT DEFAULT 'الجميع',
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  calories_min INTEGER,
  calories_max INTEGER,
  duration_days INTEGER,
  status TEXT DEFAULT 'مجاني',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatment_programs table
CREATE TABLE public.treatment_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_notes table
CREATE TABLE public.doctor_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  client_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program_exercises table (link exercises to programs)
CREATE TABLE public.program_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES treatment_programs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_videos table (assign videos to clients)
CREATE TABLE public.client_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  watched BOOLEAN DEFAULT false,
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_diet_plans table
CREATE TABLE public.client_diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  diet_plan_id UUID NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Doctors can manage their exercises" ON public.exercises
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can view all exercises" ON public.exercises
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for diet_plans
CREATE POLICY "Doctors can manage their diet plans" ON public.diet_plans
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can view all diet plans" ON public.diet_plans
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for videos
CREATE POLICY "Doctors can manage their videos" ON public.videos
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can view all videos" ON public.videos
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for treatment_programs
CREATE POLICY "Doctors can manage their programs" ON public.treatment_programs
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Clients can view their programs" ON public.treatment_programs
  FOR SELECT USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

CREATE POLICY "Admins can view all programs" ON public.treatment_programs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for doctor_notes
CREATE POLICY "Doctors can manage their notes" ON public.doctor_notes
  FOR ALL USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Clients can view notes about them" ON public.doctor_notes
  FOR SELECT USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

-- RLS Policies for program_exercises
CREATE POLICY "Doctors can manage program exercises" ON public.program_exercises
  FOR ALL USING (EXISTS (
    SELECT 1 FROM treatment_programs tp 
    WHERE tp.id = program_id AND tp.doctor_id = auth.uid()
  ));

CREATE POLICY "Clients can view their program exercises" ON public.program_exercises
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM treatment_programs tp 
    WHERE tp.id = program_id AND tp.client_id = auth.uid()
  ));

-- RLS Policies for client_videos
CREATE POLICY "Doctors can manage client videos" ON public.client_videos
  FOR ALL USING (assigned_by = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Clients can view their assigned videos" ON public.client_videos
  FOR SELECT USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

CREATE POLICY "Clients can update their video watch status" ON public.client_videos
  FOR UPDATE USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

-- RLS Policies for client_diet_plans
CREATE POLICY "Doctors can manage client diet plans" ON public.client_diet_plans
  FOR ALL USING (assigned_by = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Clients can view their diet plans" ON public.client_diet_plans
  FOR SELECT USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_programs_updated_at BEFORE UPDATE ON public.treatment_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_notes_updated_at BEFORE UPDATE ON public.doctor_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();