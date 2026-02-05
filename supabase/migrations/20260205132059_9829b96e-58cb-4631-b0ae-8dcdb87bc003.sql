-- Create health_profiles table for storing client health information
CREATE TABLE public.health_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL UNIQUE,
  allergies TEXT[] DEFAULT '{}',
  diseases TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  supplements TEXT[] DEFAULT '{}',
  favorite_foods TEXT[] DEFAULT '{}',
  disliked_foods TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view their own health profile
CREATE POLICY "Clients can view own health profile" 
ON public.health_profiles 
FOR SELECT 
USING (auth.uid() = client_id);

-- Policy: Clients can update their own health profile
CREATE POLICY "Clients can update own health profile" 
ON public.health_profiles 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Policy: Clients can insert their own health profile
CREATE POLICY "Clients can insert own health profile" 
ON public.health_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Policy: Admins and doctors can manage all health profiles
CREATE POLICY "Admins and doctors can manage health profiles" 
ON public.health_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_profiles_updated_at
BEFORE UPDATE ON public.health_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();