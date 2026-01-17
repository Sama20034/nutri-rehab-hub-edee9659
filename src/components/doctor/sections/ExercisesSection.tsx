import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Dumbbell, Target, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Exercise, Muscle, Equipment } from '@/hooks/useDoctorData';
import { toast } from 'sonner';

interface ExercisesSectionProps {
  exercises: Exercise[];
  muscles: Muscle[];
  equipment: Equipment[];
  doctorId: string;
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

// Common emojis for muscles and equipment
const muscleEmojis = ['🦵', '💪', '🦾', '🏃', '🤸', '🧘', '🏋️', '👐', '🦶', '🫁'];
const equipmentEmojis = ['⚙️', '🏋️', '💪', '🔧', '🎯', '🏃', '🤸', '🧘', '🎾', '🥊'];

export const ExercisesSection = ({
  exercises,
  muscles,
  equipment,
  doctorId,
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('exercises');
  
  // Exercise dialog state
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: '',
    level: 'مبتدئ',
    gender: 'الجميع',
    video_url: ''
  });

  // Muscle dialog state
  const [isMuscleDialogOpen, setIsMuscleDialogOpen] = useState(false);
  const [editingMuscle, setEditingMuscle] = useState<Muscle | null>(null);
  const [muscleForm, setMuscleForm] = useState({
    name_ar: '',
    name_en: '',
    icon: ''
  });

