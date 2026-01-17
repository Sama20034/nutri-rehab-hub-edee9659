import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  status: string;
  role?: string;
}

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface SchedulesSectionProps {
  doctors: UserWithRole[];
}

export const SchedulesSection = ({ doctors }: SchedulesSectionProps) => {
  const { isRTL } = useLanguage();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const approvedDoctors = doctors.filter(d => d.status === 'approved');

  const getDayName = (day: number) => {
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return isRTL ? daysAr[day] : daysEn[day];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSchedules(selectedDoctorId);
    } else {
      setSchedules([]);
    }
  }, [selectedDoctorId]);

  const fetchSchedules = async (doctorId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          {isRTL ? 'جداول الأطباء' : 'Doctor Schedules'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'عرض جداول عمل الأطباء ومواعيدهم المتاحة' : 'View doctor work schedules and available times'}
        </p>
      </div>

      {/* Doctor Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            {isRTL ? 'اختر طبيب' : 'Select Doctor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isRTL ? 'اختر طبيب لعرض جدوله' : 'Select a doctor to view schedule'} />
            </SelectTrigger>
            <SelectContent>
              {approvedDoctors.map((doctor) => (
                <SelectItem key={doctor.user_id} value={doctor.user_id}>
                  {doctor.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Schedule Display */}
      {selectedDoctorId && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              {isRTL ? 'الجدول الأسبوعي' : 'Weekly Schedule'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{isRTL ? 'لا يوجد جدول محدد لهذا الطبيب' : 'No schedule set for this doctor'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {isRTL ? 'اليوم' : 'Day'}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {isRTL ? 'الوقت' : 'Time'}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {getDayName(schedule.day_of_week)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={schedule.is_available} 
                            disabled
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className={schedule.is_available ? 'text-primary' : 'text-muted-foreground'}>
                            {schedule.is_available 
                              ? (isRTL ? 'متاح' : 'Available') 
                              : (isRTL ? 'غير متاح' : 'Unavailable')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
