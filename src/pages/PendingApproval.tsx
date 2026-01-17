import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Mail, ArrowRight, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const PendingApproval = () => {
  const { isRTL } = useLanguage();
  const { user, status, role, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }

    // If approved, redirect to appropriate dashboard
    if (!loading && status === 'approved' && role) {
      const dashboardRoutes: Record<string, string> = {
        client: '/dashboard/client',
        doctor: '/dashboard/doctor',
        admin: '/dashboard/admin'
      };
      navigate(dashboardRoutes[role]);
    }
  }, [user, status, role, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRefresh = async () => {
    await refreshProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="NutriRehab" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-gradient">NutriRehab</span>
        </Link>

        {/* Status Card */}
        <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border shadow-elevated text-center">
          {status === 'pending' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isRTL ? 'في انتظار الموافقة' : 'Pending Approval'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isRTL 
                  ? 'حسابك قيد المراجعة. سيتم إخطارك عند الموافقة على حسابك.'
                  : 'Your account is under review. You will be notified when your account is approved.'}
              </p>
            </>
          )}

          {status === 'rejected' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <Mail className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-red-500">
                {isRTL ? 'تم رفض الطلب' : 'Application Rejected'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isRTL 
                  ? 'للأسف، تم رفض طلبك. يرجى التواصل معنا لمزيد من المعلومات.'
                  : 'Unfortunately, your application was rejected. Please contact us for more information.'}
              </p>
            </>
          )}

          {status === 'suspended' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Mail className="h-10 w-10 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-orange-500">
                {isRTL ? 'الحساب معلق' : 'Account Suspended'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isRTL 
                  ? 'تم تعليق حسابك. يرجى التواصل مع الإدارة.'
                  : 'Your account has been suspended. Please contact administration.'}
              </p>
            </>
          )}

          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              {isRTL ? 'تحديث الحالة' : 'Refresh Status'}
            </Button>
            
            <Link to="/contact" className="block">
              <Button variant="hero" className="w-full">
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            
            <Button variant="ghost" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
