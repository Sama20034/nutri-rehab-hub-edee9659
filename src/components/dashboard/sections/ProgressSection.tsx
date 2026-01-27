import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Trophy, Target, Dumbbell, Utensils, 
  Calendar, MessageSquare, Award, Star, Flame,
  CheckCircle2, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientProgressData {
  id: string;
  date: string;
  exercises_completed: number;
  exercises_total: number;
  meals_completed: number;
  meals_total: number;
  progress_percentage: number;
  notes: string | null;
  admin_feedback: string | null;
}

interface ClientExercise {
  id: string;
  completed: boolean;
  exercise: {
    name: string;
  } | null;
}

interface ProgressSectionProps {
  isRTL: boolean;
  clientId: string;
}

export const ProgressSection = ({ isRTL, clientId }: ProgressSectionProps) => {
  const [todayProgress, setTodayProgress] = useState<ClientProgressData | null>(null);
  const [weekProgress, setWeekProgress] = useState<ClientProgressData[]>([]);
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's progress
      const { data: todayData } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', today)
        .maybeSingle();

      // Get last 7 days progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weekData } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', clientId)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Get exercises
      const { data: exercisesData } = await supabase
        .from('client_exercises')
        .select(`
          id, completed,
          exercise:exercises(name)
        `)
        .eq('client_id', clientId);

      setTodayProgress(todayData as ClientProgressData | null);
      setWeekProgress((weekData || []) as ClientProgressData[]);
      
      const validExercises = (exercisesData || []).filter(e => e.exercise !== null) as ClientExercise[];
      setExercises(validExercises);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedExercises = exercises.filter(e => e.completed).length;
  const totalExercises = exercises.length;
  const exerciseProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const overallProgress = todayProgress?.progress_percentage || exerciseProgress;

  const getProgressLevel = (progress: number) => {
    if (progress >= 80) return { level: isRTL ? 'ممتاز!' : 'Excellent!', color: 'text-green-500', emoji: '🏆' };
    if (progress >= 60) return { level: isRTL ? 'جيد جداً' : 'Very Good', color: 'text-blue-500', emoji: '⭐' };
    if (progress >= 40) return { level: isRTL ? 'جيد' : 'Good', color: 'text-yellow-500', emoji: '💪' };
    if (progress >= 20) return { level: isRTL ? 'يمكنك أكثر' : 'You Can Do More', color: 'text-orange-500', emoji: '🔥' };
    return { level: isRTL ? 'ابدأ الآن!' : 'Start Now!', color: 'text-muted-foreground', emoji: '🚀' };
  };

  const progressLevel = getProgressLevel(overallProgress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-primary" />
          {isRTL ? 'متابعة التقدم' : 'Progress Tracking'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'تابع تقدمك في التمارين والنظام الغذائي' : 'Track your progress in exercises and diet'}
        </p>
      </div>

      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Progress Circle */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * overallProgress) / 100}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{overallProgress}%</span>
                <span className="text-sm text-muted-foreground">{isRTL ? 'التقدم' : 'Progress'}</span>
              </div>
            </div>

            {/* Progress Info */}
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{progressLevel.emoji}</span>
                <h2 className={`text-2xl font-bold ${progressLevel.color}`}>
                  {progressLevel.level}
                </h2>
              </div>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'استمر في العمل الجيد! كل تمرين تكمله يقربك من هدفك.'
                  : 'Keep up the great work! Every exercise you complete brings you closer to your goal.'}
              </p>

              {/* Quick Stats */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {completedExercises}/{totalExercises} {isRTL ? 'تمرين' : 'exercises'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {weekProgress.length} {isRTL ? 'أيام نشاط' : 'active days'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Feedback */}
      {todayProgress?.admin_feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                {isRTL ? 'ملاحظات من المدرب' : 'Feedback from Coach'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{todayProgress.admin_feedback}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Exercises Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Dumbbell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'التمارين' : 'Exercises'}</p>
                <p className="text-xl font-bold">{exerciseProgress}%</p>
              </div>
            </div>
            <Progress value={exerciseProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL 
                ? `أكملت ${completedExercises} من ${totalExercises} تمرين`
                : `Completed ${completedExercises} of ${totalExercises} exercises`}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'نشاط الأسبوع' : 'Weekly Activity'}</p>
                <p className="text-xl font-bold">{weekProgress.length}/7 {isRTL ? 'أيام' : 'days'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => {
                const hasActivity = weekProgress.some(p => {
                  const d = new Date(p.date);
                  const today = new Date();
                  const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                  return diff === 6 - i;
                });
                return (
                  <div 
                    key={i} 
                    className={`flex-1 h-8 rounded ${hasActivity ? 'bg-green-500' : 'bg-muted'}`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievement */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'المستوى' : 'Level'}</p>
                <p className="text-xl font-bold">{progressLevel.level}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${
                    star <= Math.ceil(overallProgress / 20) 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercises List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {isRTL ? 'التمارين المعينة' : 'Assigned Exercises'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isRTL ? 'لا توجد تمارين معينة بعد' : 'No exercises assigned yet'}
            </p>
          ) : (
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    exercise.completed 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-muted'
                  }`}
                >
                  <span className={exercise.completed ? 'line-through text-muted-foreground' : ''}>
                    {exercise.exercise?.name}
                  </span>
                  {exercise.completed ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {isRTL ? 'مكتمل' : 'Done'}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly History */}
      {weekProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {isRTL ? 'سجل التقدم' : 'Progress History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekProgress.map((progress) => (
                <div 
                  key={progress.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(progress.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress.progress_percentage} className="w-24 h-2" />
                    <span className="font-bold text-sm w-12 text-right">{progress.progress_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
