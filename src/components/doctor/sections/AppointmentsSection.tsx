import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Appointment {
  id: string;
  client_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

interface ClientProfile {
  user_id: string;
  full_name: string;
}

interface AppointmentsSectionProps {
  appointments: Appointment[];
  clients: { client_id: string; client?: ClientProfile }[];
  onConfirm: (id: string, clientId?: string) => Promise<{ error: Error | null }>;
  onCancel: (id: string) => Promise<{ error: Error | null }>;
  onReject: (id: string, clientId?: string) => Promise<{ error: Error | null }>;
  onComplete: (id: string) => Promise<{ error: Error | null }>;
}

export const AppointmentsSection = ({
  appointments,
  clients,
  onConfirm,
  onCancel,
  onReject,
  onComplete
}: AppointmentsSectionProps) => {
  const { isRTL } = useLanguage();

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const allAppointments = appointments.filter(a => a.status !== 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{isRTL ? 'معلق' : 'Pending'}</Badge>;
      case 'confirmed':
        return <Badge className="bg-primary">{isRTL ? 'مؤكد' : 'Confirmed'}</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy', { locale: isRTL ? ar : enUS });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm', { locale: isRTL ? ar : enUS });
  };

  const AppointmentCard = ({ appointment, showActions }: { appointment: Appointment; showActions: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
      <div className="flex items-center gap-4">
        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onConfirm(appointment.id, appointment.client_id)}
              className="bg-green-500 hover:bg-green-600 gap-1"
            >
              <Check className="h-4 w-4" />
              {isRTL ? 'تأكيد' : 'Confirm'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(appointment.id, appointment.client_id)}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              {isRTL ? 'رفض' : 'Reject'}
            </Button>
          </div>
        )}
        {!showActions && getStatusBadge(appointment.status || 'pending')}
      </div>
      <div className="flex items-center gap-6 text-right">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatTime(appointment.scheduled_at)}</span>
          {appointment.duration_minutes && <span>({appointment.duration_minutes} {isRTL ? 'دقيقة' : 'min'})</span>}
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatDate(appointment.scheduled_at)}</span>
          <Calendar className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{getClientName(appointment.client_id)}</span>
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRTL ? 'الحجوزات' : 'Appointments'}</h1>
      </div>

      {/* Pending Appointments */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {pendingAppointments.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {pendingAppointments.length}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isRTL ? 'الحجوزات المعلقة' : 'Pending Appointments'}
          </h2>
        </div>

        {pendingAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {isRTL ? 'لا توجد حجوزات معلقة' : 'No pending appointments'}
          </p>
        ) : (
          <div className="space-y-3">
            {pendingAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AppointmentCard appointment={appointment} showActions={true} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* All Appointments */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 justify-end">
          <Calendar className="h-5 w-5" />
          {isRTL ? 'جميع الحجوزات' : 'All Appointments'}
        </h2>

        {allAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {isRTL ? 'لا توجد حجوزات' : 'No appointments'}
          </p>
        ) : (
          <div className="space-y-3">
            {allAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AppointmentCard appointment={appointment} showActions={false} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
