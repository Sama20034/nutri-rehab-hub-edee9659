import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LayoutDashboard, User, LogOut, ChevronDown, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { toast } from 'sonner';
import logo from '@/assets/alligator-fit-logo.png';

// Store categories structure
const STORE_CATEGORIES = {
  en: [
    {
      name: "Proteins, Aminos & Creatine",
      subcategories: ["Proteins", "Weight Gainers & Carbs", "Bcaa & Recovery", "Pure Amino Acids", "Creatine"]
    },
    {
      name: "Pre-Workout & Natural Boosters",
      subcategories: ["Pre-Workout", "Test Boosters", "GH Boosters"]
    },
    {
      name: "Weight Loss & Natural Healthy Foods",
      subcategories: ["Stimulant Fat Burners", "Non Stimulant Fat Burners", "High Natural Foods", "Protein Bars & Snacks"]
    },
    {
      name: "General Health Care",
      subcategories: ["Vitamins & Minerals", "Omega & Fish Oil", "Women Health", "Kids Health", "Skin & Hair Care", "Bones & Joint Supports"]
    },
    {
      name: "Fitness Equipment",
      subcategories: ["Training Supports", "Shakers & Bottles", "Sports Wear"]
    }
  ],
  ar: [
    {
      name: "البروتينات والأحماض الأمينية والكرياتين",
      subcategories: ["البروتينات", "زيادة الوزن والكربوهيدرات", "BCAA والتعافي", "الأحماض الأمينية النقية", "الكرياتين"]
    },
    {
      name: "ما قبل التمرين والمعززات الطبيعية",
      subcategories: ["ما قبل التمرين", "معززات التستوستيرون", "معززات هرمون النمو"]
    },
    {
      name: "إنقاص الوزن والأغذية الصحية الطبيعية",
      subcategories: ["حارقات الدهون المنشطة", "حارقات الدهون غير المنشطة", "الأغذية الطبيعية العالية", "ألواح البروتين والوجبات الخفيفة"]
    },
    {
      name: "الرعاية الصحية العامة",
      subcategories: ["الفيتامينات والمعادن", "أوميغا وزيت السمك", "صحة المرأة", "صحة الأطفال", "العناية بالبشرة والشعر", "دعم العظام والمفاصل"]
    },
    {
      name: "معدات اللياقة البدنية",
      subcategories: ["دعامات التدريب", "الشيكرات والزجاجات", "الملابس الرياضية"]
    }
  ]
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const storeCategories = isRTL ? STORE_CATEGORIES.ar : STORE_CATEGORIES.en;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: isRTL ? 'من نحن' : 'About' },
    { path: '/packages', label: isRTL ? 'الباقات' : 'Packages' },
    { path: '/store', label: isRTL ? 'المتجر' : 'Store', icon: ShoppingBag, hasDropdown: true },
    { path: '/articles', label: isRTL ? 'المقالات' : 'Articles' },
    { path: '/contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/dashboard';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleCategoryClick = (subcategory: string) => {
    navigate(`/store?category=${encodeURIComponent(subcategory)}`);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect safe-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Alligator Fit" className="h-10 sm:h-12 w-auto" />
            <span className="text-lg sm:text-xl font-bold text-gradient hidden sm:block">Alligator Fit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <HoverCard key={link.path} openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Link
                      to={link.path}
                      className={`relative text-sm font-medium transition-colors duration-300 flex items-center gap-1 ${
                        location.pathname === link.path
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                      {location.pathname === link.path && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent 
                    align="center" 
                    sideOffset={15}
                    className="w-auto p-6 bg-card border border-border shadow-2xl rounded-xl z-[60]"
                  >
                    <div className="grid grid-cols-5 gap-6 min-w-[800px]">
                      {storeCategories.map((category) => (
                        <div key={category.name} className="space-y-3">
                          <h4 className="font-bold text-sm text-foreground border-b border-border/50 pb-2">
                            {category.name}
                          </h4>
                          <ul className="space-y-2">
                            {category.subcategories.map((sub) => (
                              <li key={sub}>
                                <button
                                  onClick={() => handleCategoryClick(sub)}
                                  className={`text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group w-full ${isRTL ? 'text-right' : 'text-left'}`}
                                >
                                  <ChevronRight className={`h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'rotate-180' : ''}`} />
                                  {sub}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle Language</span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {profile?.full_name || (isRTL ? 'مستخدم' : 'User')}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className={`w-48 ${isRTL ? 'text-right' : 'text-left'} bg-popover border border-border z-50`}>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onSelect={() => {
                      const path = getDashboardPath();
                      navigate(path);
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onSelect={() => {
                      navigate('/profile');
                    }}
                  >
                    <User className="h-4 w-4" />
                    {isRTL ? 'الملف الشخصي' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    {isRTL ? 'تسجيل الخروج' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                
                <Link to="/register">
                  <Button variant="hero" size="sm">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground"
            >
              <Globe className="h-5 w-5" />
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className={`w-48 ${isRTL ? 'text-right' : 'text-left'} bg-popover border border-border z-50`}>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onSelect={() => {
                      setIsOpen(false);
                      const path = getDashboardPath();
                      navigate(path);
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2"
                    onSelect={() => {
                      setIsOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <User className="h-4 w-4" />
                    {isRTL ? 'الملف الشخصي' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    {isRTL ? 'تسجيل الخروج' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-effect border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <div key={link.path}>
                  {link.hasDropdown ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <Link
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={`py-2 text-base font-medium transition-colors ${
                            location.pathname === link.path
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {link.label}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedMobileCategory(
                            expandedMobileCategory === 'store' ? null : 'store'
                          )}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            expandedMobileCategory === 'store' ? 'rotate-180' : ''
                          }`} />
                        </Button>
                      </div>
                      <AnimatePresence>
                        {expandedMobileCategory === 'store' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`space-y-3 py-3 ${isRTL ? 'pr-4' : 'pl-4'}`}
                          >
                            {storeCategories.map((category) => (
                              <div key={category.name} className="space-y-2">
                                <h5 className="text-sm font-semibold text-foreground">{category.name}</h5>
                                <div className={`space-y-1 ${isRTL ? 'pr-3' : 'pl-3'}`}>
                                  {category.subcategories.map((sub) => (
                                    <button
                                      key={sub}
                                      onClick={() => handleCategoryClick(sub)}
                                      className={`block text-sm text-muted-foreground hover:text-primary py-1 w-full ${isRTL ? 'text-right' : 'text-left'}`}
                                    >
                                      {sub}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2 text-base font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              {!user && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
