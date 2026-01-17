import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FileText, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { TreatmentProgram } from '@/hooks/useDoctorData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface ClientProfile {
  user_id: string;
  full_name: string;
}

interface ClientAssignment {
  client_id: string;
  client?: ClientProfile;
}

interface ProgramsSectionProps {
  programs: TreatmentProgram[];
  clients: ClientAssignment[];
  doctorId: string;
  onAdd: (program: Omit<TreatmentProgram, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<TreatmentProgram>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const statuses = ['active', 'completed', 'paused'];

export const ProgramsSection = ({
  programs,
  clients,
  doctorId,
  onAdd,
  onUpdate,
  onDelete
}: ProgramsSectionProps) => {
  const { isRTL } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TreatmentProgram | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      client_id: '',
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
    setEditingProgram(null);
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.name) {
      toast.error(isRTL ? 'يرجى اختيار العميل وإدخال اسم البرنامج' : 'Please select client and enter program name');
      return;
    }

    const programData = {
      doctor_id: doctorId,
      client_id: formData.client_id,
      name: formData.name,
      description: formData.description || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status
    };

    let result;
    if (editingProgram) {
      result = await onUpdate(editingProgram.id, programData);
    } else {
      result = await onAdd(programData);
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingProgram ? 'تم تحديث البرنامج' : 'تم إضافة البرنامج') : (editingProgram ? 'Program updated' : 'Program added'));
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (program: TreatmentProgram) => {
    setFormData({
      client_id: program.client_id,
      name: program.name,
      description: program.description || '',
      start_date: program.start_date || '',
      end_date: program.end_date || '',
      status: program.status || 'active'
    });
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? 'تم حذف البرنامج' : 'Program deleted');
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">{isRTL ? 'نشط' : 'Active'}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'paused':
        return <Badge variant="secondary">{isRTL ? 'متوقف' : 'Paused'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: isRTL ? ar : enUS });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إنشاء برنامج جديد' : 'Create New Program'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? (isRTL ? 'تعديل البرنامج' : 'Edit Program') : (isRTL ? 'إنشاء برنامج علاجي' : 'Create Treatment Program')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{isRTL ? 'العميل' : 'Client'}</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(v) => setFormData({ ...formData, client_id: v })}
                  disabled={!!editingProgram}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر العميل' : 'Select client'} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.client_id} value={c.client_id}>
                        {c.client?.full_name || c.client_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'اسم البرنامج' : 'Program Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: برنامج تأهيل الركبة' : 'e.g., Knee Rehabilitation Program'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'تاريخ النهاية' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                    <SelectItem value="paused">{isRTL ? 'متوقف' : 'Paused'}</SelectItem>
                    <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isRTL ? 'وصف البرنامج...' : 'Program description...'}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingProgram ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <h1 className="text-2xl font-bold">{isRTL ? 'البرامج العلاجية' : 'Treatment Programs'}</h1>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">
            {isRTL ? 'لا توجد برامج علاجية' : 'No treatment programs yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-2xl border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(program.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(program)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <h3 className="font-bold text-lg">{program.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{getClientName(program.client_id)}</span>
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                  {getStatusBadge(program.status)}
                </div>
              </div>
              
              {program.description && (
                <p className="mt-3 text-right text-muted-foreground">{program.description}</p>
              )}
              
              <div className="flex items-center justify-end gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {formatDate(program.start_date)} - {formatDate(program.end_date)}
                  <Calendar className="h-4 w-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
