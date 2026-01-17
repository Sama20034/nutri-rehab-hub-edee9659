import { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Save, Clock, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Exercise, DietPlan, Video } from '@/hooks/useDoctorData';

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
}

// Health Profile Dialog
interface HealthProfileDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
}

export const HealthProfileDialog = ({ open, onClose, client }: HealthProfileDialogProps) => {
  const { isRTL } = useLanguage();
  
  // Mock health data - in real app would fetch from database
  const healthData = {
    allergies: ['حساسية'],
    diseases: ['أنيميا'],
    medications: ['مكملات'],
    supplements: ['فيتامين د'],
    favoriteFoods: ['سمك'],
    dislikedFoods: ['كشري']
  };

  const InfoCard = ({ title, items, colorClass }: { title: string; items: string[]; colorClass: string; }) => (
    <div className={`p-4 rounded-xl border border-border ${colorClass}`}>
      <h4 className="font-bold mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-background/50 text-sm">{item}</span>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? `الملف الصحي - ${client?.full_name}` : `Health Profile - ${client?.full_name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <InfoCard title={isRTL ? 'الحساسيات' : 'Allergies'} items={healthData.allergies} colorClass="bg-orange-500/10" />
          <InfoCard title={isRTL ? 'الأمراض' : 'Diseases'} items={healthData.diseases} colorClass="bg-red-500/10" />
          <InfoCard title={isRTL ? 'الأدوية' : 'Medications'} items={healthData.medications} colorClass="bg-blue-500/10" />
          <InfoCard title={isRTL ? 'المكملات' : 'Supplements'} items={healthData.supplements} colorClass="bg-green-500/10" />
          <InfoCard title={isRTL ? 'الأطعمة المفضلة' : 'Favorite Foods'} items={healthData.favoriteFoods} colorClass="bg-primary/10" />
          <InfoCard title={isRTL ? 'الأطعمة غير المحببة' : 'Disliked Foods'} items={healthData.dislikedFoods} colorClass="bg-destructive/10" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Assign Exercises Dialog - Weekly View
interface ClientExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  day_of_week: number;
  sets: number;
  reps: number;
  duration_minutes: number;
  notes: string;
}

interface AssignExercisesDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  exercises: Exercise[];
  doctorId: string;
}

const DAYS_OF_WEEK = [
  { id: 0, ar: 'الأحد', en: 'Sunday' },
  { id: 1, ar: 'الإثنين', en: 'Monday' },
  { id: 2, ar: 'الثلاثاء', en: 'Tuesday' },
  { id: 3, ar: 'الأربعاء', en: 'Wednesday' },
  { id: 4, ar: 'الخميس', en: 'Thursday' },
  { id: 5, ar: 'الجمعة', en: 'Friday' },
  { id: 6, ar: 'السبت', en: 'Saturday' },
];

export const AssignExercisesDialog = ({ open, onClose, client, exercises, doctorId }: AssignExercisesDialogProps) => {
  const { isRTL } = useLanguage();
  const [clientExercises, setClientExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for adding new exercise
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');

  // Load existing exercises when dialog opens
  useEffect(() => {
    if (open && client) {
      fetchExistingExercises();
    }
  }, [open, client]);

  const fetchExistingExercises = async () => {
    if (!client) return;
    try {
      const { data, error } = await supabase
        .from('client_exercises')
        .select(`
          id,
          exercise_id,
          day_of_week,
          sets,
          reps,
          duration_minutes,
          notes,
          exercise:exercises(name)
        `)
        .eq('client_id', client.user_id);

      if (error) throw error;

      if (data) {
        const mapped: ClientExercise[] = data.map(e => ({
          id: e.id,
          exercise_id: e.exercise_id,
          exercise_name: (e.exercise as any)?.name || '',
          day_of_week: e.day_of_week,
          sets: e.sets || 0,
          reps: e.reps || 0,
          duration_minutes: e.duration_minutes || 0,
          notes: e.notes || ''
        }));
        setClientExercises(mapped);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const getExercisesForDay = (dayId: number) => {
    return clientExercises.filter(ex => ex.day_of_week === dayId);
  };

  const handleAddExercise = () => {
    if (!selectedExercise) {
      toast.error(isRTL ? 'اختر تمرين' : 'Select an exercise');
      return;
    }
    
    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) return;
    
    const newExercise: ClientExercise = {
      id: crypto.randomUUID(),
      exercise_id: selectedExercise,
      exercise_name: exercise.name,
      day_of_week: selectedDay,
      sets,
      reps,
      duration_minutes: duration,
      notes
    };
    
    setClientExercises([...clientExercises, newExercise]);
    setShowAddDialog(false);
    resetForm();
    toast.success(isRTL ? 'تم إضافة التمرين' : 'Exercise added');
  };

  const resetForm = () => {
    setSelectedExercise('');
    setSelectedDay(0);
    setSets(3);
    setReps(10);
    setDuration(0);
    setNotes('');
  };

  const handleRemoveExercise = (id: string) => {
    setClientExercises(clientExercises.filter(ex => ex.id !== id));
    toast.success(isRTL ? 'تم حذف التمرين' : 'Exercise removed');
  };

  const handleSave = async () => {
    if (!client) return;
    setLoading(true);
    
    try {
      // Delete all existing exercises for this client assigned by this doctor
      await supabase
        .from('client_exercises')
        .delete()
        .eq('client_id', client.user_id)
        .eq('assigned_by', doctorId);

      // Insert all current exercises
      if (clientExercises.length > 0) {
        const inserts = clientExercises.map(ex => ({
          client_id: client.user_id,
          exercise_id: ex.exercise_id,
          assigned_by: doctorId,
          day_of_week: ex.day_of_week,
          sets: ex.sets,
          reps: ex.reps,
          duration_minutes: ex.duration_minutes,
          notes: ex.notes || null
        }));

        const { error } = await supabase
          .from('client_exercises')
          .insert(inserts);

        if (error) throw error;
      }

      toast.success(isRTL ? 'تم حفظ التمارين بنجاح' : 'Exercises saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving exercises:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء الحفظ' : 'Error saving exercises');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <DialogTitle className="text-xl">
                  {isRTL ? 'تمارين العميل' : 'Client Exercises'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'إدارة التمارين المخصصة للعميل' : 'Manage exercises assigned to the client'}
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 ml-2" />
                {isRTL ? 'إضافة تمرين' : 'Add Exercise'}
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-3 pr-4">
              {DAYS_OF_WEEK.map(day => {
                const dayExercises = getExercisesForDay(day.id);
                return (
                  <div 
                    key={day.id} 
                    className="rounded-xl border border-border bg-card/50 p-4"
                  >
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="text-lg">💪</span>
                      <h3 className="font-bold text-lg">{isRTL ? day.ar : day.en}</h3>
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                        {dayExercises.length}
                      </span>
                    </div>
                    
                    {dayExercises.length === 0 ? (
                      <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'لا توجد تمارين' : 'No exercises'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayExercises.map(ex => (
                          <div 
                            key={ex.id} 
                            className={`flex items-center justify-between p-3 rounded-lg bg-background border border-border ${isRTL ? 'flex-row-reverse' : ''}`}
                          >
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Check className="h-5 w-5 text-primary" />
                              <div className={isRTL ? 'text-right' : ''}>
                                <p className="font-medium">{ex.exercise_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ex.sets} × {ex.reps} {isRTL ? 'تكرار' : 'reps'}
                                  {ex.duration_minutes > 0 && ` • ${ex.duration_minutes} ${isRTL ? 'دقيقة' : 'min'}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveExercise(ex.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 ml-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'إضافة تمرين جديد' : 'Add New Exercise'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'التمرين' : 'Exercise'}
              </label>
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="border-primary">
                  <SelectValue placeholder={isRTL ? 'اختر تمرين' : 'Select exercise'} />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'اليوم' : 'Day'}
              </label>
              <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.id} value={day.id.toString()}>
                      {isRTL ? day.ar : day.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'المجموعات' : 'Sets'}
                </label>
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(parseInt(e.target.value) || 0)}
                  min={1}
                  className="text-center"
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'التكرارات' : 'Reps'}
                </label>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                  min={1}
                  className="text-center"
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'المدة (دقيقة)' : 'Duration (min)'}
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  className="text-center"
                />
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'ملاحظات' : 'Notes'}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'}
                rows={3}
              />
            </div>

            <Button onClick={handleAddExercise} className="w-full">
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Assign Videos Dialog
interface AssignVideosDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  videos: Video[];
  doctorId: string;
}

