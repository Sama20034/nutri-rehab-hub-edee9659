import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Exercise } from '@/hooks/useDoctorData';
import { toast } from 'sonner';

interface ExercisesSectionProps {
  exercises: Exercise[];
  doctorId: string;
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'created_at'>) => Promise<{ error: Error | null }>;
  onUpdateExercise: (id: string, updates: Partial<Exercise>) => Promise<{ error: Error | null }>;
  onDeleteExercise: (id: string) => Promise<{ error: Error | null }>;
}

const difficulties = ['beginner', 'intermediate', 'advanced'];
const categories = ['cardio', 'strength', 'flexibility', 'balance'];

export const ExercisesSection = ({
  exercises,
  doctorId,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise
}: ExercisesSectionProps) => {
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Exercise dialog state
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration_minutes: '',
    video_url: '',
    image_url: ''
  });

  // Exercise handlers
  const resetExerciseForm = () => {
    setExerciseForm({
      name: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      duration_minutes: '',
      video_url: '',
      image_url: ''
    });
    setEditingExercise(null);
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseForm.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم التمرين' : 'Please enter exercise name');
      return;
    }
    const data = {
      created_by: doctorId,
      name: exerciseForm.name,
      description: exerciseForm.description || null,
      category: exerciseForm.category || null,
      difficulty: exerciseForm.difficulty || null,
      duration_minutes: exerciseForm.duration_minutes ? parseInt(exerciseForm.duration_minutes) : null,
      video_url: exerciseForm.video_url || null,
      image_url: exerciseForm.image_url || null
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
      category: exercise.category || '',
      difficulty: exercise.difficulty || 'beginner',
      duration_minutes: exercise.duration_minutes?.toString() || '',
      video_url: exercise.video_url || '',
      image_url: exercise.image_url || ''
    });
    setEditingExercise(exercise);
    setIsExerciseDialogOpen(true);
  };

  const handleDeleteExercise = async (id: string) => {
    const result = await onDeleteExercise(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  const filteredExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.category === filter;
    return matchesSearch && matchesFilter;
  });

  const getDifficultyBadge = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return <Badge className="bg-green-500">{isRTL ? 'مبتدئ' : 'Beginner'}</Badge>;
      case 'intermediate': return <Badge className="bg-yellow-500">{isRTL ? 'متوسط' : 'Intermediate'}</Badge>;
      case 'advanced': return <Badge className="bg-red-500">{isRTL ? 'متقدم' : 'Advanced'}</Badge>;
      default: return <Badge variant="secondary">{difficulty || '-'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة التمارين' : 'Exercise Management'}</h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إضافة وتعديل التمارين' : 'Add and edit exercises'}
        </p>
      </div>

      {/* EXERCISES */}
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
                <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
                <Select value={exerciseForm.category} onValueChange={(v) => setExerciseForm({ ...exerciseForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'المستوى' : 'Difficulty'}</Label>
                <Select value={exerciseForm.difficulty} onValueChange={(v) => setExerciseForm({ ...exerciseForm, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'المدة (بالدقائق)' : 'Duration (minutes)'}</Label>
                <Input 
                  type="number"
                  value={exerciseForm.duration_minutes} 
                  onChange={(e) => setExerciseForm({ ...exerciseForm, duration_minutes: e.target.value })} 
                />
              </div>
              <div>
                <Label>{isRTL ? 'رابط الفيديو' : 'Video URL'}</Label>
                <Input value={exerciseForm.video_url} onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })} />
              </div>
              <div>
                <Label>{isRTL ? 'رابط الصورة' : 'Image URL'}</Label>
                <Input value={exerciseForm.image_url} onChange={(e) => setExerciseForm({ ...exerciseForm, image_url: e.target.value })} />
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
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
        <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
          <div className="text-right">{isRTL ? 'الاسم' : 'Name'}</div>
          <div className="text-center">{isRTL ? 'التصنيف' : 'Category'}</div>
          <div className="text-center">{isRTL ? 'المستوى' : 'Difficulty'}</div>
          <div className="text-center">{isRTL ? 'المدة' : 'Duration'}</div>
          <div className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</div>
        </div>
        {filteredExercises.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {isRTL ? 'لا توجد تمارين' : 'No exercises found'}
          </div>
        ) : (
          filteredExercises.map((exercise, index) => (
            <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
              className="grid grid-cols-5 gap-4 p-4 border-t border-border items-center hover:bg-muted/30">
              <div className="text-right font-medium">{exercise.name}</div>
              <div className="text-center text-muted-foreground">{exercise.category || '-'}</div>
              <div className="text-center">{getDifficultyBadge(exercise.difficulty)}</div>
              <div className="text-center text-muted-foreground">
                {exercise.duration_minutes ? `${exercise.duration_minutes} ${isRTL ? 'دقيقة' : 'min'}` : '-'}
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditExercise(exercise)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExercise(exercise.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
