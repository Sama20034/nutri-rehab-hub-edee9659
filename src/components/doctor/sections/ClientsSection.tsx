import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, FileText, Dumbbell, Utensils, Heart, TrendingUp, Video, 
  MessageCircle, Search, AlertTriangle, Plus, Weight, Activity, Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  HealthProfileDialog, 
  AssignExercisesDialog, 
  AssignVideosDialog, 
  AssignDietPlanDialog 
} from './ClientActionsDialogs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { Exercise, DietPlan, Video as VideoType } from '@/hooks/useDoctorData';

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string;
  client?: ClientProfile;
}

interface ClientsSectionProps {
  clients: ClientAssignment[];
  exercises: Exercise[];
  videos: VideoType[];
  dietPlans: DietPlan[];
  doctorId: string;
  onViewClient?: (clientId: string) => void;
  onAddNote?: (note: { client_id: string; title: string; content?: string; type: string; severity?: string }) => Promise<{ error: Error | null }>;
  onAddMeasurement?: (measurement: { client_id: string; measurement_type: string; value: number; unit: string; notes?: string }) => Promise<{ error: Error | null }>;
}

export const ClientsSection = ({ 
  clients, 
  exercises, 
  videos, 
  dietPlans, 
  doctorId,
  onViewClient,
  onAddNote,
  onAddMeasurement
}: ClientsSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [healthProfileOpen, setHealthProfileOpen] = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [dietPlanOpen, setDietPlanOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'advice',
    severity: 'normal'
  });

  const [newMeasurement, setNewMeasurement] = useState({
    measurement_type: 'weight',
    value: 0,
    unit: 'kg',
    notes: ''
  });

  const handleAction = (action: string, client: ClientProfile) => {
    setSelectedClient(client);
    switch (action) {
      case 'health':
        setHealthProfileOpen(true);
        break;
      case 'exercises':
        setExercisesOpen(true);
        break;
      case 'videos':
        setVideosOpen(true);
        break;
      case 'diet':
        setDietPlanOpen(true);
        break;
      case 'notes':
        setNoteDialogOpen(true);
        break;
      case 'measurement':
        setMeasurementDialogOpen(true);
        break;
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !onAddNote) return;
    
    const { error } = await onAddNote({
      client_id: selectedClient.user_id,
      ...newNote
    });

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
      setNoteDialogOpen(false);
      setNewNote({ title: '', content: '', type: 'advice', severity: 'normal' });
    }
  };

  const handleAddMeasurement = async () => {
    if (!selectedClient || !onAddMeasurement) return;
    
    const { error } = await onAddMeasurement({
      client_id: selectedClient.user_id,
      ...newMeasurement
    });

    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إضافة القياس' : 'Measurement added successfully'
      });
      setMeasurementDialogOpen(false);
      setNewMeasurement({ measurement_type: 'weight', value: 0, unit: 'kg', notes: '' });
    }
  };

  const filteredClients = clients.filter(assignment =>
    assignment.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.client?.phone?.includes(searchTerm)
  );

  const quickActions = [
    { id: 'exercises', label: isRTL ? 'تمارين' : 'Exercises', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'diet', label: isRTL ? 'نظام غذائي' : 'Diet', icon: Utensils, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'notes', label: isRTL ? 'ملاحظة' : 'Note', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'measurement', label: isRTL ? 'قياس' : 'Measure', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const secondaryActions = [
    { id: 'health', label: isRTL ? 'الملف الصحي' : 'Health Profile', icon: Heart },
    { id: 'videos', label: isRTL ? 'الفيديوهات' : 'Videos', icon: Video },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold">{isRTL ? 'عملائي' : 'My Clients'}</h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إدارة ومتابعة العملاء المسندين إليك' : 'Manage and follow up with assigned clients'}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={isRTL ? 'بحث عن عميل...' : 'Search clients...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'نشطين' : 'Active'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Dumbbell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'التمارين' : 'Exercises'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Utensils className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{dietPlans.length}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'الأنظمة الغذائية' : 'Diet Plans'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">
              {clients.length === 0 
                ? (isRTL ? 'لا يوجد عملاء مسندين حالياً' : 'No clients assigned yet')
                : (isRTL ? 'لا توجد نتائج' : 'No results found')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredClients.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  {/* Client Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {assignment.client?.avatar_url ? (
                          <img src={assignment.client.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {assignment.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown')}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{assignment.client?.phone || (isRTL ? 'لا يوجد رقم' : 'No phone')}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                      {assignment.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="ghost"
                          className={`flex flex-col items-center gap-1 h-auto py-3 ${action.bg} hover:${action.bg}`}
                          onClick={() => assignment.client && handleAction(action.id, assignment.client)}
                        >
                          <Icon className={`h-5 w-5 ${action.color}`} />
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex flex-wrap gap-2">
                    {secondaryActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => assignment.client && handleAction(action.id, assignment.client)}
                        >
                          <Icon className="h-4 w-4" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <HealthProfileDialog 
        open={healthProfileOpen} 
        onClose={() => setHealthProfileOpen(false)} 
        client={selectedClient} 
      />
      
      <AssignExercisesDialog 
        open={exercisesOpen} 
        onClose={() => setExercisesOpen(false)} 
        client={selectedClient}
        exercises={exercises}
        doctorId={doctorId}
      />
      
      <AssignVideosDialog 
        open={videosOpen} 
        onClose={() => setVideosOpen(false)} 
        client={selectedClient}
        videos={videos}
        doctorId={doctorId}
      />
      
      <AssignDietPlanDialog 
        open={dietPlanOpen} 
        onClose={() => setDietPlanOpen(false)} 
        client={selectedClient}
        dietPlans={dietPlans}
        doctorId={doctorId}
      />

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {isRTL ? 'إضافة ملاحظة طبية' : 'Add Medical Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-xl bg-muted flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">{selectedClient?.full_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'النوع' : 'Type'}</Label>
                <Select value={newNote.type} onValueChange={(v) => setNewNote({...newNote, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advice">{isRTL ? 'نصيحة' : 'Advice'}</SelectItem>
                    <SelectItem value="warning">{isRTL ? 'تحذير' : 'Warning'}</SelectItem>
                    <SelectItem value="followup">{isRTL ? 'متابعة' : 'Follow-up'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'الأهمية' : 'Severity'}</Label>
                <Select value={newNote.severity} onValueChange={(v) => setNewNote({...newNote, severity: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{isRTL ? 'عادي' : 'Normal'}</SelectItem>
                    <SelectItem value="important">{isRTL ? 'مهم' : 'Important'}</SelectItem>
                    <SelectItem value="urgent">{isRTL ? 'عاجل' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{isRTL ? 'العنوان' : 'Title'}</Label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder={isRTL ? 'عنوان الملاحظة' : 'Note title'}
              />
            </div>
            <div>
              <Label>{isRTL ? 'المحتوى' : 'Content'}</Label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder={isRTL ? 'تفاصيل الملاحظة...' : 'Note details...'}
                rows={4}
              />
            </div>
            <Button onClick={handleAddNote} className="w-full">
              {isRTL ? 'إضافة الملاحظة' : 'Add Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Measurement Dialog */}
      <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {isRTL ? 'إضافة قياس صحي' : 'Add Health Measurement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-xl bg-muted flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">{selectedClient?.full_name}</span>
            </div>
            <div>
              <Label>{isRTL ? 'نوع القياس' : 'Measurement Type'}</Label>
              <Select 
                value={newMeasurement.measurement_type} 
                onValueChange={(v) => {
                  const units: Record<string, string> = {
                    weight: 'kg', blood_pressure: 'mmHg', blood_sugar: 'mg/dL', 
                    heart_rate: 'bpm', height: 'cm', waist: 'cm'
                  };
                  setNewMeasurement({...newMeasurement, measurement_type: v, unit: units[v] || 'unit'});
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">{isRTL ? 'الوزن' : 'Weight'}</SelectItem>
                  <SelectItem value="blood_pressure">{isRTL ? 'ضغط الدم' : 'Blood Pressure'}</SelectItem>
                  <SelectItem value="blood_sugar">{isRTL ? 'السكر' : 'Blood Sugar'}</SelectItem>
                  <SelectItem value="heart_rate">{isRTL ? 'نبض القلب' : 'Heart Rate'}</SelectItem>
                  <SelectItem value="height">{isRTL ? 'الطول' : 'Height'}</SelectItem>
                  <SelectItem value="waist">{isRTL ? 'محيط الخصر' : 'Waist'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'القيمة' : 'Value'}</Label>
                <Input
                  type="number"
                  value={newMeasurement.value}
                  onChange={(e) => setNewMeasurement({...newMeasurement, value: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>{isRTL ? 'الوحدة' : 'Unit'}</Label>
                <Input value={newMeasurement.unit} disabled className="bg-muted" />
              </div>
            </div>
            <div>
              <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'}
                rows={2}
              />
            </div>
            <Button onClick={handleAddMeasurement} className="w-full">
              {isRTL ? 'إضافة القياس' : 'Add Measurement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
