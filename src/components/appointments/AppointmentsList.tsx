import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  client_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

interface UserInfo {
  user_id: string;
  full_name: string;
}

interface Props {
  appointments: Appointment[];
  users: UserInfo[];
  role: 'client' | 'doctor' | 'admin';
  onConfirm?: (id: string) => Promise<{ error: Error | null }>;
  onCancel?: (id: string) => Promise<{ error: Error | null }>;
  onComplete?: (id: string) => Promise<{ error: Error | null }>;
}

export const AppointmentsList = ({ appointments, users, role, onConfirm, onCancel, onComplete }: Props) => {
  const { language } = useLanguage();

  const getUserName = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || (language === 'ar' ? 'غير معروف' : 'Unknown');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: language === 'ar' ? 'بانتظار التأكيد' : 'Pending', 
        variant: 'secondary' as const,
        icon: AlertCircle
      },
      confirmed: { 
        label: language === 'ar' ? 'مؤكد' : 'Confirmed', 
        variant: 'default' as const,
        icon: CheckCircle
      },
      cancelled: { 
        label: language === 'ar' ? 'ملغي' : 'Cancelled', 
        variant: 'destructive' as const,
        icon: XCircle
      },
      completed: { 
        label: language === 'ar' ? 'مكتمل' : 'Completed', 
        variant: 'outline' as const,
        icon: CheckCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleAction = async (action: () => Promise<{ error: Error | null }>, successMessage: string) => {
    const { error } = await action();
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم' : 'Done',
        description: successMessage
      });
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {language === 'ar' ? 'المواعيد' : 'Appointments'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? `${appointments.length} موعد`
            : `${appointments.length} appointment(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {language === 'ar' ? 'لا توجد مواعيد' : 'No appointments'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'الوقت' : 'Time'}</TableHead>
                {role !== 'client' && <TableHead>{language === 'ar' ? 'العميل' : 'Client'}</TableHead>}
                {role !== 'doctor' && <TableHead>{language === 'ar' ? 'الطبيب' : 'Doctor'}</TableHead>}
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAppointments.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {new Date(appointment.appointment_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </TableCell>
                  {role !== 'client' && (
                    <TableCell>{getUserName(appointment.client_id)}</TableCell>
                  )}
                  {role !== 'doctor' && (
                    <TableCell>{getUserName(appointment.doctor_id)}</TableCell>
                  )}
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {(role === 'doctor' || role === 'admin') && appointment.status === 'pending' && onConfirm && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(() => onConfirm(appointment.id), language === 'ar' ? 'تم تأكيد الموعد' : 'Appointment confirmed')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && onCancel && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAction(() => onCancel(appointment.id), language === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {(role === 'doctor' || role === 'admin') && appointment.status === 'confirmed' && onComplete && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(() => onComplete(appointment.id), language === 'ar' ? 'تم إكمال الموعد' : 'Appointment completed')}
                        >
                          {language === 'ar' ? 'إكمال' : 'Complete'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
