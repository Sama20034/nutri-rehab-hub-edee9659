import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import logo from '@/assets/alligator-fit-logo.png';

type AppRole = 'client' | 'admin';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, isRTL } = useLanguage();
  const { signIn, signUp, user, role, status, loading } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('client');

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && role) {
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }
      // Check if user is approved
      if (status === 'approved' || role === 'admin') {
        const dashboardRoutes: Record<AppRole, string> = {
          client: '/dashboard/client',
          admin: '/dashboard/admin'
        };
        navigate(dashboardRoutes[role]);
      } else if (status === 'pending' || status === 'rejected' || status === 'suspended') {
        navigate('/pending-approval');
      }
    }
  }, [user, role, status, loading, navigate]);

  // Redirect to Register page for client registration
  const handleClientRegister = () => {
    navigate('/register');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If client wants to register, redirect to multi-step registration
    if (!isLogin && selectedRole === 'client') {
      handleClientRegister();
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(isRTL ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        }
      } else {
        // Validation for doctor/admin registration
        if (password !== confirmPassword) {
          toast.error(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          toast.error(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, selectedRole, {
          full_name: fullName,
          phone
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(isRTL ? 'البريد الإلكتروني مسجل بالفعل' : 'Email already registered');
          } else {
            toast.error(error.message);
          }
        } else {
          if (selectedRole === 'admin') {
            toast.success(isRTL ? 'تم إنشاء حساب المدير بنجاح!' : 'Admin account created successfully!');
          } else {
            toast.success(isRTL ? 'تم إنشاء الحساب! في انتظار موافقة الإدارة' : 'Account created! Pending admin approval');
          }
        }
      }
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: AppRole; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { value: 'client', labelAr: 'عميل', labelEn: 'Client', icon: <User className="h-5 w-5" /> },
    { value: 'admin', labelAr: 'مدير', labelEn: 'Admin', icon: <FileText className="h-5 w-5" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
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
          <img src={logo} alt="Alligator Fit" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-gradient">Alligator Fit</span>
        </Link>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border shadow-elevated max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? t('auth.login.title') : t('auth.register.title')}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? t('auth.login.subtitle') : t('auth.register.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? 'نوع الحساب' : 'Account Type'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.value);
                          // If client is selected, redirect to multi-step registration
                          if (r.value === 'client') {
                            navigate('/register');
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                          selectedRole === r.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        {r.icon}
                        <span className="text-xs font-medium">{isRTL ? r.labelAr : r.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show fields only for doctor/admin */}
                {selectedRole !== 'client' && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('auth.name')}</label>
                      <div className="relative">
                        <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          className={`bg-background ${isRTL ? 'pr-10' : 'pl-10'}`}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <div className="relative">
                        <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                          className={`bg-background ${isRTL ? 'pr-10' : 'pl-10'}`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`bg-background ${isRTL ? 'pr-10' : 'pl-10'}`}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.password')}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`bg-background ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isRTL ? 'أكد كلمة المرور' : 'Confirm password'}
                    className={`bg-background ${isRTL ? 'pr-10' : 'pl-10'}`}
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  {t('auth.forgot')}
                </button>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? t('auth.login.button') : t('auth.register.button')}
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? t('nav.register') : t('nav.login')}
              </button>
            </p>
          </div>

          {/* Info about approval */}
          {!isLogin && selectedRole !== 'admin' && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-500 text-center">
                {isRTL 
                  ? '⚠️ سيتم مراجعة حسابك من قبل الإدارة قبل التفعيل'
                  : '⚠️ Your account will be reviewed by admin before activation'}
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            {isRTL ? '← العودة للرئيسية' : '← Back to Home'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
