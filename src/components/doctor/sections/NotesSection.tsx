import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { DoctorNote } from '@/hooks/useDoctorData';
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

interface NotesSectionProps {
  notes: DoctorNote[];
  clients: ClientAssignment[];
  doctorId: string;
  onAdd: (note: Omit<DoctorNote, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<DoctorNote>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

export const NotesSection = ({
  notes,
  clients,
  doctorId,
  onAdd,
  onUpdate,
  onDelete
}: NotesSectionProps) => {
  const { isRTL } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DoctorNote | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    content: ''
  });

  const resetForm = () => {
    setFormData({ client_id: '', content: '' });
    setEditingNote(null);
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.content) {
      toast.error(isRTL ? 'يرجى اختيار العميل وكتابة الملاحظة' : 'Please select client and write note');
      return;
    }

    const noteData = {
      doctor_id: doctorId,
      client_id: formData.client_id,
      content: formData.content
    };

    let result;
    if (editingNote) {
      result = await onUpdate(editingNote.id, { content: formData.content });
    } else {
      result = await onAdd(noteData);
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingNote ? 'تم تحديث الملاحظة' : 'تم إضافة الملاحظة') : (editingNote ? 'Note updated' : 'Note added'));
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (note: DoctorNote) => {
    setFormData({
      client_id: note.client_id,
      content: note.content
    });
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? 'تم حذف الملاحظة' : 'Note deleted');
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown');
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMMM yyyy - HH:mm', { locale: isRTL ? ar : enUS });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? (isRTL ? 'تعديل الملاحظة' : 'Edit Note') : (isRTL ? 'إضافة ملاحظة جديدة' : 'Add New Note')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{isRTL ? 'العميل' : 'Client'}</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(v) => setFormData({ ...formData, client_id: v })}
                  disabled={!!editingNote}
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
                <Label>{isRTL ? 'الملاحظة' : 'Note'}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={isRTL ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                  rows={5}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingNote ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <h1 className="text-2xl font-bold">{isRTL ? 'الملاحظات' : 'Notes'}</h1>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">
            {isRTL ? 'لا توجد ملاحظات' : 'No notes yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-2xl border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="font-bold">{getClientName(note.client_id)}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-right text-muted-foreground">{note.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
