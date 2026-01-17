import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      setDietPlans(data || []);
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
      const { error } = await supabase.from('diet_plans').insert(plan);
      if (error) throw error;
      await fetchDietPlans();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateDietPlan = async (id: string, updates: Partial<DietPlan>) => {
    try {
      const { error } = await supabase.from('diet_plans').update(updates).eq('id', id);
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
    deleteDietPlan
  };
};