  // Equipment dialog state
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name_ar: '',
    name_en: '',
    icon: ''
  });

  // Exercise handlers
  const resetExerciseForm = () => {
    setExerciseForm({
      name: '', description: '', muscle_group: '', equipment: '',
      level: 'مبتدئ', gender: 'الجميع', video_url: ''
    });
    setEditingExercise(null);
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseForm.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم التمرين' : 'Please enter exercise name');
      return;
    }
    const data = {
      doctor_id: doctorId,
      name: exerciseForm.name,
      description: exerciseForm.description || null,
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
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || '',
      equipment: exercise.equipment || '',
      level: exercise.level || 'مبتدئ',
      gender: exercise.gender || 'الجميع',
      video_url: exercise.video_url || ''
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
      doctor_id: doctorId,
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
    setMuscleForm({
      name_ar: muscle.name_ar,
      name_en: muscle.name_en,
      icon: muscle.icon || ''
    });
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
      doctor_id: doctorId,
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
    setEquipmentForm({
      name_ar: equip.name_ar,
      name_en: equip.name_en,
      icon: equip.icon || ''
    });
    setEditingEquipment(equip);
    setIsEquipmentDialogOpen(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    const result = await onDeleteEquipment(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  const filteredExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.muscle_group === filter;
    return matchesSearch && matchesFilter;
  });

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'مبتدئ': return <Badge className="bg-green-500">{level}</Badge>;
      case 'متوسط': return <Badge className="bg-yellow-500">{level}</Badge>;
      case 'متقدم': return <Badge className="bg-red-500">{level}</Badge>;
      default: return <Badge variant="secondary">{level || '-'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة التمارين' : 'Exercise Management'}</h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إضافة وتعديل التمارين والعضلات والمعدات' : 'Add and edit exercises, muscles, and equipment'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="exercises" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            {isRTL ? 'التمارين' : 'Exercises'}
          </TabsTrigger>
          <TabsTrigger value="muscles" className="gap-2">
            <Target className="h-4 w-4" />
            {isRTL ? 'العضلات' : 'Muscles'}
          </TabsTrigger>
          <TabsTrigger value="equipment" className="gap-2">
            <Wrench className="h-4 w-4" />
            {isRTL ? 'المعدات' : 'Equipment'}
          </TabsTrigger>
        </TabsList>

        {/* EXERCISES TAB */}
        <TabsContent value="exercises" className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <Dialog open={isExerciseDialogOpen} onOpenChange={(open) => { setIsExerciseDialogOpen(open); if (!open) resetExerciseForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {isRTL ? 'إضافة تمرين' : 'Add Exercise'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingExercise ? (isRTL ? 'تعديل التمرين' : 'Edit Exercise') : (isRTL ? 'إضافة تمرين جديد' : 'Add New Exercise')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{isRTL ? 'اسم التمرين' : 'Exercise Name'}</Label>
                    <Input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>{isRTL ? 'العضلة المستهدفة' : 'Target Muscle'}</Label>
                    <Select value={exerciseForm.muscle_group} onValueChange={(v) => setExerciseForm({ ...exerciseForm, muscle_group: v })}>
                      <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر العضلة' : 'Select muscle'} /></SelectTrigger>
                      <SelectContent>
                        {muscles.map(m => (
                          <SelectItem key={m.id} value={m.name_ar}>{m.icon} {isRTL ? m.name_ar : m.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isRTL ? 'المعدات' : 'Equipment'}</Label>
                    <Select value={exerciseForm.equipment} onValueChange={(v) => setExerciseForm({ ...exerciseForm, equipment: v })}>
                      <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المعدات' : 'Select equipment'} /></SelectTrigger>
                      <SelectContent>
                        {equipment.map(e => (
                          <SelectItem key={e.id} value={e.name_ar}>{e.icon} {isRTL ? e.name_ar : e.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label>{isRTL ? 'رابط الفيديو' : 'Video URL'}</Label>
                    <Input value={exerciseForm.video_url} onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })} />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                    <Textarea value={exerciseForm.description} onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })} />
                  </div>
                  <Button onClick={handleExerciseSubmit} className="w-full">
                    {editingExercise ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-3 flex-1 max-w-xl">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder={isRTL ? 'الكل' : 'All'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  {muscles.map(m => <SelectItem key={m.id} value={m.name_ar}>{m.icon} {isRTL ? m.name_ar : m.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isRTL ? 'بحث...' : 'Search...'} className="pl-10" />
              </div>
            </div>
          </div>

          <div className="text-right mb-2"><h3 className="font-medium">{isRTL ? 'قائمة التمارين' : 'Exercise List'}</h3></div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="text-right">{isRTL ? 'الاسم' : 'Name'}</div>
              <div className="text-center">{isRTL ? 'العضلة' : 'Muscle'}</div>
              <div className="text-center">{isRTL ? 'المعدات' : 'Equipment'}</div>
              <div className="text-center">{isRTL ? 'المستوى' : 'Level'}</div>
              <div className="text-center">{isRTL ? 'الجنس' : 'Gender'}</div>
              <div className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</div>
            </div>
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{isRTL ? 'لا توجد تمارين' : 'No exercises found'}</div>
            ) : (
              filteredExercises.map((exercise, index) => (
                <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-6 gap-4 p-4 border-t border-border items-center hover:bg-muted/30">
                  <div className="text-right font-medium">{exercise.name}</div>
                  <div className="text-center text-muted-foreground">{exercise.muscle_group || '-'}</div>
                  <div className="text-center text-muted-foreground">{exercise.equipment || '-'}</div>
                  <div className="text-center">{getLevelBadge(exercise.level)}</div>
                  <div className="text-center text-muted-foreground">{exercise.gender || '-'}</div>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditExercise(exercise)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExercise(exercise.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* MUSCLES TAB */}
        <TabsContent value="muscles" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog open={isMuscleDialogOpen} onOpenChange={(open) => { setIsMuscleDialogOpen(open); if (!open) resetMuscleForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />{isRTL ? 'إضافة عضلة' : 'Add Muscle'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingMuscle ? (isRTL ? 'تعديل العضلة' : 'Edit Muscle') : (isRTL ? 'إضافة عضلة جديدة' : 'Add New Muscle')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                    <Input value={muscleForm.name_ar} onChange={(e) => setMuscleForm({ ...muscleForm, name_ar: e.target.value })} placeholder={isRTL ? 'مثال: الأرجل' : 'e.g., Legs'} />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                    <Input value={muscleForm.name_en} onChange={(e) => setMuscleForm({ ...muscleForm, name_en: e.target.value })} placeholder="e.g., Legs" />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الأيقونة (إيموجي)' : 'Icon (Emoji)'}</Label>
                    <Input value={muscleForm.icon} onChange={(e) => setMuscleForm({ ...muscleForm, icon: e.target.value })} placeholder="🦵" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {muscleEmojis.map(emoji => (
                        <button key={emoji} type="button" onClick={() => setMuscleForm({ ...muscleForm, icon: emoji })}
                          className="text-2xl p-1 hover:bg-muted rounded transition-colors">{emoji}</button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleMuscleSubmit} className="w-full">
                    {editingMuscle ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <h2 className="text-xl font-bold">{isRTL ? 'العضلات' : 'Muscles'}</h2>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="text-right">{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</div>
              <div className="text-center">{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</div>
              <div className="text-center">{isRTL ? 'الأيقونة' : 'Icon'}</div>
              <div className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</div>
            </div>
            {muscles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{isRTL ? 'لا توجد عضلات' : 'No muscles found'}</div>
            ) : (
              muscles.map((muscle, index) => (
                <motion.div key={muscle.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-4 gap-4 p-4 border-t border-border items-center hover:bg-muted/30">
                  <div className="text-right font-medium">{muscle.name_ar}</div>
                  <div className="text-center text-muted-foreground">{muscle.name_en}</div>
                  <div className="text-center text-2xl">{muscle.icon || '-'}</div>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditMuscle(muscle)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteMuscle(muscle.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* EQUIPMENT TAB */}
        <TabsContent value="equipment" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog open={isEquipmentDialogOpen} onOpenChange={(open) => { setIsEquipmentDialogOpen(open); if (!open) resetEquipmentForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />{isRTL ? 'إضافة معدات' : 'Add Equipment'}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEquipment ? (isRTL ? 'تعديل المعدات' : 'Edit Equipment') : (isRTL ? 'إضافة معدات جديدة' : 'Add New Equipment')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                    <Input value={equipmentForm.name_ar} onChange={(e) => setEquipmentForm({ ...equipmentForm, name_ar: e.target.value })} placeholder={isRTL ? 'مثال: بار' : 'e.g., Barbell'} />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
                    <Input value={equipmentForm.name_en} onChange={(e) => setEquipmentForm({ ...equipmentForm, name_en: e.target.value })} placeholder="e.g., Barbell" />
                  </div>
                  <div>
                    <Label>{isRTL ? 'الأيقونة (إيموجي)' : 'Icon (Emoji)'}</Label>
                    <Input value={equipmentForm.icon} onChange={(e) => setEquipmentForm({ ...equipmentForm, icon: e.target.value })} placeholder="🏋️" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {equipmentEmojis.map(emoji => (
                        <button key={emoji} type="button" onClick={() => setEquipmentForm({ ...equipmentForm, icon: emoji })}
                          className="text-2xl p-1 hover:bg-muted rounded transition-colors">{emoji}</button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleEquipmentSubmit} className="w-full">
                    {editingEquipment ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <h2 className="text-xl font-bold">{isRTL ? 'المعدات' : 'Equipment'}</h2>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div className="text-right">{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</div>
              <div className="text-center">{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</div>
              <div className="text-center">{isRTL ? 'الأيقونة' : 'Icon'}</div>
              <div className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</div>
            </div>
            {equipment.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{isRTL ? 'لا توجد معدات' : 'No equipment found'}</div>
            ) : (
              equipment.map((equip, index) => (
                <motion.div key={equip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-4 gap-4 p-4 border-t border-border items-center hover:bg-muted/30">
                  <div className="text-right font-medium">{equip.name_ar}</div>
                  <div className="text-center text-muted-foreground">{equip.name_en}</div>
                  <div className="text-center text-2xl">{equip.icon || '-'}</div>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditEquipment(equip)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteEquipment(equip.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
