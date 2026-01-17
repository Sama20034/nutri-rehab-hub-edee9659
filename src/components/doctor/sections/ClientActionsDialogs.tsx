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
  full_name: string | null;
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
            {isRTL ? `الملف الصحي - ${client?.full_name || 'عميل'}` : `Health Profile - ${client?.full_name || 'Client'}`}
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

// Assign Exercises Dialog
interface ClientExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  notes: string;
}

interface AssignExercisesDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  exercises: Exercise[];
  doctorId: string;
}

export const AssignExercisesDialog = ({ open, onClose, client, exercises, doctorId }: AssignExercisesDialogProps) => {
  const { isRTL } = useLanguage();
  const [clientExercises, setClientExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for adding new exercise
  const [selectedExercise, setSelectedExercise] = useState('');
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
          notes: e.notes || ''
        }));
        setClientExercises(mapped);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
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
      notes
    };
    
    setClientExercises([...clientExercises, newExercise]);
    setShowAddDialog(false);
    resetForm();
    toast.success(isRTL ? 'تم إضافة التمرين' : 'Exercise added');
  };

  const resetForm = () => {
    setSelectedExercise('');
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
              {clientExercises.length === 0 ? (
                <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'لا توجد تمارين' : 'No exercises'}
                </p>
              ) : (
                clientExercises.map(ex => (
                  <div 
                    key={ex.id} 
                    className={`flex items-center justify-between p-3 rounded-lg bg-background border border-border ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Check className="h-5 w-5 text-primary" />
                      <div className={isRTL ? 'text-right' : ''}>
                        <p className="font-medium">{ex.exercise_name}</p>
                        {ex.notes && <p className="text-sm text-muted-foreground">{ex.notes}</p>}
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
                ))
              )}
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

  const toggleVideo = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSave = async () => {
    if (!client) return;
    setLoading(true);

    try {
      // Delete videos that were removed
      const toDelete = assignedVideos.filter(id => !selectedVideos.includes(id));
      if (toDelete.length > 0) {
        await supabase
          .from('client_videos')
          .delete()
          .eq('client_id', client.user_id)
          .in('video_id', toDelete);
      }

      // Add new videos
      const toAdd = selectedVideos.filter(id => !assignedVideos.includes(id));
      if (toAdd.length > 0) {
        const inserts = toAdd.map(videoId => ({
          client_id: client.user_id,
          video_id: videoId,
          assigned_by: doctorId
        }));
        await supabase.from('client_videos').insert(inserts);
      }

      toast.success(isRTL ? 'تم حفظ الفيديوهات' : 'Videos saved');
      onClose();
    } catch (error) {
      console.error('Error saving videos:', error);
      toast.error(isRTL ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'تعيين فيديوهات للعميل' : 'Assign Videos to Client'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
            {videos.map(video => {
              const isSelected = selectedVideos.includes(video.id);
              const thumbnail = video.thumbnail_url || getYouTubeThumbnail(video.url);
              
              return (
                <div
                  key={video.id}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleVideo(video.id)}
                >
                  <div className="aspect-video bg-muted">
                    {thumbnail ? (
                      <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className={`text-sm font-medium line-clamp-1 ${isRTL ? 'text-right' : ''}`}>
                      {video.title}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 ml-2" />
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Assign Diet Plan Dialog
interface AssignDietPlanDialogProps {
  open: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  dietPlans: DietPlan[];
  doctorId: string;
}

export const AssignDietPlanDialog = ({ open, onClose, client, dietPlans, doctorId }: AssignDietPlanDialogProps) => {
  const { isRTL } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && client) {
      fetchCurrentPlan();
    }
  }, [open, client]);

  const fetchCurrentPlan = async () => {
    if (!client) return;
    const { data } = await supabase
      .from('client_diet_plans')
      .select('diet_plan_id')
      .eq('client_id', client.user_id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (data) {
      setCurrentPlanId(data.diet_plan_id);
      setSelectedPlan(data.diet_plan_id);
    }
  };

  const handleSave = async () => {
    if (!client || !selectedPlan) return;
    setLoading(true);

    try {
      // Mark old plan as inactive
      if (currentPlanId) {
        await supabase
          .from('client_diet_plans')
          .update({ status: 'inactive' })
          .eq('client_id', client.user_id)
          .eq('diet_plan_id', currentPlanId);
      }

      // Add new plan
      if (selectedPlan !== currentPlanId) {
        await supabase.from('client_diet_plans').insert({
          client_id: client.user_id,
          diet_plan_id: selectedPlan,
          assigned_by: doctorId,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        });
      }

      toast.success(isRTL ? 'تم حفظ النظام الغذائي' : 'Diet plan saved');
      onClose();
    } catch (error) {
      console.error('Error saving diet plan:', error);
      toast.error(isRTL ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'تعيين نظام غذائي' : 'Assign Diet Plan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? 'اختر نظام غذائي' : 'Select diet plan'} />
            </SelectTrigger>
            <SelectContent>
              {dietPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSave} disabled={loading || !selectedPlan}>
            <Save className="h-4 w-4 ml-2" />
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};