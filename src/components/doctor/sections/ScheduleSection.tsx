import { DoctorScheduleManager } from '@/components/appointments/DoctorScheduleManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock } from 'lucide-react';

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleSectionProps {
  doctorId: string;
  schedules: DoctorSchedule[];
  onAdd: (schedule: Omit<DoctorSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<DoctorSchedule>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  getDayName: (day: number, lang: string) => string;
}

export const ScheduleSection = ({
  doctorId,
  schedules,
  onAdd,
  onUpdate,
  onDelete,
  getDayName
}: ScheduleSectionProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-3">
          {isRTL ? 'جدول المواعيد' : 'Schedule Management'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إدارة أوقات العمل المتاحة للحجز' : 'Manage your available time slots for booking'}
        </p>
      </div>
      
      <DoctorScheduleManager
        doctorId={doctorId}
        schedules={schedules}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        getDayName={getDayName}
      />
    </div>
  );
};
