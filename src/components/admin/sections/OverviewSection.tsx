import { motion } from 'framer-motion';
import { 
  Clock, Users, Stethoscope, CheckCircle, TrendingUp, UserPlus 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

interface OverviewSectionProps {
  pendingCount: number;
  clientsCount: number;
  doctorsCount: number;
  approvedCount: number;
  activeClientsCount: number;
  activeDoctorsCount: number;
  onQuickAction: (section: string) => void;
}

export const OverviewSection = ({
  pendingCount,
  clientsCount,
  doctorsCount,
  approvedCount,
  activeClientsCount,
  activeDoctorsCount,
  onQuickAction
}: OverviewSectionProps) => {
  const { isRTL } = useLanguage();

  const stats = [
    {
      icon: Stethoscope,
      value: doctorsCount,
      label: isRTL ? 'إجمالي الأطباء' : 'Total Doctors',
      color: 'bg-primary/20 text-primary',
      iconBg: 'bg-primary/20',
      section: 'doctors'
    },
    {
      icon: Users,
      value: clientsCount,
      label: isRTL ? 'إجمالي العملاء' : 'Total Clients',
      color: 'bg-green-500/20 text-green-500',
      iconBg: 'bg-green-500/20',
      section: 'clients'
    },
    {
      icon: Clock,
      value: pendingCount,
      label: isRTL ? 'طلبات معلقة' : 'Pending Requests',
      color: 'bg-yellow-500/20 text-yellow-500',
      iconBg: 'bg-yellow-500/20',
      section: 'pending'
    },
    {
      icon: TrendingUp,
      value: activeDoctorsCount,
      label: isRTL ? 'أطباء نشطين' : 'Active Doctors',
      color: 'bg-purple-500/20 text-purple-500',
      iconBg: 'bg-purple-500/20',
      section: 'doctors'
    },
    {
      icon: UserPlus,
      value: activeClientsCount,
      label: isRTL ? 'عملاء نشطين' : 'Active Clients',
      color: 'bg-accent/20 text-accent',
      iconBg: 'bg-accent/20',
      section: 'clients'
    },
    {
      icon: CheckCircle,
      value: approvedCount,
      label: isRTL ? 'مستخدمين موافق عليهم' : 'Approved Users',
      color: 'bg-green-500/20 text-green-500',
      iconBg: 'bg-green-500/20',
      section: 'clients'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl font-bold mb-1">{isRTL ? 'نظرة عامة' : 'Overview'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'إحصائيات سريعة عن المنصة' : 'Quick platform statistics'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onQuickAction(stat.section)}
            >
              <Card className="bg-card border-border hover:border-primary/30 hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
                  </div>
                  <div className={isRTL ? 'text-right flex-1' : 'text-left flex-1'}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
          </div>
          
          {pendingCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onQuickAction('pending')}
              className="w-full p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-yellow-500" />
                <span className="text-yellow-500 font-medium">
                  {pendingCount} {isRTL ? 'طلب معلق' : 'pending request(s)'}
                </span>
              </div>
            </motion.button>
          )}

          {pendingCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>{isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
