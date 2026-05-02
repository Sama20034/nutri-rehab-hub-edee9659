import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Search, Edit, Trash2, Dumbbell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select';
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
import { Exercise } from '@/hooks/useAdminExercisesData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  user_id: string;
  full_name: string;
}

interface ExercisesSectionProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'created_at'>) => Promise<{ error: Error | null }>;
  onUpdateExercise: (id: string, updates: Partial<Exercise>) => Promise<{ error: Error | null }>;
  onDeleteExercise: (id: string) => Promise<{ error: Error | null }>;
  onAssignToClients?: (exerciseId: string, clientIds: string[], assignedBy: string) => Promise<{ error: Error | null }>;
}

const difficulties = ['beginner', 'intermediate', 'advanced'];
const categories = ['cardio', 'strength', 'flexibility', 'balance'];

// URL validation helper
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const ExercisesSection = ({
  exercises,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onAssignToClients
}: ExercisesSectionProps) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // Exercise dialog state
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    description: '',
    video_url: '',
    image_url: '',
    image_urls: [] as string[],
    category: '',
    difficulty: 'beginner',
    duration_minutes: ''
  });

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, full_name')
        .eq('status', 'approved');
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'client');
      
      if (profiles && roles) {
        const clientUserIds = roles.map(r => r.user_id);
        const clientProfiles = profiles.filter(p => clientUserIds.includes(p.user_id));
        setClients(clientProfiles as Client[]);
      }
    };
    fetchClients();
  }, []);

  const clientOptions = clients.map(c => ({
    value: c.user_id,
    label: c.full_name || 'بدون اسم'
  }));

  // Exercise handlers
  const resetExerciseForm = () => {
    setExerciseForm({
      name: '',
      description: '',
      video_url: '',
      image_url: '',
      image_urls: [],
      category: '',
      difficulty: 'beginner',
      duration_minutes: ''
    });
    setEditingExercise(null);
    setSelectedClients([]);
  };

  const handleExerciseSubmit = async () => {
    if (!exerciseForm.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم التمرين' : 'Please enter exercise name');
      return;
    }
    
    // Validate video URL if provided
    if (exerciseForm.video_url && !isValidUrl(exerciseForm.video_url)) {
      toast.error(isRTL ? 'يرجى إدخال رابط فيديو صحيح' : 'Please enter a valid video URL');
      return;
    }
    
    const data = {
      created_by: user?.id || null,
      name: exerciseForm.name,
      description: exerciseForm.description || null,
      video_url: exerciseForm.video_url || null,
      image_url: exerciseForm.image_urls[0] || exerciseForm.image_url || null,
      image_urls: exerciseForm.image_urls,
      category: exerciseForm.category || null,
      difficulty: exerciseForm.difficulty || null,
      duration_minutes: exerciseForm.duration_minutes ? parseInt(exerciseForm.duration_minutes) : null
    };
    
    console.log('Submitting exercise data:', data);
    
    let result;
    let exerciseId: string | null = null;
    
    if (editingExercise) {
      result = await onUpdateExercise(editingExercise.id, data);
      exerciseId = editingExercise.id;
    } else {
      result = await onAddExercise(data);
      // Get the newly created exercise ID
      if (!result.error) {
        const { data: newExercise } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', exerciseForm.name)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        exerciseId = newExercise?.id || null;
      }
    }
    
    if (result.error) {
      toast.error(result.error.message);
    } else {
      // Sync client assignments
      if (user && exerciseId) {
        // Get current assignments
        const { data: currentAssignments } = await supabase
          .from('client_exercises')
          .select('client_id')
          .eq('exercise_id', exerciseId);
        const currentIds = currentAssignments?.map(a => a.client_id) || [];
        
        const toAdd = selectedClients.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !selectedClients.includes(id));

        if (toRemove.length > 0) {
          await supabase.from('client_exercises').delete()
            .eq('exercise_id', exerciseId)
            .in('client_id', toRemove);
        }
        if (toAdd.length > 0) {
          const newAssignments = toAdd.map(clientId => ({
            exercise_id: exerciseId,
            client_id: clientId,
            assigned_by: user.id,
            completed: false
          }));
          await supabase.from('client_exercises').upsert(newAssignments, { onConflict: 'client_id,exercise_id', ignoreDuplicates: true });
        }
      }
      
      toast.success(isRTL ? (editingExercise ? 'تم التحديث' : 'تمت الإضافة') : (editingExercise ? 'Updated' : 'Added'));
      setIsExerciseDialogOpen(false);
      resetExerciseForm();
    }
  };

  const handleEditExercise = async (exercise: Exercise) => {
    setExerciseForm({
      name: exercise.name,
      description: exercise.description || '',
      video_url: exercise.video_url || '',
      image_url: exercise.image_url || '',
      category: exercise.category || '',
      difficulty: exercise.difficulty || 'beginner',
      duration_minutes: exercise.duration_minutes?.toString() || ''
    });
    setEditingExercise(exercise);
    setIsExerciseDialogOpen(true);

    // Fetch currently assigned clients
    const { data } = await supabase
      .from('client_exercises')
      .select('client_id')
      .eq('exercise_id', exercise.id);
    setSelectedClients(data?.map(d => d.client_id) || []);
  };

  const handleDeleteExercise = async (id: string) => {
    const result = await onDeleteExercise(id);
    if (result.error) toast.error(result.error.message);
    else toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة التمارين' : 'Exercise Management'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'إضافة وتعديل التمارين' : 'Add and manage exercises'}
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            className={`${isRTL ? 'pr-10' : 'pl-10'}`}
          />
        </div>
        <Button onClick={() => { resetExerciseForm(); setIsExerciseDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة تمرين' : 'Add Exercise'}
        </Button>
      </div>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'التصنيف' : 'Category'}</TableHead>
              <TableHead>{isRTL ? 'المستوى' : 'Difficulty'}</TableHead>
              <TableHead>{isRTL ? 'المدة' : 'Duration'}</TableHead>
              <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExercises.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد تمارين' : 'No exercises found'}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredExercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>{exercise.name}</TableCell>
                  <TableCell>{exercise.category || '-'}</TableCell>
                  <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>
                  <TableCell>
                    {exercise.duration_minutes ? `${exercise.duration_minutes} ${isRTL ? 'دقيقة' : 'min'}` : '-'}
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

      {/* Add/Edit Exercise Dialog */}
      <Dialog open={isExerciseDialogOpen} onOpenChange={(open) => { setIsExerciseDialogOpen(open); if (!open) resetExerciseForm(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? (isRTL ? 'تعديل التمرين' : 'Edit Exercise') : (isRTL ? 'إضافة تمرين جديد' : 'Add New Exercise')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'اسم التمرين' : 'Exercise Name'}</Label>
              <Input
                value={exerciseForm.name}
                onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
              <Select value={exerciseForm.category} onValueChange={(v) => setExerciseForm({ ...exerciseForm, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
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
              <Input
                value={exerciseForm.video_url}
                onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })}
              />
            </div>
            <div>
              <Label>{isRTL ? 'صورة التمرين' : 'Exercise Image'}</Label>
              <ImageUpload
                value={exerciseForm.image_url}
                onChange={(url) => setExerciseForm({ ...exerciseForm, image_url: url })}
                placeholder={isRTL ? 'اختر صورة التمرين' : 'Choose exercise image'}
                folder="exercises"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={exerciseForm.description}
                onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
              />
            </div>

            {/* Client Assignment */}
            {onAssignToClients && (
              <div className="border-t pt-4 mt-4">
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  {isRTL ? 'تعيين التمرين للعملاء' : 'Assign to Clients'}
                </Label>
                <MultiSelect
                  options={clientOptions}
                  selected={selectedClients}
                  onChange={setSelectedClients}
                  placeholder={isRTL ? 'اختر العملاء...' : 'Select clients...'}
                  searchPlaceholder={isRTL ? 'بحث عن عميل...' : 'Search clients...'}
                  emptyText={isRTL ? 'لا يوجد عملاء' : 'No clients found'}
                />
                {selectedClients.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {isRTL ? `سيتم تعيين التمرين لـ ${selectedClients.length} عميل` : `Will assign to ${selectedClients.length} client(s)`}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsExerciseDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleExerciseSubmit}>
              {editingExercise ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
