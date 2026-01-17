import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Exercise {
  id: string;
  doctor_id: string;
  name: string;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  level: string | null;
  gender: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Muscle {
  id: string;
  doctor_id: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  doctor_id: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface DietPlan {
  id: string;
  doctor_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  calories_min: number | null;
  calories_max: number | null;
  duration_days: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminExercisesData = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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

  const fetchMuscles = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('muscles')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setMuscles(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const fetchEquipment = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setEquipment(data || []);
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
    await Promise.all([fetchExercises(), fetchMuscles(), fetchEquipment(), fetchDietPlans()]);
    setLoading(false);
  }, [fetchExercises, fetchMuscles, fetchEquipment, fetchDietPlans]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Exercise CRUD
  const addExercise = async (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => {
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

  // Muscle CRUD
  const addMuscle = async (muscle: Omit<Muscle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('muscles').insert(muscle);
      if (error) throw error;
      await fetchMuscles();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateMuscle = async (id: string, updates: Partial<Muscle>) => {
    try {
      const { error } = await supabase.from('muscles').update(updates).eq('id', id);
      if (error) throw error;
      await fetchMuscles();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteMuscle = async (id: string) => {
    try {
      const { error } = await supabase.from('muscles').delete().eq('id', id);
      if (error) throw error;
      await fetchMuscles();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Equipment CRUD
  const addEquipment = async (equip: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('equipment').insert(equip);
      if (error) throw error;
      await fetchEquipment();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const { error } = await supabase.from('equipment').update(updates).eq('id', id);
      if (error) throw error;
      await fetchEquipment();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
      await fetchEquipment();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Diet Plan CRUD
  const addDietPlan = async (plan: Omit<DietPlan, 'id' | 'created_at' | 'updated_at'>) => {
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
    muscles,
    equipment,
    dietPlans,
    loading,
    error,
    refreshData,
    addExercise,
    updateExercise,
    deleteExercise,
    addMuscle,
    updateMuscle,
    deleteMuscle,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addDietPlan,
    updateDietPlan,
    deleteDietPlan
  };
};
