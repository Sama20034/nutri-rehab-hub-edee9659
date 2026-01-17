-- Create medical_notes table for medical follow-up content
CREATE TABLE public.medical_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    type TEXT NOT NULL DEFAULT 'advice', -- 'advice', 'warning', 'follow_up', 'measurement'
    title TEXT NOT NULL,
    content TEXT,
    severity TEXT DEFAULT 'normal', -- 'normal', 'important', 'critical'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_measurements table for tracking health metrics
CREATE TABLE public.health_measurements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    recorded_by UUID,
    measurement_type TEXT NOT NULL, -- 'weight', 'blood_pressure', 'blood_sugar', 'heart_rate', 'bmi'
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_measurements ENABLE ROW LEVEL SECURITY;

-- RLS policies for medical_notes
CREATE POLICY "Clients can view own medical notes"
ON public.medical_notes
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Clients can update read status"
ON public.medical_notes
FOR UPDATE
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Doctors can manage medical notes"
ON public.medical_notes
FOR ALL
USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- RLS policies for health_measurements
CREATE POLICY "Clients can view own measurements"
ON public.health_measurements
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Doctors can manage measurements"
ON public.health_measurements
FOR ALL
USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_medical_notes_updated_at
    BEFORE UPDATE ON public.medical_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();