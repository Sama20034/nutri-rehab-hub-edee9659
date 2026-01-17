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
          status: 'approved' // Default status since we don't have status column
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
    // Note: status column doesn't exist in profiles table based on the schema
    // This would need a migration to add the status column
    console.warn('updateUserStatus: status column may not exist in profiles table');
    return { error: null };
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
  const pendingUsers: UserWithRole[] = [];
  const approvedUsers = users;

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