import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  client_id: string;
  doctor_id: string;
  schedule_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAppointments = (userId?: string, role?: string) => {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (doctorId?: string) => {
    try {
      let query = supabase.from('doctor_schedules').select('*');
      
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }
      
      const { data, error: fetchError } = await query.order('day_of_week');
      
      if (fetchError) throw fetchError;
      setSchedules(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (fetchError) throw fetchError;
      setAppointments(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const refreshData = useCallback(async (doctorId?: string) => {
    setLoading(true);
    await Promise.all([fetchSchedules(doctorId), fetchAppointments()]);
    setLoading(false);
  }, [fetchSchedules, fetchAppointments]);

  useEffect(() => {
    if (userId) {
      if (role === 'doctor') {
        refreshData(userId);
      } else {
        refreshData();
      }
    }
  }, [userId, role, refreshData]);

  // Schedule management (for doctors)
  const addSchedule = async (schedule: Omit<DoctorSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('doctor_schedules').insert(schedule);
      if (error) throw error;
      await fetchSchedules(schedule.doctor_id);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateSchedule = async (id: string, updates: Partial<DoctorSchedule>) => {
    try {
      const { error } = await supabase
        .from('doctor_schedules')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      await fetchSchedules(userId);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchSchedules(userId);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Appointment management
  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      
      if (error) throw error;

      // Send notification to doctor
      if (data) {
        await supabase.from('notifications').insert({
          user_id: appointment.doctor_id,
          title: 'حجز موعد جديد',
          message: `لديك طلب حجز موعد جديد بتاريخ ${appointment.appointment_date} من ${appointment.start_time} إلى ${appointment.end_time}`,
          type: 'appointment',
          related_id: data.id
        });
      }

      await fetchAppointments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      await fetchAppointments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const cancelAppointment = async (id: string) => {
    return updateAppointment(id, { status: 'cancelled' });
  };

  const confirmAppointment = async (id: string, clientId?: string) => {
    const result = await updateAppointment(id, { status: 'confirmed' });
    
    // Send notification to client
    if (!result.error && clientId) {
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'تأكيد الموعد',
        message: 'تم تأكيد موعدك من قبل الطبيب',
        type: 'appointment',
        related_id: id
      });
    }
    
    return result;
  };

  const completeAppointment = async (id: string) => {
    return updateAppointment(id, { status: 'completed' });
  };

  const rejectAppointment = async (id: string, clientId?: string) => {
    const result = await updateAppointment(id, { status: 'cancelled' });
    
    // Send notification to client
    if (!result.error && clientId) {
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'رفض الموعد',
        message: 'تم رفض موعدك من قبل الطبيب. يرجى اختيار موعد آخر.',
        type: 'appointment',
        related_id: id
      });
    }
    
    return result;
  };

  // Helper functions
  const getDayName = (dayIndex: number, lang: string = 'ar') => {
    const days = {
      ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    return days[lang as keyof typeof days][dayIndex];
  };

  const getAvailableSlots = (doctorId: string, date: Date) => {
    const dayOfWeek = date.getDay();
    return schedules.filter(
      s => s.doctor_id === doctorId && s.day_of_week === dayOfWeek && s.is_available
    );
  };

  return {
    schedules,
    appointments,
    loading,
    error,
    refreshData,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    rejectAppointment,
    completeAppointment,
    getDayName,
    getAvailableSlots
  };
};
