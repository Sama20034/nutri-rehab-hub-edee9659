import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Video, FileText, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface OverviewSectionProps {
  isRTL: boolean;
  upcomingAppointments: number;
  completedSessions: number;
  doctorName?: string;
  onSectionChange?: (section: string) => void;
}

export const OverviewSection = ({ 
  isRTL, 
  upcomingAppointments, 
  completedSessions,
  doctorName,
  onSectionChange
}: OverviewSectionProps) => {
  const handleCardClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">
          {isRTL ? 'مرحباً بك!' : 'Welcome!'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'إليك نظرة عامة على حسابك' : "Here's an overview of your account"}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleCardClick('appointments')}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{upcomingAppointments}</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'مواعيد قادمة' : 'Upcoming Appointments'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleCardClick('exercises')}
          className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'نسبة التقدم' : 'Progress'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleCardClick('videos')}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Video className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">0/0</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'فيديو مكتمل' : 'Videos Completed'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('diet')}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {isRTL ? 'لا يوجد' : 'None'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'البرنامج العلاجي' : 'Treatment Program'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Doctor Info Card */}
      {doctorName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => handleCardClick('chat')}
          className="p-6 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{doctorName}</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'طبيبك المعالج' : 'Your Doctor'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-lg font-bold mb-4">
          {isRTL ? 'تقدمك العام' : 'Overall Progress'}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'نسبة الإنجاز' : 'Completion Rate'}
              </span>
              <span className="text-sm font-medium">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'الفيديوهات' : 'Videos'}
              </span>
              <span className="text-sm font-medium">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};