export const AssignVideosDialog = ({ open, onClose, client, videos, doctorId }: AssignVideosDialogProps) => {
  const { isRTL } = useLanguage();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [assignedVideos, setAssignedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && client) {
      fetchAssignedVideos();
    }
  }, [open, client]);

  const fetchAssignedVideos = async () => {
    if (!client) return;
    const { data } = await supabase
      .from('client_videos')
      .select('video_id')
      .eq('client_id', client.user_id);
    if (data) {
      const ids = data.map(v => v.video_id);
      setAssignedVideos(ids);
      setSelectedVideos(ids);
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  const toggleVideo = (id: string) => {
    setSelectedVideos(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!client) return;
    setLoading(true);
    
    try {
      // Remove unselected videos
      const toRemove = assignedVideos.filter(id => !selectedVideos.includes(id));
      if (toRemove.length > 0) {
        await supabase
          .from('client_videos')
          .delete()
          .eq('client_id', client.user_id)
          .in('video_id', toRemove);
      }

      // Add newly selected videos
      const toAdd = selectedVideos.filter(id => !assignedVideos.includes(id));
      if (toAdd.length > 0) {
        const inserts = toAdd.map(videoId => ({
          client_id: client.user_id,
          video_id: videoId,
          assigned_by: doctorId
        }));
        await supabase.from('client_videos').insert(inserts);
      }

      toast.success(isRTL ? 'تم حفظ الفيديوهات بنجاح' : 'Videos saved successfully');
      onClose();
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? `تعيين الفيديوهات للعميل` : `Assign Videos to Client`}
          </DialogTitle>
          <p className={`text-sm text-muted-foreground mt-1 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'اختر الفيديوهات التي تريد أن تظهر للعميل' : 'Select videos you want the client to see'}
          </p>
          <p className={`text-sm text-primary ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? `الفيديوهات المحددة: ${selectedVideos.length}` : `Selected videos: ${selectedVideos.length}`}
          </p>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <VideoIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                {isRTL ? 'لا توجد فيديوهات متاحة' : 'No videos available'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'أضف فيديوهات من قسم الفيديوهات أولاً' : 'Add videos from the Videos section first'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {videos.map(video => {
                const isSelected = selectedVideos.includes(video.id);
                const wasAssigned = assignedVideos.includes(video.id);
                return (
                  <div
                    key={video.id}
                    onClick={() => toggleVideo(video.id)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                      isSelected
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_url)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {/* YouTube Badge */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-red-600 text-white text-xs font-medium">
                        YouTube
                      </div>
                      {/* Assigned Badge */}
                      {wasAssigned && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium">
                          {isRTL ? 'معين' : 'Assigned'}
                        </div>
                      )}
                      {/* Selection Overlay */}
                      {isSelected ? (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 bg-card ${isRTL ? 'text-right' : ''}`}>
                      <h4 className="font-bold text-sm line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-muted-foreground">{video.category || (isRTL ? 'بدون تصنيف' : 'Uncategorized')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className={`flex gap-2 mt-4 pt-4 border-t border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Assign Diet Plan Dialog with Meals
interface Meal {
  name: string;
  time: string;
  content: string;
  calories: number;
}

interface AssignDietPlanDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  dietPlans: DietPlan[];
  doctorId: string;
  onAddDietPlan?: (plan: any) => Promise<{ error: Error | null }>;
}

export const AssignDietPlanDialog = ({ open, onClose, client, dietPlans, doctorId, onAddDietPlan }: AssignDietPlanDialogProps) => {
  const { isRTL } = useLanguage();
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    calories: 2000,
    status: 'نشط'
  });

  const [meals, setMeals] = useState<Meal[]>([
    { name: 'الفطور', time: '08:00', content: '', calories: 0 }
  ]);

  const addMeal = () => {
    setMeals([...meals, { name: '', time: '12:00', content: '', calories: 0 }]);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const updateMeal = (index: number, field: keyof Meal, value: string | number) => {
    const updated = [...meals];
    updated[index] = { ...updated[index], [field]: value };
    setMeals(updated);
  };

  const handleAssignExisting = async () => {
    if (!client || !selectedPlan) return;
    setLoading(true);
    
    try {
      await supabase.from('client_diet_plans').insert({
        client_id: client.user_id,
        diet_plan_id: selectedPlan,
        assigned_by: doctorId,
        status: 'active'
      });
      toast.success(isRTL ? 'تم تعيين النظام الغذائي بنجاح' : 'Diet plan assigned successfully');
      onClose();
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!client || !newPlan.name || !onAddDietPlan) return;
    setLoading(true);
    
    try {
      const planData = {
        doctor_id: doctorId,
        name: newPlan.name,
        description: newPlan.description + '\n\n' + meals.map(m => `${m.name} (${m.time}): ${m.content} - ${m.calories} سعرة`).join('\n'),
        calories_min: newPlan.calories - 200,
        calories_max: newPlan.calories + 200,
        status: newPlan.status,
        goal: null,
        duration_days: null
      };
      
      const { error } = await onAddDietPlan(planData);
      if (error) throw error;
      
      toast.success(isRTL ? 'تم إنشاء وتعيين النظام الغذائي بنجاح' : 'Diet plan created and assigned successfully');
      onClose();
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {showNewPlan 
              ? (isRTL ? 'إضافة نظام غذائي جديد' : 'Add New Diet Plan')
              : (isRTL ? `النظام الغذائي - ${client?.full_name}` : `Diet Plan - ${client?.full_name}`)}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {!showNewPlan ? (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <label className="font-medium">{isRTL ? 'اختر نظام غذائي موجود' : 'Select existing diet plan'}</label>
                <Button variant="outline" size="sm" onClick={() => setShowNewPlan(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {isRTL ? 'إنشاء جديد' : 'Create New'}
                </Button>
              </div>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر نظام غذائي' : 'Select diet plan'} />
                </SelectTrigger>
                <SelectContent>
                  {dietPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.calories_min}-{plan.calories_max} {isRTL ? 'سعرة' : 'cal'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAssignExisting} disabled={!selectedPlan || loading} className="w-full">
                {isRTL ? 'تعيين النظام الغذائي' : 'Assign Diet Plan'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{isRTL ? 'العنوان' : 'Title'}</label>
                <Input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder={isRTL ? 'نظام غذائي لإنقاص الوزن' : 'Weight loss diet plan'}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{isRTL ? 'الوصف' : 'Description'}</label>
                <Textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{isRTL ? 'إجمالي السعرات' : 'Total Calories'}</label>
                  <Input
                    type="number"
                    value={newPlan.calories}
                    onChange={(e) => setNewPlan({ ...newPlan, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{isRTL ? 'الحالة' : 'Status'}</label>
                  <Select value={newPlan.status} onValueChange={(v) => setNewPlan({ ...newPlan, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="مجاني">{isRTL ? 'مجاني' : 'Free'}</SelectItem>
                      <SelectItem value="مميز">{isRTL ? 'مميز' : 'Premium'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Meals Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-medium">{isRTL ? 'الوجبات' : 'Meals'}</label>
                  <Button variant="outline" size="sm" onClick={addMeal}>
                    <Plus className="h-4 w-4 mr-1" />
                    {isRTL ? 'إضافة وجبة' : 'Add Meal'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {meals.map((meal, index) => (
                    <div key={index} className="p-4 rounded-xl border border-border space-y-3">
                      <div className="flex gap-3 items-center">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeMeal(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={meal.time}
                            onChange={(e) => updateMeal(index, 'time', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <Input
                          value={meal.name}
                          onChange={(e) => updateMeal(index, 'name', e.target.value)}
                          placeholder={isRTL ? 'اسم الوجبة' : 'Meal name'}
                          className="flex-1"
                        />
                      </div>
                      <Textarea
                        value={meal.content}
                        onChange={(e) => updateMeal(index, 'content', e.target.value)}
                        placeholder={isRTL ? 'محتوى الوجبة...' : 'Meal content...'}
                        rows={2}
                      />
                      <Input
                        type="number"
                        value={meal.calories}
                        onChange={(e) => updateMeal(index, 'calories', parseInt(e.target.value) || 0)}
                        placeholder={isRTL ? 'السعرات' : 'Calories'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewPlan(false)} className="flex-1">
                  {isRTL ? 'رجوع' : 'Back'}
                </Button>
                <Button onClick={handleCreateAndAssign} disabled={!newPlan.name || loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isRTL ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
