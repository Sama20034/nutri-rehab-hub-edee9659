import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Dumbbell, 
  Utensils, 
  Heart, 
  TrendingUp, 
  Video, 
  Stethoscope, 
  User,
  X,
  LogOut,
  Home,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface SidebarItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
}

interface ClientSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isRTL: boolean;
  userName?: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'program', labelAr: 'برنامجي', labelEn: 'My Program', icon: <FileText className="h-5 w-5" /> },
  { id: 'exercises', labelAr: 'تماريني', labelEn: 'My Exercises', icon: <Dumbbell className="h-5 w-5" /> },
  { id: 'diet', labelAr: 'نظامي الغذائي', labelEn: 'My Diet', icon: <Utensils className="h-5 w-5" /> },
  { id: 'health-profile', labelAr: 'ملفي الصحي', labelEn: 'Health Profile', icon: <Heart className="h-5 w-5" /> },
  { id: 'medical-followup', labelAr: 'المتابعة الطبية', labelEn: 'Medical Follow-up', icon: <Stethoscope className="h-5 w-5" /> },
  { id: 'progress', labelAr: 'متابعة التقدم', labelEn: 'Progress', icon: <TrendingUp className="h-5 w-5" /> },
  { id: 'orders', labelAr: 'طلباتي', labelEn: 'My Orders', icon: <ShoppingBag className="h-5 w-5" /> },
  { id: 'videos', labelAr: 'الفيديوهات', labelEn: 'Videos', icon: <Video className="h-5 w-5" /> },
];

export const ClientSidebar = ({ 
  activeSection, 
  onSectionChange, 
  isRTL, 
  userName, 
  userEmail,
  isOpen,
  onClose
}: ClientSidebarProps) => {
  const navigate = useNavigate();

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
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
      {/* Overlay for mobile - covers everything when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "fixed top-0 h-screen h-[100dvh] bg-sidebar flex flex-col transition-transform duration-300 ease-in-out",
          // Width: 85vw on mobile (max 320px), 64 on desktop
          "w-[85vw] max-w-[320px] lg:w-64",
          // Border
          isRTL ? "border-l border-sidebar-border" : "border-r border-sidebar-border",
          // Position
          isRTL ? "right-0" : "left-0",
          // Desktop: always visible
          "lg:z-40 lg:translate-x-0",
          // Mobile: higher z-index and slide in/out
          "z-[70]",
          !isOpen && (isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"),
          isOpen && "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={logo} alt="NutriRehab" className="h-10 w-10 object-contain flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-foreground text-sm truncate">
                {isRTL ? 'لوحة تحكم العميل' : 'Client Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
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
              {item.icon}
              <span className="text-sm font-medium">
                {isRTL ? item.labelAr : item.labelEn}
              </span>
            </button>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          {userName && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'عميل' : 'Client'}</p>
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
      </aside>
    </>
  );
};
