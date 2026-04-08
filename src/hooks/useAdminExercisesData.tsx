import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  image_url: string | null;
  category: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  created_by: string | null;
  created_at: string;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  calories_min: number | null;
  calories_max: number | null;
  duration_weeks: number | null;
  status: string | null;
  created_by: string | null;
  created_at: string;
  attachments: FileAttachment[] | null;
  video_urls: string[] | null;
}

export const useAdminExercisesData = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setExercises(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const fetchDietPlans = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('diet_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      // Transform the data to match our interface
      const transformedData = (data || []).map(plan => ({
        ...plan,
        attachments: (plan.attachments as unknown as FileAttachment[]) || [],
        video_urls: plan.video_urls || []
      }));
      setDietPlans(transformedData);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchExercises(), fetchDietPlans()]);
    setLoading(false);
  }, [fetchExercises, fetchDietPlans]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Exercise CRUD
  const addExercise = async (exercise: Omit<Exercise, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('exercises').insert(exercise);
      if (error) throw error;
      await fetchExercises();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      const { error } = await supabase.from('exercises').update(updates).eq('id', id);
      if (error) throw error;
      await fetchExercises();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      await fetchExercises();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Diet Plan CRUD
  const addDietPlan = async (plan: Omit<DietPlan, 'id' | 'created_at'>) => {
    try {
      const dbPlan = {
        name: plan.name,
        description: plan.description,
        goal: plan.goal,
        calories_min: plan.calories_min,
        calories_max: plan.calories_max,
        duration_weeks: plan.duration_weeks,
        status: plan.status,
        created_by: plan.created_by,
        attachments: JSON.parse(JSON.stringify(plan.attachments || [])),
        video_urls: plan.video_urls || []
      };
      const { error } = await supabase.from('diet_plans').insert(dbPlan);
      if (error) throw error;
      await fetchDietPlans();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateDietPlan = async (id: string, updates: Partial<DietPlan>) => {
    try {
      const dbUpdates: {
        name?: string;
        description?: string | null;
        goal?: string | null;
        calories_min?: number | null;
        calories_max?: number | null;
        duration_weeks?: number | null;
        status?: string | null;
        created_by?: string | null;
        attachments?: Json | null;
        video_urls?: string[] | null;
      } = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
      if (updates.calories_min !== undefined) dbUpdates.calories_min = updates.calories_min;
      if (updates.calories_max !== undefined) dbUpdates.calories_max = updates.calories_max;
      if (updates.duration_weeks !== undefined) dbUpdates.duration_weeks = updates.duration_weeks;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.created_by !== undefined) dbUpdates.created_by = updates.created_by;
      if (updates.attachments !== undefined) dbUpdates.attachments = JSON.parse(JSON.stringify(updates.attachments));
      if (updates.video_urls !== undefined) dbUpdates.video_urls = updates.video_urls;
      
      const { error } = await supabase.from('diet_plans').update(dbUpdates).eq('id', id);
      if (error) throw error;
      await fetchDietPlans();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteDietPlan = async (id: string) => {
    try {
      const { error } = await supabase.from('diet_plans').delete().eq('id', id);
      if (error) throw error;
      await fetchDietPlans();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Assign diet plan to multiple clients
  const assignDietPlanToClients = async (dietPlanId: string, clientIds: string[], assignedBy: string) => {
    try {
      const assignments = clientIds.map(clientId => ({
        diet_plan_id: dietPlanId,
        client_id: clientId,
        assigned_by: assignedBy,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
      }));
      
      const { error } = await supabase.from('client_diet_plans').insert(assignments);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Assign exercise to multiple clients
  const assignExerciseToClients = async (exerciseId: string, clientIds: string[], assignedBy: string) => {
    try {
      const assignments = clientIds.map(clientId => ({
        exercise_id: exerciseId,
        client_id: clientId,
        assigned_by: assignedBy,
        completed: false
      }));
      
      const { error } = await supabase.from('client_exercises').insert(assignments);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    exercises,
    dietPlans,
    loading,
    error,
    refreshData,
    addExercise,
    updateExercise,
    deleteExercise,
    addDietPlan,
    updateDietPlan,
    deleteDietPlan,
    assignDietPlanToClients,
    assignExerciseToClients
  };
};