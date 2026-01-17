import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DoctorInfo {
  user_id: string;
  full_name: string;
  specialization: string | null;
}

interface Props {
  clientId: string;
  assignedDoctorId?: string;
  schedules: DoctorSchedule[];
  onBook: (appointment: {
    client_id: string;
    doctor_id: string;
    schedule_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
  }) => Promise<{ error: Error | null }>;
  getDayName: (day: number, lang: string) => string;
}

export const AppointmentBooking = ({ clientId, assignedDoctorId, schedules, onBook, getDayName }: Props) => {
  const { language } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
  const [notes, setNotes] = useState('');
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(assignedDoctorId || '');
  const [loading, setLoading] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, specialization')
        .eq('status', 'approved');
      
      // Filter only doctors
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'doctor');
      
      const doctorIds = roles?.map(r => r.user_id) || [];
      const doctorProfiles = data?.filter(p => doctorIds.includes(p.user_id)) || [];
      setDoctors(doctorProfiles);
    };

    fetchDoctors();
  }, []);

  const availableSchedules = date
    ? schedules.filter(s => 
        s.doctor_id === selectedDoctor && 
        s.day_of_week === date.getDay() && 
        s.is_available
      )
    : [];

  const handleBook = async () => {
    if (!date || !selectedSchedule || !selectedDoctor) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'اختر التاريخ والموعد' : 'Select date and time slot',
        variant: 'destructive'
      });
      return;
    }

    if (!agreedToPolicy) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يجب الموافقة على سياسة استخدام الخدمات' : 'You must agree to the service usage policy',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await onBook({
      client_id: clientId,
      doctor_id: selectedDoctor,
      schedule_id: selectedSchedule.id,
      appointment_date: format(date, 'yyyy-MM-dd'),
      start_time: selectedSchedule.start_time,
      end_time: selectedSchedule.end_time,
      status: 'pending',
      notes: notes || null
    });

    setLoading(false);

    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم الحجز' : 'Booked',
        description: language === 'ar' ? 'تم حجز الموعد بنجاح وبانتظار التأكيد' : 'Appointment booked successfully, pending confirmation'
      });
      setDate(undefined);
      setSelectedSchedule(null);
      setNotes('');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDoctorScheduleDays = () => {
    const doctorSchedules = schedules.filter(s => s.doctor_id === selectedDoctor && s.is_available);
    return doctorSchedules.map(s => s.day_of_week);
  };

  const isDateDisabled = (date: Date) => {
    const availableDays = getDoctorScheduleDays();
    return !availableDays.includes(date.getDay()) || date < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {language === 'ar' ? 'حجز موعد جديد' : 'Book New Appointment'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' ? 'اختر الطبيب والتاريخ والوقت المناسب' : 'Select doctor, date and preferred time'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Doctor Selection */}
        <div>
          <label className="text-sm font-medium">{language === 'ar' ? 'الطبيب' : 'Doctor'}</label>
          <Select value={selectedDoctor} onValueChange={(v) => { setSelectedDoctor(v); setSelectedSchedule(null); }}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'ar' ? 'اختر الطبيب' : 'Select doctor'} />
            </SelectTrigger>
            <SelectContent>
              {doctors.map(doctor => (
                <SelectItem key={doctor.user_id} value={doctor.user_id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {doctor.full_name}
                    {doctor.specialization && <span className="text-muted-foreground">({doctor.specialization})</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        {selectedDoctor && (
          <div>
            <label className="text-sm font-medium">{language === 'ar' ? 'التاريخ' : 'Date'}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: language === 'ar' ? ar : enUS }) : (language === 'ar' ? 'اختر التاريخ' : 'Pick a date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setSelectedSchedule(null); }}
                  disabled={isDateDisabled}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Time Slot Selection */}
        {date && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'ar' ? 'الوقت المتاح' : 'Available Time Slots'}
            </label>
            {availableSchedules.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {language === 'ar' ? 'لا توجد مواعيد متاحة في هذا اليوم' : 'No available slots on this day'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSchedules.map(schedule => (
                  <Badge
                    key={schedule.id}
                    variant={selectedSchedule?.id === schedule.id ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {selectedSchedule && (
          <div>
            <label className="text-sm font-medium">{language === 'ar' ? 'ملاحظات' : 'Notes'}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
            />
          </div>
        )}

        {/* Policy Agreement Checkbox */}
        {selectedSchedule && (
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
            <Checkbox
              id="policy-agreement"
              checked={agreedToPolicy}
              onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="policy-agreement" className="text-sm leading-relaxed cursor-pointer">
              {language === 'ar' ? (
                <>
                  أوافق على{' '}
                  <Link to="/service-policy" className="text-primary underline hover:no-underline font-medium">
                    سياسة استخدام الخدمات
                  </Link>
                  {' '}الخاصة بخدمات إعادة التأهيل والتغذية والتدريب عبر الإنترنت
                </>
              ) : (
                <>
                  I agree to the{' '}
                  <Link to="/service-policy" className="text-primary underline hover:no-underline font-medium">
                    Service Usage Policy
                  </Link>
                  {' '}for rehabilitation, nutrition, and online training services
                </>
              )}
            </label>
          </div>
        )}

        {/* Book Button */}
        <Button 
          className="w-full" 
          onClick={handleBook} 
          disabled={!date || !selectedSchedule || !selectedDoctor || loading || !agreedToPolicy}
        >
          {loading 
            ? (language === 'ar' ? 'جاري الحجز...' : 'Booking...') 
            : (language === 'ar' ? 'حجز الموعد' : 'Book Appointment')}
        </Button>
      </CardContent>
    </Card>
  );
};
