import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Props {
  doctorId: string;
  schedules: DoctorSchedule[];
  onAdd: (schedule: Omit<DoctorSchedule, 'id'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<DoctorSchedule>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
  getDayName: (day: number, lang: string) => string;
}

export const DoctorScheduleManager = ({ doctorId, schedules, onAdd, onUpdate, onDelete, getDayName }: Props) => {
  const { language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00'
  });

  const handleAdd = async () => {
    if (newSchedule.start_time >= newSchedule.end_time) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'وقت البداية يجب أن يكون قبل وقت النهاية' : 'Start time must be before end time',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await onAdd({
      doctor_id: doctorId,
      day_of_week: newSchedule.day_of_week,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      is_available: true
    });

    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تمت الإضافة' : 'Added',
        description: language === 'ar' ? 'تم إضافة الموعد بنجاح' : 'Schedule added successfully'
      });
      setDialogOpen(false);
      setNewSchedule({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
    }
  };

  const handleToggleAvailability = async (schedule: DoctorSchedule) => {
    const { error } = await onUpdate(schedule.id, { is_available: !schedule.is_available });
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الموعد بنجاح' : 'Schedule deleted successfully'
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const days = [0, 1, 2, 3, 4, 5, 6];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {language === 'ar' ? 'جدول المواعيد' : 'Schedule'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إدارة أوقات العمل المتاحة' : 'Manage available working hours'}
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إضافة موعد' : 'Add Schedule'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {language === 'ar' ? 'لا توجد مواعيد محددة. أضف مواعيدك المتاحة.' : 'No schedules set. Add your available times.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'اليوم' : 'Day'}</TableHead>
                <TableHead>{language === 'ar' ? 'من' : 'From'}</TableHead>
                <TableHead>{language === 'ar' ? 'إلى' : 'To'}</TableHead>
                <TableHead>{language === 'ar' ? 'متاح' : 'Available'}</TableHead>
                <TableHead>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map(schedule => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{getDayName(schedule.day_of_week, language)}</TableCell>
                  <TableCell>{formatTime(schedule.start_time)}</TableCell>
                  <TableCell>{formatTime(schedule.end_time)}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={schedule.is_available} 
                      onCheckedChange={() => handleToggleAvailability(schedule)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'إضافة موعد جديد' : 'Add New Schedule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{language === 'ar' ? 'اليوم' : 'Day'}</label>
              <Select 
                value={newSchedule.day_of_week.toString()} 
                onValueChange={(v) => setNewSchedule(prev => ({ ...prev, day_of_week: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {getDayName(day, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{language === 'ar' ? 'من' : 'From'}</label>
                <Input 
                  type="time" 
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{language === 'ar' ? 'إلى' : 'To'}</label>
                <Input 
                  type="time" 
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAdd}>
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
