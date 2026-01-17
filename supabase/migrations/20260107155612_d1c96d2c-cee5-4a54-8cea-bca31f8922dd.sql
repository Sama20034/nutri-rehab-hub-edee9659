-- Add approval status to profiles
ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id);

-- Create client-doctor assignments table
CREATE TABLE public.client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'transferred')),
    notes TEXT,
    UNIQUE (client_id, doctor_id)
);

-- Enable RLS on client_assignments
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;

-- Create function to get user status
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for client_assignments
CREATE POLICY "Admins can view all assignments"
ON public.client_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can view their assignments"
ON public.client_assignments
FOR SELECT
TO authenticated
USING (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Clients can view their assignments"
ON public.client_assignments
FOR SELECT
TO authenticated
USING (client_id = auth.uid() AND public.has_role(auth.uid(), 'client'));

CREATE POLICY "Admins can create assignments"
ON public.client_assignments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assignments"
ON public.client_assignments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assignments"
ON public.client_assignments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles policies for admin management
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));