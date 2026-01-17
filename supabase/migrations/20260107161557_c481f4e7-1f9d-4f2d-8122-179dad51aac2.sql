-- Create doctor schedules table for available time slots
CREATE TABLE public.doctor_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  schedule_id UUID REFERENCES public.doctor_schedules(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Doctor schedules policies
CREATE POLICY "Doctors can manage their own schedules"
ON public.doctor_schedules
FOR ALL
USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Approved clients can view doctor schedules"
ON public.doctor_schedules
FOR SELECT
USING (is_available = true AND is_user_approved(auth.uid()));

CREATE POLICY "Admins can view all schedules"
ON public.doctor_schedules
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Appointments policies
CREATE POLICY "Clients can view their own appointments"
ON public.appointments
FOR SELECT
USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

CREATE POLICY "Clients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role) AND is_user_approved(auth.uid()));

CREATE POLICY "Clients can update their own appointments"
ON public.appointments
FOR UPDATE
USING (client_id = auth.uid() AND has_role(auth.uid(), 'client'::app_role));

CREATE POLICY "Doctors can view their appointments"
ON public.appointments
FOR SELECT
USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can update their appointments"
ON public.appointments
FOR UPDATE
USING (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Admins can manage all appointments"
ON public.appointments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_doctor_schedules_updated_at
BEFORE UPDATE ON public.doctor_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();