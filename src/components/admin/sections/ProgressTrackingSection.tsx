import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Check, Dumbbell, Utensils, 
  Calendar, MessageSquare, Send, Search, Filter,
  ChevronDown, ChevronUp, Award, Target, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientProgress {
  id: string;
  client_id: string;
  date: string;
  exercises_completed: number;
  exercises_total: number;
  meals_completed: number;
  meals_total: number;
  progress_percentage: number;
  notes: string | null;
  admin_feedback: string | null;
  updated_by: string | null;
}

interface ClientExercise {
  id: string;
  client_id: string;
  exercise_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    category: string | null;
  } | null;
}

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  selected_package: string | null;
}

interface ClientWithProgress {
  profile: ClientProfile;
  exercises: ClientExercise[];
  todayProgress: ClientProgress | null;
  overallProgress: number;
}

export const ProgressTrackingSection = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; clientId: string; clientName: string } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchClientsProgress = useCallback(async () => {
    try {
      // Get all approved clients
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, selected_package')
        .eq('status', 'approved');

      if (profilesError) throw profilesError;

      // Get client roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      const clientUserIds = roles?.map(r => r.user_id) || [];
      const clientProfiles = (profiles || []).filter(p => clientUserIds.includes(p.user_id));

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch data for each client
      const clientsWithProgress = await Promise.all(
        clientProfiles.map(async (profile) => {
          // Get client exercises
          const { data: exercises } = await supabase
            .from('client_exercises')
            .select(`
              id, client_id, exercise_id, completed, completed_at, notes,
              exercise:exercises(id, name, category)
            `)
            .eq('client_id', profile.user_id);

          // Get today's progress record
          const { data: todayProgress } = await supabase
            .from('client_progress')
            .select('*')
            .eq('client_id', profile.user_id)
            .eq('date', today)
            .maybeSingle();

          const validExercises = (exercises || []).filter(e => e.exercise !== null) as ClientExercise[];
          const completedExercises = validExercises.filter(e => e.completed).length;
          const totalExercises = validExercises.length;
          const overallProgress = totalExercises > 0 
            ? Math.round((completedExercises / totalExercises) * 100) 
            : 0;

          return {
            profile,
            exercises: validExercises,
            todayProgress: todayProgress as ClientProgress | null,
            overallProgress
          };
        })
      );

      setClients(clientsWithProgress);
    } catch (error) {
      console.error('Error fetching clients progress:', error);
      toast.error(isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    fetchClientsProgress();
  }, [fetchClientsProgress]);

  const handleSendFeedback = async () => {
    if (!feedbackDialog || !feedbackText.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // Upsert progress with admin feedback
      const { error } = await supabase
        .from('client_progress')
        .upsert({
          client_id: feedbackDialog.clientId,
          date: today,
          admin_feedback: feedbackText,
          updated_by: user?.id
        }, {
          onConflict: 'client_id,date'
        });

      if (error) throw error;

      // Create notification for client
      await supabase.from('notifications').insert({
        user_id: feedbackDialog.clientId,
        title: isRTL ? 'ملاحظات جديدة من الأدمن' : 'New Feedback from Admin',
        message: feedbackText,
        type: 'progress_feedback'
      });

      toast.success(isRTL ? 'تم إرسال الملاحظات' : 'Feedback sent');
      setFeedbackDialog(null);
      setFeedbackText('');
      fetchClientsProgress();
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error(isRTL ? 'خطأ في الإرسال' : 'Error sending feedback');
    }
  };

  const handleUpdateProgress = async (clientId: string, progressIncrease: number) => {
    const today = new Date().toISOString().split('T')[0];
    const client = clients.find(c => c.profile.user_id === clientId);
    
    if (!client) return;

    const currentProgress = client.todayProgress?.progress_percentage || 0;
    const newProgress = Math.min(100, currentProgress + progressIncrease);

    try {
      const { error } = await supabase
        .from('client_progress')
        .upsert({
          client_id: clientId,
          date: today,
          progress_percentage: newProgress,
          exercises_completed: client.exercises.filter(e => e.completed).length,
          exercises_total: client.exercises.length,
          updated_by: user?.id
        }, {
          onConflict: 'client_id,date'
        });

      if (error) throw error;

      // Notify client
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: isRTL ? 'تم تحديث تقدمك!' : 'Your Progress Updated!',
        message: isRTL 
          ? `زاد تقدمك بنسبة ${progressIncrease}%! استمر في العمل الجيد!`
          : `Your progress increased by ${progressIncrease}%! Keep up the good work!`,
        type: 'progress_update'
      });

      toast.success(isRTL ? 'تم تحديث التقدم' : 'Progress updated');
      fetchClientsProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(isRTL ? 'خطأ في التحديث' : 'Error updating');
    }
  };

  const filteredClients = clients.filter(c => 
    c.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBadge = (progress: number) => {
    if (progress >= 80) return { label: isRTL ? 'ممتاز' : 'Excellent', className: 'bg-green-500' };
    if (progress >= 50) return { label: isRTL ? 'جيد' : 'Good', className: 'bg-yellow-500' };
    if (progress >= 20) return { label: isRTL ? 'يحتاج تحسين' : 'Needs Work', className: 'bg-orange-500' };
    return { label: isRTL ? 'غير نشط' : 'Inactive', className: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Summary stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.overallProgress > 0).length;
  const avgProgress = totalClients > 0 
    ? Math.round(clients.reduce((sum, c) => sum + c.overallProgress, 0) / totalClients)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-primary" />
          {isRTL ? 'متابعة التقدم' : 'Progress Tracking'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'تتبع تقدم العملاء في التمارين والنظام الغذائي' : 'Track client progress in exercises and diet'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClients}</p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeClients}</p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'عملاء نشطين' : 'Active Clients'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'متوسط التقدم' : 'Avg Progress'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={isRTL ? 'البحث عن عميل...' : 'Search clients...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isRTL ? 'لا يوجد عملاء' : 'No clients found'}
            </p>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const isExpanded = expandedClient === client.profile.user_id;
            const progressBadge = getProgressBadge(client.overallProgress);
            const completedExercises = client.exercises.filter(e => e.completed).length;
            
            return (
              <Collapsible 
                key={client.profile.user_id}
                open={isExpanded}
                onOpenChange={() => setExpandedClient(isExpanded ? null : client.profile.user_id)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {client.profile.avatar_url ? (
                              <img 
                                src={client.profile.avatar_url} 
                                alt={client.profile.full_name || ''} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">{client.profile.full_name || 'بدون اسم'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {client.profile.selected_package || 'basic'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Progress */}
                          <div className="hidden md:flex items-center gap-3">
                            <div className="w-32">
                              <Progress value={client.overallProgress} className="h-2" />
                            </div>
                            <span className={`font-bold ${getProgressColor(client.overallProgress)}`}>
                              {client.overallProgress}%
                            </span>
                          </div>
                          
                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Dumbbell className="h-3 w-3" />
                              {completedExercises}/{client.exercises.length}
                            </Badge>
                          </div>
                          
                          <Badge className={progressBadge.className}>
                            {progressBadge.label}
                          </Badge>
                          
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t p-4 bg-muted/30">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Exercises */}
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Dumbbell className="h-4 w-4" />
                              {isRTL ? 'التمارين المعينة' : 'Assigned Exercises'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            {client.exercises.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? 'لا توجد تمارين معينة' : 'No exercises assigned'}
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {client.exercises.map((exercise) => (
                                  <div 
                                    key={exercise.id}
                                    className={`flex items-center justify-between p-2 rounded-lg ${
                                      exercise.completed ? 'bg-green-500/10' : 'bg-muted'
                                    }`}
                                  >
                                    <span className={`text-sm ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {exercise.exercise?.name}
                                    </span>
                                    {exercise.completed && (
                                      <Check className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              {isRTL ? 'إجراءات الأدمن' : 'Admin Actions'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2 space-y-3">
                            {/* Progress Update Buttons */}
                            <div>
                              <Label className="text-xs text-muted-foreground mb-2 block">
                                {isRTL ? 'زيادة التقدم' : 'Increase Progress'}
                              </Label>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateProgress(client.profile.user_id, 5)}
                                >
                                  +5%
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateProgress(client.profile.user_id, 10)}
                                >
                                  +10%
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateProgress(client.profile.user_id, 25)}
                                >
                                  +25%
                                </Button>
                              </div>
                            </div>

                            {/* Send Feedback */}
                            <Button 
                              className="w-full gap-2"
                              variant="secondary"
                              onClick={() => setFeedbackDialog({
                                open: true,
                                clientId: client.profile.user_id,
                                clientName: client.profile.full_name || ''
                              })}
                            >
                              <MessageSquare className="h-4 w-4" />
                              {isRTL ? 'إرسال ملاحظات' : 'Send Feedback'}
                            </Button>

                            {/* Last Feedback */}
                            {client.todayProgress?.admin_feedback && (
                              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {isRTL ? 'آخر ملاحظات:' : 'Last feedback:'}
                                </p>
                                <p className="text-sm">{client.todayProgress.admin_feedback}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog?.open || false} onOpenChange={(open) => !open && setFeedbackDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? `إرسال ملاحظات لـ ${feedbackDialog?.clientName}` : `Send Feedback to ${feedbackDialog?.clientName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'الملاحظات' : 'Feedback'}</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={isRTL ? 'اكتب ملاحظاتك هنا...' : 'Write your feedback here...'}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog(null)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSendFeedback} className="gap-2">
              <Send className="h-4 w-4" />
              {isRTL ? 'إرسال' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
