import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: string;
  email?: string;
  specialization?: string | null;
  license_number?: string | null;
  bio?: string | null;
  status: string;
  selected_package?: string | null;
  payment_method?: string | null;
  medical_followup?: boolean | null;
}

export interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string | null;
  notes?: string | null;
  client?: UserWithRole;
  doctor?: UserWithRole;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          full_name: profile.full_name || '',
          role: userRole?.role || 'unknown',
          status: profile.status || 'pending'
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const { data, error: assignmentsError } = await supabase
        .from('client_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchAssignments()]);
    setLoading(false);
  }, [fetchUsers, fetchAssignments]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      // userId here is the auth user id (profiles.user_id)
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;
      await fetchUsers();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const assignClientToDoctor = async (clientId: string, doctorId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('client_assignments')
        .insert({
          client_id: clientId,
          doctor_id: doctorId
        });

      if (error) throw error;
      await fetchAssignments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<ClientAssignment>) => {
    try {
      const { error } = await supabase
        .from('client_assignments')
        .update({ status: updates.status })
        .eq('id', assignmentId);

      if (error) throw error;
      await fetchAssignments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const transferClient = async (clientId: string, fromDoctorId: string, toDoctorId: string) => {
    try {
      // Mark old assignment as transferred
      await supabase
        .from('client_assignments')
        .update({ status: 'transferred' })
        .eq('client_id', clientId)
        .eq('doctor_id', fromDoctorId);

      // Create new assignment
      const { error } = await supabase
        .from('client_assignments')
        .insert({
          client_id: clientId,
          doctor_id: toDoctorId
        });

      if (error) throw error;
      await fetchAssignments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('client_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      await fetchAssignments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Filter helpers
  const doctors = users.filter(u => u.role === 'doctor');
  const clients = users.filter(u => u.role === 'client');
  const admins = users.filter(u => u.role === 'admin');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');

  return {
    users,
    doctors,
    clients,
    admins,
    pendingUsers,
    approvedUsers,
    assignments,
    loading,
    error,
    refreshData,
    updateUserStatus,
    assignClientToDoctor,
    updateAssignment,
    transferClient,
    deleteAssignment
  };
};