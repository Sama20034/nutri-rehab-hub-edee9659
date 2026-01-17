import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Edit, Trash2, AlertTriangle, Lightbulb, 
  ClipboardList, Search, Filter, User, Calendar, ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';

interface MedicalNote {
  id: string;
  client_id: string;
  doctor_id: string;
  title: string;
  content: string | null;
  type: string;
  severity: string | null;
  is_read: boolean;
  created_at: string;
  client?: {
    full_name: string | null;
  };
}

interface ClientProfile {
  user_id: string;
  full_name: string;
}

interface ClientAssignment {
  client_id: string;
  client?: ClientProfile;
}

interface NotesSectionProps {
  notes: MedicalNote[];
  clients: ClientAssignment[];
  doctorId: string;
  onAdd: (note: { client_id: string; title: string; content?: string; type: string; severity?: string }) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<MedicalNote>) => Promise<{ error: Error | null }>;
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const [newNote, setNewNote] = useState({
    client_id: '',
    title: '',
    content: '',
    type: 'advice',
    severity: 'normal'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'advice': return <Lightbulb className="h-4 w-4" />;
      case 'followup': return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'advice': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'followup': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'urgent': return 'bg-red-500/10 text-red-500';
      case 'important': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-green-500/10 text-green-500';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || note.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddNote = async () => {
    if (!newNote.client_id || !newNote.title) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await onAdd(newNote);
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إضافة الملاحظة' : 'Note added successfully'
      });
      setIsAddOpen(false);
      setNewNote({ client_id: '', title: '', content: '', type: 'advice', severity: 'normal' });
    }
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await onDelete(id);
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم حذف الملاحظة' : 'Note deleted'
      });
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const uniqueClients = clients.filter(c => c.client).map(c => c.client!);

  const stats = {
    total: notes.length,
    warnings: notes.filter(n => n.type === 'warning').length,
    advice: notes.filter(n => n.type === 'advice').length,
    followups: notes.filter(n => n.type === 'followup').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold">{isRTL ? 'الملاحظات الطبية' : 'Medical Notes'}</h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إدارة الملاحظات والتنبيهات للعملاء' : 'Manage notes and alerts for clients'}
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'إضافة ملاحظة جديدة' : 'Add New Note'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>{isRTL ? 'العميل' : 'Client'} *</Label>
                <Select
                  value={newNote.client_id}
                  onValueChange={(value) => setNewNote({ ...newNote, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر العميل' : 'Select client'} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'النوع' : 'Type'}</Label>
                <Select
                  value={newNote.type}
                  onValueChange={(value) => setNewNote({ ...newNote, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advice">{isRTL ? 'نصيحة' : 'Advice'}</SelectItem>
                    <SelectItem value="warning">{isRTL ? 'تحذير' : 'Warning'}</SelectItem>
                    <SelectItem value="followup">{isRTL ? 'متابعة' : 'Follow-up'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'الأهمية' : 'Severity'}</Label>
                <Select
                  value={newNote.severity}
                  onValueChange={(value) => setNewNote({ ...newNote, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{isRTL ? 'عادي' : 'Normal'}</SelectItem>
                    <SelectItem value="important">{isRTL ? 'مهم' : 'Important'}</SelectItem>
                    <SelectItem value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'العنوان' : 'Title'} *</Label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder={isRTL ? 'عنوان الملاحظة' : 'Note title'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'المحتوى' : 'Content'}</Label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder={isRTL ? 'تفاصيل الملاحظة...' : 'Note details...'}
                  rows={4}
                />
              </div>
            </div>
            <Button onClick={handleAddNote} className="w-full">
              {isRTL ? 'إضافة الملاحظة' : 'Add Note'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الملاحظات' : 'Total Notes'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.warnings}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'تحذيرات' : 'Warnings'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Lightbulb className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.advice}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'نصائح' : 'Advice'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <ClipboardList className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.followups}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'متابعات' : 'Follow-ups'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className={`flex flex-wrap items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="advice">{isRTL ? 'نصائح' : 'Advice'}</SelectItem>
                <SelectItem value="warning">{isRTL ? 'تحذيرات' : 'Warnings'}</SelectItem>
                <SelectItem value="followup">{isRTL ? 'متابعات' : 'Follow-ups'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد ملاحظات' : 'No notes found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-card border-border hover:border-primary/30 transition-all ${note.severity === 'urgent' ? 'border-red-500/50' : ''}`}>
                <Collapsible open={expandedNotes.has(note.id)} onOpenChange={() => toggleExpanded(note.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-xl ${getTypeColor(note.type)}`}>
                          {getTypeIcon(note.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{note.title}</h3>
                            <Badge variant="outline" className={getSeverityColor(note.severity)}>
                              {note.severity === 'urgent' ? (isRTL ? 'عاجل' : 'Urgent') :
                               note.severity === 'important' ? (isRTL ? 'مهم' : 'Important') :
                               (isRTL ? 'عادي' : 'Normal')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {note.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(note.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedNotes.has(note.id) ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent className="mt-4">
                      {note.content && (
                        <div className="p-4 rounded-xl bg-muted/50">
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
