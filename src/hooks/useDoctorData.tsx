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
  goal: string | null;
  calories_min: number | null;
  calories_max: number | null;
  duration_weeks: number | null;
  status: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  category: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_by: string | null;
  created_at: string;
}

export const useDoctorData = (doctorId?: string) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('created_by', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchDietPlans = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('created_by', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDietPlans(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchVideos = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('created_by', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchExercises(),
      fetchDietPlans(),
      fetchVideos()
    ]);
    setLoading(false);
  }, [fetchExercises, fetchDietPlans, fetchVideos]);

  useEffect(() => {
    if (doctorId) {
      refreshAll();
    }
  }, [doctorId, refreshAll]);

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

  // Video CRUD
  const addVideo = async (video: Omit<Video, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('videos').insert(video);
      if (error) throw error;
      await fetchVideos();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      await fetchVideos();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    exercises,
    dietPlans,
    videos,
    loading,
    error,
    refreshAll,
    // Exercises
    addExercise,
    updateExercise,
    deleteExercise,
    // Diet Plans
    addDietPlan,
    updateDietPlan,
    deleteDietPlan,
    // Videos
    addVideo,
    deleteVideo
  };
};