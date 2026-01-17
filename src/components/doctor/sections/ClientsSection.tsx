import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, FileText, Dumbbell, Utensils, Heart, TrendingUp, Video, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  HealthProfileDialog, 
  AssignExercisesDialog, 
  AssignVideosDialog, 
  AssignDietPlanDialog 
} from './ClientActionsDialogs';
import type { Exercise, DietPlan, Video as VideoType } from '@/hooks/useDoctorData';

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string;
  client?: ClientProfile;
}

interface ClientsSectionProps {
  clients: ClientAssignment[];
  exercises: Exercise[];
  videos: VideoType[];
  dietPlans: DietPlan[];
  doctorId: string;
  onViewClient?: (clientId: string) => void;
}

export const ClientsSection = ({ 
  clients, 
  exercises, 
  videos, 
  dietPlans, 
  doctorId,
  onViewClient 
}: ClientsSectionProps) => {
  const { isRTL } = useLanguage();
  
  // Dialog states
  const [healthProfileOpen, setHealthProfileOpen] = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [dietPlanOpen, setDietPlanOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const handleAction = (action: string, client: ClientProfile) => {
    setSelectedClient(client);
    switch (action) {
      case 'health':
        setHealthProfileOpen(true);
        break;
      case 'exercises':
        setExercisesOpen(true);
        break;
      case 'videos':
        setVideosOpen(true);
        break;
      case 'diet':
        setDietPlanOpen(true);
        break;
      case 'program':
        // Navigate to programs section or open create program dialog
        break;
      case 'progress':
        // Navigate to progress tracking
        break;
      case 'notes':
        // Navigate to notes section
        break;
      case 'message':
        // Open chat
        break;
    }
  };

  const actionButtons = [
    { id: 'program', label: isRTL ? 'إنشاء برنامج' : 'Create Program', icon: FileText, color: 'text-primary' },
    { id: 'exercises', label: isRTL ? 'التمارين' : 'Exercises', icon: Dumbbell, color: 'text-primary' },
    { id: 'progress', label: isRTL ? 'التقدم' : 'Progress', icon: TrendingUp, color: 'text-primary' },
    { id: 'diet', label: isRTL ? 'النظام الغذائي' : 'Diet Plan', icon: Utensils, color: 'text-primary' },
    { id: 'health', label: isRTL ? 'الملف الصحي' : 'Health Profile', icon: Heart, color: 'text-primary' },
    { id: 'videos', label: isRTL ? 'الفيديوهات' : 'Videos', icon: Video, color: 'text-primary' },
    { id: 'notes', label: isRTL ? 'الملاحظات' : 'Notes', icon: FileText, color: 'text-primary' },
    { id: 'message', label: isRTL ? 'مراسلة' : 'Message', icon: MessageCircle, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRTL ? 'عملائي' : 'My Clients'}</h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إدارة ومتابعة العملاء المسندين إليك' : 'Manage and follow up with assigned clients'}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">
            {isRTL ? 'لا يوجد عملاء مسندين حالياً' : 'No clients assigned yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              {/* Client Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {assignment.client?.full_name || (isRTL ? 'غير معروف' : 'Unknown')}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{assignment.client?.phone || (isRTL ? 'لا يوجد رقم' : 'No phone')}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-muted rounded-full text-sm">
                  {isRTL ? 'بدون برنامج' : 'No Program'}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {isRTL ? 'التقدم' : 'Progress'}
                  </span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {actionButtons.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => assignment.client && handleAction(action.id, assignment.client)}
                    >
                      <Icon className={`h-4 w-4 ${action.color}`} />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <HealthProfileDialog 
        open={healthProfileOpen} 
        onClose={() => setHealthProfileOpen(false)} 
        client={selectedClient} 
      />
      
      <AssignExercisesDialog 
        open={exercisesOpen} 
        onClose={() => setExercisesOpen(false)} 
        client={selectedClient}
        exercises={exercises}
        doctorId={doctorId}
      />
      
      <AssignVideosDialog 
        open={videosOpen} 
        onClose={() => setVideosOpen(false)} 
        client={selectedClient}
        videos={videos}
        doctorId={doctorId}
      />
      
      <AssignDietPlanDialog 
        open={dietPlanOpen} 
        onClose={() => setDietPlanOpen(false)} 
        client={selectedClient}
        dietPlans={dietPlans}
        doctorId={doctorId}
      />
    </div>
  );
};
