import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Appointment {
  id: string;
  doctor_id: string;
  client_id: string;
  schedule_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
}

interface AppointmentsSectionProps {
  appointments: Appointment[];
  doctors: UserWithRole[];
  clients: UserWithRole[];
  onConfirm: (id: string) => Promise<{ error: Error | null }>;
  onCancel: (id: string) => Promise<{ error: Error | null }>;
  onComplete: (id: string) => Promise<{ error: Error | null }>;
}

export const AppointmentsSection = ({
  appointments,
  doctors,
  clients,
  onConfirm,
  onCancel,
  onComplete
}: AppointmentsSectionProps) => {
  const { isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.user_id === doctorId);
    return doctor?.full_name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.user_id === clientId);
    return client?.full_name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-green-500/20 text-green-500',
      completed: 'bg-primary/20 text-primary',
      cancelled: 'bg-red-500/20 text-red-500'
    };
    const labels: Record<string, string> = {
      pending: isRTL ? 'قيد الانتظار' : 'Pending',
      confirmed: isRTL ? 'مؤكد' : 'Confirmed',
      completed: isRTL ? 'مكتمل' : 'Completed',
      cancelled: isRTL ? 'ملغي' : 'Cancelled'
    };
    return (
      <Badge className={`${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleConfirm = async (id: string) => {
    const { error } = await onConfirm(id);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error');
    } else {
      toast.success(isRTL ? 'تم تأكيد الموعد' : 'Appointment confirmed');
    }
  };

  const handleCancel = async (id: string) => {
    const { error } = await onCancel(id);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error');
    } else {
      toast.success(isRTL ? 'تم إلغاء الموعد' : 'Appointment cancelled');
    }
  };

  const handleComplete = async (id: string) => {
    const { error } = await onComplete(id);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error');
    } else {
      toast.success(isRTL ? 'تم إكمال الموعد' : 'Appointment completed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة المواعيد' : 'Manage Appointments'}</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
            <SelectItem value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</SelectItem>
            <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
            <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد مواعيد' : 'No appointments found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Appointment Info */}
                    <div className={`flex items-center gap-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Date & Time */}
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {format(new Date(apt.appointment_date), 'd MMMM yyyy', { 
                            locale: isRTL ? ar : enUS 
                          })}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {apt.start_time} - {apt.end_time}
                        </span>
                      </div>

                      {/* Client & Doctor */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'العميل:' : 'Client:'}</span>{' '}
                        <span className="font-medium">{getClientName(apt.client_id)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'الطبيب:' : 'Doctor:'}</span>{' '}
                        <span className="font-medium">{getDoctorName(apt.doctor_id)}</span>
                      </div>

                      {/* Status */}
                      {getStatusBadge(apt.status)}
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {apt.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30"
                            onClick={() => handleConfirm(apt.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            {isRTL ? 'تأكيد' : 'Confirm'}
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30"
                            onClick={() => handleCancel(apt.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </Button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleComplete(apt.id)}
                        >
                          <Check className="h-4 w-4" />
                          {isRTL ? 'إكمال' : 'Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
