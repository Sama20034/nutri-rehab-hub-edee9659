import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Clock, Video, Dumbbell, 
  Utensils, FileText, MessageCircle, User, X, LogOut, Home
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface DoctorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userEmail?: string;
  doctorName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard },
  { id: 'clients', labelAr: 'عملائي', labelEn: 'My Clients', icon: Users },
  { id: 'appointments', labelAr: 'الحجوزات', labelEn: 'Appointments', icon: Calendar },
  { id: 'programs', labelAr: 'البرامج العلاجية', labelEn: 'Programs', icon: FileText },
  { id: 'videos', labelAr: 'الفيديوهات', labelEn: 'Videos', icon: Video },
  { id: 'exercises', labelAr: 'التمارين', labelEn: 'Exercises', icon: Dumbbell },
  { id: 'diets', labelAr: 'الأنظمة الغذائية', labelEn: 'Diet Plans', icon: Utensils },
  { id: 'notes', labelAr: 'الملاحظات', labelEn: 'Notes', icon: FileText },
  { id: 'articles', labelAr: 'المقالات', labelEn: 'Articles', icon: FileText },
  { id: 'schedule', labelAr: 'جدولي', labelEn: 'My Schedule', icon: Clock },
  { id: 'conversations', labelAr: 'المحادثات', labelEn: 'Conversations', icon: MessageCircle },
];

export const DoctorSidebar = ({
  activeSection,
  setActiveSection,
  userEmail,
  doctorName,
  isOpen,
  onClose
}: DoctorSidebarProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    onClose(); // Close sidebar on mobile after selection
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "fixed top-0 h-screen bg-sidebar-background border-border z-50 flex flex-col transition-all duration-300 w-64",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          // Mobile: show/hide based on isOpen
          "lg:translate-x-0",
          !isOpen && (isRTL ? "translate-x-full" : "-translate-x-full"),
          isOpen && "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={logo} alt="NutriRehab" className="h-10 w-10 object-contain" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-foreground text-sm">
                {isRTL ? 'لوحة تحكم الطبيب' : 'Doctor Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {isRTL ? item.labelAr : item.labelEn}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-border space-y-3">
          {doctorName && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">د. {doctorName}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'طبيب' : 'Doctor'}</p>
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </span>
          </button>

          {/* Go to Home Button */}
          <button
            onClick={handleGoHome}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">
              {isRTL ? 'العودة للرئيسية' : 'Go to Home'}
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
