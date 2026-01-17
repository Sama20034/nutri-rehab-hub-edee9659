import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DoctorProfile {
  id: string;
  user_id: string;
  full_name: string;
  specialization: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string;
  notes: string | null;
}

export const useClientData = (clientId?: string) => {
  const [assignedDoctor, setAssignedDoctor] = useState<DoctorProfile | null>(null);
  const [assignment, setAssignment] = useState<ClientAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      
      // Fetch client assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('client_assignments')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      if (assignmentError && assignmentError.code !== 'PGRST116') {
        throw assignmentError;
      }

      if (assignmentData) {
        setAssignment(assignmentData);

        // Fetch doctor profile
        const { data: doctorProfile, error: doctorError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, specialization, avatar_url, bio')
          .eq('user_id', assignmentData.doctor_id)
          .single();

        if (doctorError) throw doctorError;
        setAssignedDoctor(doctorProfile);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  return {
    assignedDoctor,
    assignment,
    loading,
    error,
    refreshData: fetchAssignment
  };
};
