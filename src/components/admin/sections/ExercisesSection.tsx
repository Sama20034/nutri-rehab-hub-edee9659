import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Dumbbell, Target, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, Muscle, Equipment } from '@/hooks/useAdminExercisesData';
import { toast } from 'sonner';

interface ExercisesSectionProps {
  exercises: Exercise[];
  muscles: Muscle[];
  equipment: Equipment[];
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdateExercise: (id: string, updates: Partial<Exercise>) => Promise<{ error: Error | null }>;
  onDeleteExercise: (id: string) => Promise<{ error: Error | null }>;
  onAddMuscle: (muscle: Omit<Muscle, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdateMuscle: (id: string, updates: Partial<Muscle>) => Promise<{ error: Error | null }>;
  onDeleteMuscle: (id: string) => Promise<{ error: Error | null }>;
  onAddEquipment: (equip: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdateEquipment: (id: string, updates: Partial<Equipment>) => Promise<{ error: Error | null }>;
  onDeleteEquipment: (id: string) => Promise<{ error: Error | null }>;
}

const levels = ['مبتدئ', 'متوسط', 'متقدم'];
const genders = ['الجميع', 'ذكر', 'أنثى'];
const muscleEmojis = ['💪', '🦵', '🫁', '🏃', '🤸', '🧘', '🏋️', '👐', '🦶', '🎯'];
const equipmentEmojis = ['🏋️', '⚙️', '💪', '🔧', '🎯', '🏃', '🤸', '🧘', '🎾', '🥊'];

export const ExercisesSection = ({
  exercises,
  muscles,
  equipment,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onAddMuscle,
  onUpdateMuscle,
  onDeleteMuscle,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}: ExercisesSectionProps) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('equipment');

  // Exercise dialog state
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '', name_en: '', video_url: '', thumbnail_url: '',
    description_ar: '', description_en: '', duration: '', calories: '',
    level: 'مبتدئ', gender: 'الجميع', muscle_group: '', equipment: '',
    tips_ar: '', tips_en: ''
  });

  // Muscle dialog state
  const [isMuscleDialogOpen, setIsMuscleDialogOpen] = useState(false);
  const [editingMuscle, setEditingMuscle] = useState<Muscle | null>(null);
  const [muscleForm, setMuscleForm] = useState({ name_ar: '', name_en: '', icon: '' });

  // Equipment dialog state
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({ name_ar: '', name_en: '', icon: '' });

  // Exercise handlers
  const resetExerciseForm = () => {
    setExerciseForm({
      name: '', name_en: '', video_url: '', thumbnail_url: '',
      description_ar: '', description_en: '', duration: '', calories: '',
      level: 'مبتدئ', gender: 'الجميع', muscle_group: '', equipment: '',
      tips_ar: '', tips_en: ''
    });
    setEditingExercise(null);
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseForm.name) {
      toast.error(isRTL ? 'يرجى إدخال الاسم بالعربية' : 'Please enter Arabic name');
      return;
    }
    const data = {
      doctor_id: user?.id || '',
      name: exerciseForm.name,
      description: exerciseForm.description_ar || null,
      muscle_group: exerciseForm.muscle_group || null,
      equipment: exerciseForm.equipment || null,
      level: exerciseForm.level,
      gender: exerciseForm.gender,
      video_url: exerciseForm.video_url || null
    };
    const result = editingExercise
      ? await onUpdateExercise(editingExercise.id, data)
      : await onAddExercise(data);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingExercise ? 'تم التحديث' : 'تمت الإضافة') : (editingExercise ? 'Updated' : 'Added'));
      setIsExerciseDialogOpen(false);
      resetExerciseForm();
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setExerciseForm({
      name: exercise.name,
      name_en: '',
      video_url: exercise.video_url || '',
      thumbnail_url: '',
      description_ar: exercise.description || '',
      description_en: '',
      duration: '',
      calories: '',
      level: exercise.level || 'مبتدئ',
      gender: exercise.gender || 'الجميع',
      muscle_group: exercise.muscle_group || '',
      equipment: exercise.equipment || '',
      tips_ar: '',
      tips_en: ''
    });
    setEditingExercise(exercise);
    setIsExerciseDialogOpen(true);
  };

  const handleDeleteExercise = async (id: string) => {
    const result = await onDeleteExercise(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  // Muscle handlers
  const resetMuscleForm = () => {
    setMuscleForm({ name_ar: '', name_en: '', icon: '' });
    setEditingMuscle(null);
  };

  const handleMuscleSubmit = async () => {
    if (!muscleForm.name_ar || !muscleForm.name_en) {
      toast.error(isRTL ? 'يرجى إدخال الاسم بالعربية والإنجليزية' : 'Please enter names in Arabic and English');
      return;
    }
    const data = {
      doctor_id: user?.id || '',
      name_ar: muscleForm.name_ar,
      name_en: muscleForm.name_en,
      icon: muscleForm.icon || null
    };
    const result = editingMuscle
      ? await onUpdateMuscle(editingMuscle.id, data)
      : await onAddMuscle(data);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingMuscle ? 'تم التحديث' : 'تمت الإضافة') : (editingMuscle ? 'Updated' : 'Added'));
      setIsMuscleDialogOpen(false);
      resetMuscleForm();
    }
  };

  const handleEditMuscle = (muscle: Muscle) => {
    setMuscleForm({ name_ar: muscle.name_ar, name_en: muscle.name_en, icon: muscle.icon || '' });
    setEditingMuscle(muscle);
    setIsMuscleDialogOpen(true);
  };

  const handleDeleteMuscle = async (id: string) => {
    const result = await onDeleteMuscle(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  // Equipment handlers
  const resetEquipmentForm = () => {
    setEquipmentForm({ name_ar: '', name_en: '', icon: '' });
    setEditingEquipment(null);
  };

  const handleEquipmentSubmit = async () => {
    if (!equipmentForm.name_ar || !equipmentForm.name_en) {
      toast.error(isRTL ? 'يرجى إدخال الاسم بالعربية والإنجليزية' : 'Please enter names in Arabic and English');
      return;
    }
    const data = {
      doctor_id: user?.id || '',
      name_ar: equipmentForm.name_ar,
      name_en: equipmentForm.name_en,
      icon: equipmentForm.icon || null
    };
    const result = editingEquipment
      ? await onUpdateEquipment(editingEquipment.id, data)
      : await onAddEquipment(data);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingEquipment ? 'تم التحديث' : 'تمت الإضافة') : (editingEquipment ? 'Updated' : 'Added'));
      setIsEquipmentDialogOpen(false);
      resetEquipmentForm();
    }
  };

  const handleEditEquipment = (equip: Equipment) => {
    setEquipmentForm({ name_ar: equip.name_ar, name_en: equip.name_en, icon: equip.icon || '' });
    setEditingEquipment(equip);
    setIsEquipmentDialogOpen(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    const result = await onDeleteEquipment(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة التمارين' : 'Exercise Management'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'إضافة وتعديل التمارين والعضلات والمعدات' : 'Add and manage exercises, muscles, and equipment'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="equipment" className="gap-2">
            <Wrench className="h-4 w-4" />
            {isRTL ? 'المعدات' : 'Equipment'}
          </TabsTrigger>
          <TabsTrigger value="muscles" className="gap-2">
            <Target className="h-4 w-4" />
            {isRTL ? 'العضلات' : 'Muscles'}
          </TabsTrigger>
          <TabsTrigger value="exercises" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            {isRTL ? 'التمارين' : 'Exercises'}
          </TabsTrigger>
        </TabsList>

        {/* EQUIPMENT TAB */}
        <TabsContent value="equipment" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isRTL ? 'المعدات' : 'Equipment'}</h2>
            <Button variant="hero" onClick={() => { resetEquipmentForm(); setIsEquipmentDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة معدات' : 'Add Equipment'}
            </Button>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</TableHead>
                  <TableHead>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الأيقونة' : 'Icon'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد معدات' : 'No equipment found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell className={isRTL ? 'text-right' : ''}>{equip.name_ar}</TableCell>
                      <TableCell>{equip.name_en}</TableCell>
                      <TableCell className="text-center text-xl">{equip.icon || '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditEquipment(equip)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteEquipment(equip.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* MUSCLES TAB */}
        <TabsContent value="muscles" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{isRTL ? 'العضلات' : 'Muscles'}</h2>
            <Button variant="hero" onClick={() => { resetMuscleForm(); setIsMuscleDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة عضلة' : 'Add Muscle'}
            </Button>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</TableHead>
                  <TableHead>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الأيقونة' : 'Icon'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {muscles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد عضلات' : 'No muscles found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  muscles.map((muscle) => (
                    <TableRow key={muscle.id}>
                      <TableCell className={isRTL ? 'text-right' : ''}>{muscle.name_ar}</TableCell>
                      <TableCell>{muscle.name_en}</TableCell>
                      <TableCell className="text-center text-xl">{muscle.icon || '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditMuscle(muscle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteMuscle(muscle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* EXERCISES TAB */}
        <TabsContent value="exercises" className="mt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold">{isRTL ? 'التمارين' : 'Exercises'}</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} w-48`}
                />
              </div>
              <Button variant="hero" onClick={() => { resetExerciseForm(); setIsExerciseDialogOpen(true); }}>
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة تمرين' : 'Add Exercise'}
              </Button>
            </div>
          </div>

          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{isRTL ? 'العضلة' : 'Muscle'}</TableHead>
                  <TableHead>{isRTL ? 'المعدات' : 'Equipment'}</TableHead>
                  <TableHead>{isRTL ? 'المستوى' : 'Level'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد تمارين' : 'No exercises found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className={isRTL ? 'text-right' : ''}>{exercise.name}</TableCell>
                      <TableCell>{exercise.muscle_group || '-'}</TableCell>
                      <TableCell>{exercise.equipment || '-'}</TableCell>
                      <TableCell>
                        <Badge className={
                          exercise.level === 'مبتدئ' ? 'bg-green-500' :
                          exercise.level === 'متوسط' ? 'bg-yellow-500' :
                          exercise.level === 'متقدم' ? 'bg-red-500' : ''
                        }>
                          {exercise.level || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditExercise(exercise)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExercise(exercise.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Equipment Dialog */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={(open) => { setIsEquipmentDialogOpen(open); if (!open) resetEquipmentForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? (isRTL ? 'تعديل المعدات' : 'Edit Equipment') : (isRTL ? 'إضافة معدات جديدة' : 'Add New Equipment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
              <Input value={equipmentForm.name_ar} onChange={(e) => setEquipmentForm({ ...equipmentForm, name_ar: e.target.value })} />
            </div>
            <div>
              <Label>{isRTL ? 'الاسم بالإنجليزية *' : 'English Name *'}</Label>
              <Input value={equipmentForm.name_en} onChange={(e) => setEquipmentForm({ ...equipmentForm, name_en: e.target.value })} />
            </div>
            <div>
              <Label>{isRTL ? 'الأيقونة (emoji أو رابط)' : 'Icon (emoji or link)'}</Label>
              <div className="flex gap-2">
                <Input value={equipmentForm.icon} onChange={(e) => setEquipmentForm({ ...equipmentForm, icon: e.target.value })} className="flex-1" />
                <div className="flex gap-1 flex-wrap">
                  {equipmentEmojis.slice(0, 5).map(emoji => (
                    <Button key={emoji} type="button" variant="ghost" size="icon" onClick={() => setEquipmentForm({ ...equipmentForm, icon: emoji })}>
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="hero" onClick={handleEquipmentSubmit}>
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Muscle Dialog */}
      <Dialog open={isMuscleDialogOpen} onOpenChange={(open) => { setIsMuscleDialogOpen(open); if (!open) resetMuscleForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMuscle ? (isRTL ? 'تعديل العضلة' : 'Edit Muscle') : (isRTL ? 'إضافة عضلة جديدة' : 'Add New Muscle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
              <Input value={muscleForm.name_ar} onChange={(e) => setMuscleForm({ ...muscleForm, name_ar: e.target.value })} />
            </div>
            <div>
              <Label>{isRTL ? 'الاسم بالإنجليزية *' : 'English Name *'}</Label>
              <Input value={muscleForm.name_en} onChange={(e) => setMuscleForm({ ...muscleForm, name_en: e.target.value })} />
            </div>
            <div>
              <Label>{isRTL ? 'الأيقونة (emoji أو رابط)' : 'Icon (emoji or link)'}</Label>
              <div className="flex gap-2">
                <Input value={muscleForm.icon} onChange={(e) => setMuscleForm({ ...muscleForm, icon: e.target.value })} className="flex-1" />
                <div className="flex gap-1 flex-wrap">
                  {muscleEmojis.slice(0, 5).map(emoji => (
                    <Button key={emoji} type="button" variant="ghost" size="icon" onClick={() => setMuscleForm({ ...muscleForm, icon: emoji })}>
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsMuscleDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="hero" onClick={handleMuscleSubmit}>
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Dialog */}
      <Dialog open={isExerciseDialogOpen} onOpenChange={(open) => { setIsExerciseDialogOpen(open); if (!open) resetExerciseForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExercise ? (isRTL ? 'تعديل التمرين' : 'Edit Exercise') : (isRTL ? 'إضافة تمرين جديد' : 'Add New Exercise')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
                <Input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'الاسم بالإنجليزية *' : 'English Name *'}</Label>
                <Input value={exerciseForm.name_en} onChange={(e) => setExerciseForm({ ...exerciseForm, name_en: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{isRTL ? 'رابط يوتيوب *' : 'YouTube URL *'}</Label>
              <Input value={exerciseForm.video_url} onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <Label>{isRTL ? 'رابط الصورة المصغرة' : 'Thumbnail URL'}</Label>
              <Input value={exerciseForm.thumbnail_url} onChange={(e) => setExerciseForm({ ...exerciseForm, thumbnail_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
                <Textarea value={exerciseForm.description_ar} onChange={(e) => setExerciseForm({ ...exerciseForm, description_ar: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'الوصف بالإنجليزية' : 'English Description'}</Label>
                <Textarea value={exerciseForm.description_en} onChange={(e) => setExerciseForm({ ...exerciseForm, description_en: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>{isRTL ? 'المدة (دقائق)' : 'Duration (mins)'}</Label>
                <Input type="number" value={exerciseForm.duration} onChange={(e) => setExerciseForm({ ...exerciseForm, duration: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'السعرات' : 'Calories'}</Label>
                <Input type="number" value={exerciseForm.calories} onChange={(e) => setExerciseForm({ ...exerciseForm, calories: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'المستوى' : 'Level'}</Label>
                <Select value={exerciseForm.level} onValueChange={(v) => setExerciseForm({ ...exerciseForm, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'الجنس' : 'Gender'}</Label>
                <Select value={exerciseForm.gender} onValueChange={(v) => setExerciseForm({ ...exerciseForm, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'العضلة المستهدفة' : 'Target Muscle'}</Label>
                <Select value={exerciseForm.muscle_group} onValueChange={(v) => setExerciseForm({ ...exerciseForm, muscle_group: v })}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر العضلة' : 'Select muscle'} /></SelectTrigger>
                  <SelectContent>
                    {muscles.map(m => <SelectItem key={m.id} value={m.name_ar}>{m.icon} {isRTL ? m.name_ar : m.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'المعدات' : 'Equipment'}</Label>
                <Select value={exerciseForm.equipment} onValueChange={(v) => setExerciseForm({ ...exerciseForm, equipment: v })}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المعدات' : 'Select equipment'} /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(e => <SelectItem key={e.id} value={e.name_ar}>{e.icon} {isRTL ? e.name_ar : e.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'نصائح بالعربية' : 'Arabic Tips'}</Label>
                <Textarea value={exerciseForm.tips_ar} onChange={(e) => setExerciseForm({ ...exerciseForm, tips_ar: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'نصائح بالإنجليزية' : 'English Tips'}</Label>
                <Textarea value={exerciseForm.tips_en} onChange={(e) => setExerciseForm({ ...exerciseForm, tips_en: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsExerciseDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="hero" onClick={handleExerciseSubmit}>
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
