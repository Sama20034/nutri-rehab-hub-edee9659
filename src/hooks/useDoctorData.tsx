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

export interface DietPlan {
  id: string;
  doctor_id: string;
  name: string;
  goal: string | null;
  calories_min: number | null;
  calories_max: number | null;
  duration_days: number | null;
  status: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  doctor_id: string;
  title: string;
  youtube_url: string;
  category: string | null;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreatmentProgram {
  id: string;
  doctor_id: string;
  client_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorNote {
  id: string;
  doctor_id: string;
  client_id: string;
  content: string;
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

export const useDoctorData = (doctorId?: string) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [programs, setPrograms] = useState<TreatmentProgram[]>([]);
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('doctor_id', doctorId)
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
        .eq('doctor_id', doctorId)
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
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchPrograms = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('treatment_programs')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPrograms(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchNotes = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('doctor_notes')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchMuscles = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('muscles')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMuscles(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const fetchEquipment = useCallback(async () => {
    if (!doctorId) return;
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEquipment(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [doctorId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchExercises(),
      fetchDietPlans(),
      fetchVideos(),
      fetchPrograms(),
      fetchNotes(),
      fetchMuscles(),
      fetchEquipment()
    ]);
    setLoading(false);
  }, [fetchExercises, fetchDietPlans, fetchVideos, fetchPrograms, fetchNotes, fetchMuscles, fetchEquipment]);

  useEffect(() => {
    if (doctorId) {
      refreshAll();
    }
  }, [doctorId, refreshAll]);

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

  // Video CRUD
  const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
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

  // Program CRUD
  const addProgram = async (program: Omit<TreatmentProgram, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('treatment_programs').insert(program);
      if (error) throw error;
      await fetchPrograms();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateProgram = async (id: string, updates: Partial<TreatmentProgram>) => {
    try {
      const { error } = await supabase.from('treatment_programs').update(updates).eq('id', id);
      if (error) throw error;
      await fetchPrograms();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase.from('treatment_programs').delete().eq('id', id);
      if (error) throw error;
      await fetchPrograms();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Notes CRUD
  const addNote = async (note: Omit<DoctorNote, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('doctor_notes').insert(note);
      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateNote = async (id: string, updates: Partial<DoctorNote>) => {
    try {
      const { error } = await supabase.from('doctor_notes').update(updates).eq('id', id);
      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('doctor_notes').delete().eq('id', id);
      if (error) throw error;
      await fetchNotes();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Muscles CRUD
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

  return {
    exercises,
    dietPlans,
    videos,
    programs,
    notes,
    muscles,
    equipment,
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
    deleteVideo,
    // Programs
    addProgram,
    updateProgram,
    deleteProgram,
    // Notes
    addNote,
    updateNote,
    deleteNote,
    // Muscles
    addMuscle,
    updateMuscle,
    deleteMuscle,
    // Equipment
    addEquipment,
    updateEquipment,
    deleteEquipment
  };
};
