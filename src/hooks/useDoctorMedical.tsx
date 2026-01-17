import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MedicalNote {
  id: string;
  client_id: string;
  doctor_id: string;
  title: string;
  content: string | null;
  type: string;
  severity: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string | null;
  };
}

export interface HealthMeasurement {
  id: string;
  client_id: string;
  measurement_type: string;
  value: number;
  unit: string;
  notes: string | null;
  recorded_at: string;
  recorded_by: string | null;
}

export interface ClientExercise {
  id: string;
  client_id: string;
  exercise_id: string;
  assigned_by: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  exercise?: {
    name: string;
    category: string | null;
    difficulty: string | null;
  };
}

export const useDoctorMedical = (doctorId?: string) => {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [clientExercises, setClientExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from('medical_notes')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client names
      const clientIds = [...new Set(data?.map(n => n.client_id) || [])];
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', clientIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const notesWithClients = data?.map(note => ({
          ...note,
          client: profilesMap.get(note.client_id)
        })) || [];
        
        setNotes(notesWithClients);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [doctorId]);

  const fetchMeasurements = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select('*')
        .eq('recorded_by', doctorId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  }, [doctorId]);

  const fetchClientExercises = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from('client_exercises')
        .select(`
          *,
          exercise:exercises(name, category, difficulty)
        `)
        .eq('assigned_by', doctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientExercises(data || []);
    } catch (error) {
      console.error('Error fetching client exercises:', error);
    }
  }, [doctorId]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchNotes(), fetchMeasurements(), fetchClientExercises()]);
    setLoading(false);
  }, [fetchNotes, fetchMeasurements, fetchClientExercises]);

  useEffect(() => {
    if (doctorId) {
      refreshData();
    }
  }, [doctorId, refreshData]);

  // Medical Notes CRUD
  const addNote = async (note: {
    client_id: string;
    title: string;
    content?: string;
    type: string;
    severity?: string;
  }) => {
    if (!doctorId) return { error: new Error('No doctor ID') };
    
    try {
      const { error } = await supabase
        .from('medical_notes')
        .insert({
          ...note,
          doctor_id: doctorId
        });

      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateNote = async (id: string, updates: Partial<MedicalNote>) => {
    try {
      const { error } = await supabase
        .from('medical_notes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Health Measurements CRUD
  const addMeasurement = async (measurement: {
    client_id: string;
    measurement_type: string;
    value: number;
    unit: string;
    notes?: string;
  }) => {
    if (!doctorId) return { error: new Error('No doctor ID') };
    
    try {
      const { error } = await supabase
        .from('health_measurements')
        .insert({
          ...measurement,
          recorded_by: doctorId
        });

      if (error) throw error;
      await fetchMeasurements();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Assign Exercise to Client
  const assignExercise = async (clientId: string, exerciseId: string, notes?: string) => {
    if (!doctorId) return { error: new Error('No doctor ID') };
    
    try {
      const { error } = await supabase
        .from('client_exercises')
        .insert({
          client_id: clientId,
          exercise_id: exerciseId,
          assigned_by: doctorId,
          notes
        });

      if (error) throw error;
      await fetchClientExercises();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const removeClientExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchClientExercises();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    notes,
    measurements,
    clientExercises,
    loading,
    refreshData,
    addNote,
    updateNote,
    deleteNote,
    addMeasurement,
    assignExercise,
    removeClientExercise
  };
};
