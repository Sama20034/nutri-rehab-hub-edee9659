import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Video, 
  FileText, 
  User, 
  Utensils, 
  Dumbbell, 
  Stethoscope,
  PlayCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OverviewSectionProps {
  isRTL: boolean;
  upcomingAppointments: number;
  completedSessions: number;
  doctorName?: string;
  onSectionChange?: (section: string) => void;
  userName?: string;
  packageName?: string;
  subscriptionStatus?: string;
  hasMedicalFollowup?: boolean;
}

// Package names mapping
const packageNames: Record<string, { ar: string; en: string }> = {
  '6-weeks': { ar: 'نظام 6 أسابيع', en: '6 Weeks Program' },
  '90-days': { ar: 'تحدي 90 يوم', en: '90 Days Challenge' },
  '6-months': { ar: 'نظام 6 شهور', en: '6 Months Program' },
  '1-year': { ar: 'نظام سنة كاملة', en: 'Full Year Program' },
};

const quickAccessButtons = [
  { id: 'diet', labelAr: 'التغذية', labelEn: 'Nutrition', icon: Utensils, color: 'from-green-500 to-emerald-600' },
  { id: 'exercises', labelAr: 'التمارين', labelEn: 'Exercises', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { id: 'health-profile', labelAr: 'المتابعة الطبية', labelEn: 'Medical Follow-up', icon: Stethoscope, color: 'from-blue-500 to-indigo-600' },
  { id: 'videos', labelAr: 'المحتوى الخاص', labelEn: 'Personal Content', icon: PlayCircle, color: 'from-purple-500 to-pink-600' },
];

export const OverviewSection = ({ 
  isRTL, 
  upcomingAppointments, 
  completedSessions,
  doctorName,
  onSectionChange,
  userName,
  packageName,
  subscriptionStatus = 'active',
  hasMedicalFollowup = false
}: OverviewSectionProps) => {
  const handleCardClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const getPackageDisplayName = () => {
    if (!packageName) return isRTL ? 'لم يتم اختيار باقة' : 'No package selected';
    const pkg = packageNames[packageName];
    return pkg ? (isRTL ? pkg.ar : pkg.en) : packageName;
  };

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isRTL ? 'نشط' : 'Active'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {isRTL ? 'قيد الانتظار' : 'Pending'}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            {isRTL ? 'منتهي' : 'Expired'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {isRTL ? `مرحباً، ${userName || 'عميل'}! 👋` : `Welcome, ${userName || 'Client'}! 👋`}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'نتمنى لك يوماً رائعاً مليئاً بالإنجازات' : 'Wishing you a great day full of achievements'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </motion.div>

      {/* Subscription Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{isRTL ? 'نوع النظام' : 'Package Type'}</p>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{getPackageDisplayName()}</h2>
              {hasMedicalFollowup && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  {isRTL ? 'متابعة طبية' : 'Medical Follow-up'}
                </Badge>
              )}
            </div>
          </div>
          {doctorName && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'طبيبك المعالج' : 'Your Doctor'}</p>
                <p className="font-semibold">{doctorName}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Access Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-4">{isRTL ? 'الوصول السريع' : 'Quick Access'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccessButtons.map((btn, index) => (
            <motion.button
              key={btn.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCardClick(btn.id)}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${btn.color} text-white shadow-lg overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <btn.icon className="h-7 w-7" />
                </div>
                <span className="font-bold text-sm text-center">
                  {isRTL ? btn.labelAr : btn.labelEn}
                </span>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Personal Plan PDF Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-primary/10 border border-primary/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{isRTL ? 'خطتك الشخصية' : 'Your Personal Plan'}</h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'قم بتحميل أو عرض الخطة المخصصة لك' : 'Download or view your customized plan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              {isRTL ? 'عرض' : 'View'}
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              {isRTL ? 'تحميل PDF' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4">{isRTL ? 'إحصائياتك' : 'Your Stats'}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleCardClick('appointments')}
            className="p-5 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{upcomingAppointments}</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'مواعيد قادمة' : 'Upcoming'}
            </p>
          </div>

          <div
            onClick={() => handleCardClick('progress')}
            className="p-5 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold">{completedSessions}</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'جلسات مكتملة' : 'Completed'}
            </p>
          </div>

          <div
            onClick={() => handleCardClick('videos')}
            className="p-5 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">0/0</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'فيديوهات' : 'Videos'}
            </p>
          </div>

          <div
            onClick={() => handleCardClick('exercises')}
            className="p-5 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">0/0</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تمارين' : 'Exercises'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isRTL ? 'تقدمك العام' : 'Overall Progress'}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">0 {isRTL ? 'نقطة' : 'points'}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'التمارين' : 'Exercises'}
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
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'الالتزام بالنظام الغذائي' : 'Diet Compliance'}
              </span>
              <span className="text-sm font-medium">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      </motion.div>

      {/* Contact Doctor Button */}
      {doctorName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            className="w-full py-6 text-lg gap-3"
            onClick={() => handleCardClick('chat')}
          >
            <Stethoscope className="w-5 h-5" />
            {isRTL ? `تواصل مع ${doctorName}` : `Contact ${doctorName}`}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
