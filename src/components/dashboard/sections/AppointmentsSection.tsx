import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CalendarCheck } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClientData } from '@/hooks/useClientData';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AppointmentsSectionProps {
  isRTL: boolean;
  clientId: string;
  schedules: DoctorSchedule[];
  appointments: any[];
  users: { user_id: string; full_name: string }[];
  onBook: (appointment: any) => Promise<{ error: Error | null }>;
  onCancel: (id: string) => Promise<{ error: Error | null }>;
  getDayName: (day: number, lang?: string) => string;
}

export const AppointmentsSection = ({
  isRTL,
  clientId,
  schedules,
  appointments,
  users,
  onBook,
  onCancel,
  getDayName
}: AppointmentsSectionProps) => {
  const { language } = useLanguage();
  const { assignedDoctor } = useClientData(clientId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSchedule | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter schedules for assigned doctor only
  const doctorSchedules = schedules.filter(
    s => assignedDoctor && s.doctor_id === assignedDoctor.user_id && s.is_available
  );

  // Get available days for the doctor
  const availableDays = doctorSchedules.map(s => s.day_of_week);

  // Filter available slots for selected date
  const availableSlots = selectedDate
    ? doctorSchedules.filter(s => s.day_of_week === selectedDate.getDay())
    : [];

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !availableDays.includes(date.getDay()) || date < today;
  };

  const formatTime = (time: string) => {
    return time; // Keep as HH:MM:SS format as shown in reference
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !assignedDoctor) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'اختر التاريخ والموعد' : 'Select date and time slot',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await onBook({
      client_id: clientId,
      doctor_id: assignedDoctor.user_id,
      schedule_id: selectedSlot.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      status: 'pending',
      notes: null
    });

    setLoading(false);

    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم الحجز' : 'Booked',
        description: isRTL ? 'تم حجز الموعد بنجاح وبانتظار التأكيد' : 'Appointment booked successfully, pending confirmation'
      });
      setSelectedDate(undefined);
      setSelectedSlot(null);
    }
  };

  // Reset slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse text-right")}>
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? 'المواعيد' : 'Appointments'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? 'اختر تاريخاً ثم احجز من المواعيد المتاحة' 
              : 'Select a date and book from available appointments'}
          </p>
        </div>
      </div>

      {/* No Doctor Assigned */}
      {!assignedDoctor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-card border border-border text-center"
        >
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isRTL ? 'لم يتم تعيين طبيب لك بعد' : 'No doctor assigned yet'}
          </h3>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'يرجى الانتظار حتى يتم تعيين طبيب لك' 
              : 'Please wait until a doctor is assigned to you'}
          </p>
        </motion.div>
      )}

      {/* Booking Section */}
      {assignedDoctor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Calendar Section */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className={cn(
              "text-lg font-bold mb-4 flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <CalendarCheck className="h-5 w-5 text-primary" />
              {isRTL ? 'اختر التاريخ' : 'Select Date'}
            </h3>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              className="rounded-md border-0 w-full pointer-events-auto"
              locale={isRTL ? ar : enUS}
            />
          </div>

          {/* Available Slots Section */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className={cn(
              "text-lg font-bold mb-2 flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <Clock className="h-5 w-5 text-primary" />
              {isRTL ? 'المواعيد المتاحة' : 'Available Slots'}
            </h3>
            <p className={cn(
              "text-sm text-muted-foreground mb-4",
              isRTL && "text-right"
            )}>
              {assignedDoctor.full_name} - {selectedDate 
                ? getDayName(selectedDate.getDay(), language) 
                : (isRTL ? 'اختر تاريخاً' : 'Select a date')}
            </p>

            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'اختر تاريخاً لعرض المواعيد المتاحة' : 'Select a date to view available slots'}
                </p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد مواعيد متاحة في هذا اليوم' : 'No available slots on this day'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      selectedSlot?.id === slot.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-background"
                    )}
                  >
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isRTL ? 'اضغط للحجز' : 'Click to book'}
                    </span>
                  </button>
                ))}

                {/* Book Button */}
                {selectedSlot && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleBook}
                    disabled={loading}
                  >
                    {loading 
                      ? (isRTL ? 'جاري الحجز...' : 'Booking...') 
                      : (isRTL ? 'تأكيد الحجز' : 'Confirm Booking')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* My Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className={cn(
          "text-lg font-bold mb-4 flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <CalendarCheck className="h-5 w-5 text-primary" />
          {isRTL ? 'مواعيدي المحجوزة' : 'My Booked Appointments'}
        </h3>
        <AppointmentsList
          appointments={appointments}
          users={users}
          role="client"
          onCancel={onCancel}
        />
      </motion.div>
    </div>
  );
};
