import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Play, 
  Check, 
  Target, 
  Clock, 
  Flame, 
  Star,
  Info,
  Repeat,
  AlertCircle,
  Stethoscope,
  Trophy
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  category: string | null;
  difficulty: string | null;
  image_url: string | null;
}

interface ClientExercise {
  id: string;
  exercise_id: string;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  exercise: Exercise | null;
}

interface ExercisesSectionProps {
  isRTL: boolean;
  clientId: string;
}

// Exercise categories/goals
const exerciseCategories = [
  { id: 'all', label: 'الكل', labelEn: 'All', icon: Dumbbell },
  { id: 'strength', label: 'القوة', labelEn: 'Strength', icon: Trophy },
  { id: 'cardio', label: 'كارديو', labelEn: 'Cardio', icon: Flame },
  { id: 'flexibility', label: 'المرونة', labelEn: 'Flexibility', icon: Target },
  { id: 'rehabilitation', label: 'التأهيل', labelEn: 'Rehabilitation', icon: Stethoscope },
];

export const ExercisesSection = ({ isRTL, clientId }: ExercisesSectionProps) => {
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<ClientExercise | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('client_exercises')
        .select(`
          id,
          exercise_id,
          notes,
          completed,
          completed_at,
          created_at,
          exercise:exercises(id, name, description, video_url, duration_minutes, category, difficulty, image_url)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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

  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    // Handle /file/d/FILE_ID/view or /file/d/FILE_ID/preview patterns
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    // Handle ?id=FILE_ID pattern
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
    return url;
  };

  const handleWatchVideo = (videoUrl: string | null) => {
    if (videoUrl) {
      setSelectedVideoUrl(videoUrl);
      setIsPlayerOpen(true);
    }
  };

  const handleViewDetails = (exercise: ClientExercise) => {
    setSelectedExercise(exercise);
    setIsDetailsOpen(true);
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{isRTL ? 'سهل' : 'Easy'}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{isRTL ? 'متوسط' : 'Medium'}</Badge>;
      case 'hard':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{isRTL ? 'صعب' : 'Hard'}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const cat = exerciseCategories.find(c => c.id === category);
    return cat ? (isRTL ? cat.label : cat.labelEn) : (isRTL ? 'عام' : 'General');
  };

  // Filter exercises by category
  const filteredExercises = activeCategory === 'all' 
    ? exercises 
    : exercises.filter(e => e.exercise?.category === activeCategory);

  // Get today's exercise (first uncompleted exercise)
  const todayExercise = exercises.find(e => !e.completed);

  // Calculate progress
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(e => e.completed).length;
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

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
          {isRTL ? 'سيتم عرض التمارين المخصصة لك هنا بعد تعيينها من قبل الطبيب' : 'Your personalized exercises will be displayed here after being assigned by your doctor'}
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

      {/* Today's Exercise - Featured */}
      {todayExercise && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30"
        >
          <div className="absolute top-0 left-0 right-0 bg-primary/90 px-4 py-2">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Star className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">
                {isRTL ? 'تمرين اليوم' : "Today's Exercise"}
              </span>
            </div>
          </div>
          
          <div className="pt-12 p-6">
            <div className={`flex flex-col md:flex-row gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              {/* Exercise Image/Video Thumbnail */}
              <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {todayExercise.exercise?.image_url ? (
                  <img 
                    src={todayExercise.exercise.image_url} 
                    alt={todayExercise.exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {todayExercise.exercise?.video_url && (
                  <button
                    onClick={() => handleWatchVideo(todayExercise.exercise?.video_url || null)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary-foreground ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* Exercise Info */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-2 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary">
                    {getCategoryLabel(todayExercise.exercise?.category || null)}
                  </Badge>
                  {getDifficultyBadge(todayExercise.exercise?.difficulty || null)}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{todayExercise.exercise?.name}</h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {todayExercise.exercise?.description}
                </p>

                <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {todayExercise.exercise?.duration_minutes && (
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="h-4 w-4" />
                      <span>{todayExercise.exercise.duration_minutes} {isRTL ? 'دقيقة' : 'min'}</span>
                    </div>
                  )}
                </div>

                {/* Medical/Sport Notes */}
                {todayExercise.notes && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm text-yellow-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {todayExercise.notes}
                    </p>
                  </div>
                )}

                <div className={`flex gap-3 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    onClick={() => handleToggleComplete(todayExercise.id, todayExercise.completed)}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {isRTL ? 'إكمال التمرين' : 'Complete Exercise'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(todayExercise)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">
              {isRTL ? 'تقدمك في التمارين' : 'Your Exercise Progress'}
            </h2>
          </div>
          <span className="text-primary font-bold text-lg">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-3" />
        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL 
            ? `أكملت ${completedExercises} من ${totalExercises} تمرين`
            : `Completed ${completedExercises} of ${totalExercises} exercises`
          }
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className={`w-full flex-wrap h-auto gap-2 bg-transparent ${isRTL ? 'flex-row-reverse' : ''}`}>
            {exerciseCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex-1 min-w-[100px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? category.label : category.labelEn}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isRTL ? 'لا توجد تمارين في هذه الفئة' : 'No exercises in this category'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredExercises.map((exercise) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative p-4 rounded-xl border transition-all ${
                      exercise.completed 
                        ? 'bg-muted/50 border-border' 
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {exercise.exercise?.image_url ? (
                          <img 
                            src={exercise.exercise.image_url} 
                            alt={exercise.exercise.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {exercise.exercise?.video_url && (
                          <button
                            onClick={() => handleWatchVideo(exercise.exercise?.video_url || null)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                          >
                            <Play className="h-6 w-6 text-white" />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {getDifficultyBadge(exercise.exercise?.difficulty || null)}
                          {exercise.completed && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {isRTL ? 'مكتمل' : 'Done'}
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className={`font-semibold mb-1 ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {exercise.exercise?.name}
                        </h4>
                        
                        <div className={`flex items-center gap-3 text-xs text-muted-foreground mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {exercise.exercise?.duration_minutes && (
                            <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Clock className="h-3 w-3" />
                              {exercise.exercise.duration_minutes} {isRTL ? 'د' : 'm'}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Target className="h-3 w-3" />
                            {getCategoryLabel(exercise.exercise?.category || null)}
                          </span>
                        </div>

                        {/* Notes indicator */}
                        {exercise.notes && (
                          <div className={`flex items-center gap-1 text-xs text-yellow-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <AlertCircle className="h-3 w-3" />
                            <span>{isRTL ? 'يوجد ملاحظات' : 'Has notes'}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
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
                        <button
                          onClick={() => handleViewDetails(exercise)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
              ) : isGoogleDriveUrl(selectedVideoUrl) ? (
                <iframe
                  src={getGoogleDriveEmbedUrl(selectedVideoUrl)}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
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

      {/* Exercise Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedExercise && (
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* Header */}
              <div>
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary">
                    {getCategoryLabel(selectedExercise.exercise?.category || null)}
                  </Badge>
                  {getDifficultyBadge(selectedExercise.exercise?.difficulty || null)}
                </div>
                <h2 className="text-2xl font-bold">{selectedExercise.exercise?.name}</h2>
              </div>

              {/* Video/Image */}
              {(selectedExercise.exercise?.video_url || selectedExercise.exercise?.image_url) && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                  {selectedExercise.exercise?.image_url && !isPlayerOpen && (
                    <img 
                      src={selectedExercise.exercise.image_url} 
                      alt={selectedExercise.exercise.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {selectedExercise.exercise?.video_url && (
                    <button
                      onClick={() => handleWatchVideo(selectedExercise.exercise?.video_url || null)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedExercise.exercise?.description && (
                <div>
                  <h3 className="font-semibold mb-2">{isRTL ? 'الوصف' : 'Description'}</h3>
                  <p className="text-muted-foreground">{selectedExercise.exercise.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedExercise.exercise?.duration_minutes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className={`flex items-center gap-2 text-muted-foreground mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{isRTL ? 'المدة' : 'Duration'}</span>
                    </div>
                    <p className="font-semibold">
                      {selectedExercise.exercise.duration_minutes} {isRTL ? 'دقيقة' : 'minutes'}
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className={`flex items-center gap-2 text-muted-foreground mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Target className="h-4 w-4" />
                    <span className="text-sm">{isRTL ? 'الهدف' : 'Goal'}</span>
                  </div>
                  <p className="font-semibold">
                    {getCategoryLabel(selectedExercise.exercise?.category || null)}
                  </p>
                </div>
              </div>

              {/* Medical/Sport Notes */}
              {selectedExercise.notes && (
                <div className={`p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Stethoscope className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-yellow-500">
                      {isRTL ? 'ملاحظات طبية ورياضية' : 'Medical & Sport Notes'}
                    </h3>
                  </div>
                  <p className="text-yellow-200">{selectedExercise.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  onClick={() => {
                    handleToggleComplete(selectedExercise.id, selectedExercise.completed);
                    setIsDetailsOpen(false);
                  }}
                  className="flex-1 gap-2"
                  variant={selectedExercise.completed ? "outline" : "default"}
                >
                  {selectedExercise.completed ? (
                    <>
                      <Repeat className="h-4 w-4" />
                      {isRTL ? 'إعادة التمرين' : 'Redo Exercise'}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {isRTL ? 'إكمال التمرين' : 'Complete Exercise'}
                    </>
                  )}
                </Button>
                {selectedExercise.exercise?.video_url && (
                  <Button
                    variant="outline"
                    onClick={() => handleWatchVideo(selectedExercise.exercise?.video_url || null)}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isRTL ? 'شاهد الفيديو' : 'Watch Video'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
