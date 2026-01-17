import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string;
  notes: string | null;
  client?: ClientProfile;
}

export const useDoctorClients = (doctorId?: string) => {
  const [clients, setClients] = useState<ClientAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      
      // Fetch assignments for this doctor
      const { data: assignments, error: assignmentsError } = await supabase
        .from('client_assignments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      if (assignments && assignments.length > 0) {
        // Fetch client profiles
        const clientIds = assignments.map(a => a.client_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, phone, avatar_url, status, created_at')
          .in('user_id', clientIds);

        if (profilesError) throw profilesError;

        // Combine assignments with client profiles
        const assignmentsWithClients = assignments.map(assignment => ({
          ...assignment,
          client: profiles?.find(p => p.user_id === assignment.client_id)
        }));

        setClients(assignmentsWithClients);
      } else {
        setClients([]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refreshData: fetchClients
  };
};
