import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Play, Check, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientExercise {
  id: string;
  exercise_id: string;
  day_of_week: number;
  sets: number | null;
  reps: number | null;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
  exercise: {
    id: string;
    name: string;
    description: string | null;
    video_url: string | null;
  };
}

interface ExercisesSectionProps {
  isRTL: boolean;
  clientId: string;
}

const DAYS_OF_WEEK_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_OF_WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ExercisesSection = ({ isRTL, clientId }: ExercisesSectionProps) => {
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const fetchExercises = async () => {
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
          completed,
          completed_at,
          exercise:exercises(id, name, description, video_url)
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      
      // Filter out any exercises with null exercise data
      const validExercises = (data || []).filter(e => e.exercise !== null) as ClientExercise[];
      setExercises(validExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [clientId]);

  const handleToggleComplete = async (exerciseId: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('client_exercises')
        .update({ 
          completed: !currentCompleted,
          completed_at: !currentCompleted ? new Date().toISOString() : null
        })
        .eq('id', exerciseId);

      if (error) throw error;

      setExercises(prev => prev.map(e => 
        e.id === exerciseId 
          ? { ...e, completed: !currentCompleted, completed_at: !currentCompleted ? new Date().toISOString() : null }
          : e
      ));

      toast.success(isRTL ? 'تم تحديث حالة التمرين' : 'Exercise status updated');
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleWatchVideo = (videoUrl: string | null) => {
    if (videoUrl) {
      setSelectedVideoUrl(videoUrl);
      setIsPlayerOpen(true);
    }
  };

  // Group exercises by day
  const exercisesByDay = DAYS_OF_WEEK_AR.reduce((acc, _, index) => {
    acc[index] = exercises.filter(e => e.day_of_week === index);
    return acc;
  }, {} as Record<number, ClientExercise[]>);

  // Calculate progress
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(e => e.completed).length;
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  // Get days that have exercises
  const daysWithExercises = Object.entries(exercisesByDay)
    .filter(([_, dayExercises]) => dayExercises.length > 0)
    .map(([day, dayExercises]) => ({ day: parseInt(day), exercises: dayExercises }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Dumbbell className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isRTL ? 'تماريني' : 'My Exercises'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {isRTL ? 'سيتم عرض التمارين المخصصة لك هنا' : 'Your personalized exercises will be displayed here'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold mb-2">
          {isRTL ? 'تماريني' : 'My Exercises'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'قم بإكمال التمارين المخصصة لك من قبل الطبيب' : 'Complete the exercises assigned to you by your doctor'}
        </p>
      </div>

      {/* Weekly Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Dumbbell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">
              {isRTL ? 'التقدم الأسبوعي' : 'Weekly Progress'}
            </h2>
          </div>
          <span className="text-primary font-bold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-3" />
        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL 
            ? `أكملت ${completedExercises} من ${totalExercises} تمرين`
            : `Completed ${completedExercises} of ${totalExercises} exercises`
          }
        </p>
      </div>

      {/* Exercises by Day */}
      <div className="space-y-4">
        {daysWithExercises.map(({ day, exercises: dayExercises }) => {
          const dayName = isRTL ? DAYS_OF_WEEK_AR[day] : DAYS_OF_WEEK_EN[day];
          const dayCompleted = dayExercises.filter(e => e.completed).length;
          const dayTotal = dayExercises.length;

          return (
            <div key={day} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Day Header */}
              <div className={`p-4 border-b border-border flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{dayName}</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {dayCompleted}/{dayTotal}
                </Badge>
              </div>

              {/* Day Exercises */}
              <div className="divide-y divide-border">
                {dayExercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className={`p-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => handleToggleComplete(exercise.id, exercise.completed)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          exercise.completed 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {exercise.completed && <Check className="h-4 w-4" />}
                      </button>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className={`font-medium ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {exercise.exercise?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets && exercise.reps && (
                            <span>{exercise.sets} × {exercise.reps} {isRTL ? 'تكرار' : 'reps'}</span>
                          )}
                          {exercise.duration_minutes && (
                            <span> • {exercise.duration_minutes} {isRTL ? 'سعرة' : 'cal'}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {exercise.exercise?.video_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWatchVideo(exercise.exercise?.video_url)}
                        className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <Play className="h-4 w-4" />
                        {isRTL ? 'شاهد' : 'Watch'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedVideoUrl && (
            <div className="aspect-video">
              {isYouTubeUrl(selectedVideoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideoUrl) || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideoUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
