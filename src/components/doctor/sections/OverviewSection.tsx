import { motion } from 'framer-motion';
import { Calendar, Users, Video, FileText, MessageCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OverviewSectionProps {
  doctorName: string;
  clientsCount: number;
  programsCount: number;
  videosCount: number;
  todayAppointmentsCount: number;
  pendingAppointmentsCount: number;
  messagesCount: number;
  onSectionChange?: (section: string) => void;
}

export const OverviewSection = ({
  doctorName,
  clientsCount,
  programsCount,
  videosCount,
  todayAppointmentsCount,
  pendingAppointmentsCount,
  messagesCount,
  onSectionChange
}: OverviewSectionProps) => {
  const { isRTL } = useLanguage();

  const handleCardClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const stats = [
    {
      label: isRTL ? 'عملائي' : 'My Clients',
      value: clientsCount,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      section: 'clients'
    },
    {
      label: isRTL ? 'برامج نشطة' : 'Active Programs',
      value: programsCount,
      icon: FileText,
      color: 'bg-emerald-500',
      bgColor: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      section: 'programs'
    },
    {
      label: isRTL ? 'فيديو' : 'Videos',
      value: videosCount,
      icon: Video,
      color: 'bg-purple-500',
      bgColor: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      section: 'videos'
    },
    {
      label: isRTL ? 'مواعيد اليوم' : "Today's Appointments",
      value: todayAppointmentsCount,
      icon: Calendar,
      color: 'bg-orange-500',
      bgColor: 'from-orange-500/20 to-orange-500/5',
      borderColor: 'border-orange-500/20',
      section: 'appointments'
    },
    {
      label: isRTL ? 'رسائل جديدة' : 'New Messages',
      value: messagesCount,
      icon: MessageCircle,
      color: 'bg-pink-500',
      bgColor: 'from-pink-500/20 to-pink-500/5',
      borderColor: 'border-pink-500/20',
      section: 'conversations'
    },
    {
      label: isRTL ? 'متوسط التقدم' : 'Average Progress',
      value: '0%',
      icon: TrendingUp,
      color: 'bg-teal-500',
      bgColor: 'from-teal-500/20 to-teal-500/5',
      borderColor: 'border-teal-500/20',
      section: 'clients'
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">
          {isRTL ? `مرحباً دكتور!` : `Welcome Doctor!`}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'إليك نظرة عامة على نشاطك' : 'Here is an overview of your activity'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(stat.section)}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};