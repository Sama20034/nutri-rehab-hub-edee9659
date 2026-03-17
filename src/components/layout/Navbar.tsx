import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LayoutDashboard, User, LogOut, ChevronDown, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/alligator-fit-logo.png';

interface CategoryData {
  id: string;
  name: string;
  name_ar: string | null;
  parent_id: string | null;
  display_order: number;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<CategoryData[]>([]);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('store_categories')
      .select('id, name, name_ar, parent_id, display_order')
      .eq('is_active', true)
      .order('display_order');
    if (data) setDbCategories(data);
  };

  const getStoreCategories = () => {
    const mainCats = dbCategories.filter(c => !c.parent_id);
    return mainCats.map(main => ({
      name: isRTL ? main.name_ar || main.name : main.name,
      subcategories: dbCategories
        .filter(c => c.parent_id === main.id)
        .sort((a, b) => a.display_order - b.display_order)
        .map(sub => isRTL ? sub.name_ar || sub.name : sub.name)
    }));
  };

  const storeCategories = getStoreCategories();

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50 safe-top" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/store" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Alligator Fit" className="h-10 sm:h-12 w-auto" />
            <span className="text-lg sm:text-xl font-bold text-gradient hidden sm:block">Alligator Fit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.path} className="relative group">
                  <Link
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors duration-300 flex items-center gap-1 py-2 ${
                      location.pathname === link.path
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  <div 
                    className="absolute top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]"
                    style={{ 
                      left: isRTL ? 'auto' : '50%', 
                      right: isRTL ? '50%' : 'auto',
                      transform: isRTL ? 'translateX(50%)' : 'translateX(-50%)'
                    }}
                  >
                    <div className="bg-card border border-border shadow-2xl rounded-lg p-8" style={{ minWidth: '950px' }}>
                      <div 
                        className="grid grid-cols-5 gap-10"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {storeCategories.map((category) => (
                          <div key={category.name} className="min-w-0">
                            {/* Category Header */}
                            <h4 className={`font-bold text-foreground text-sm leading-tight mb-4 pb-2 border-b-2 border-primary/30 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {category.name}
                            </h4>
                            
                            {/* Subcategories */}
                            <ul className="space-y-0">
                              {category.subcategories.map((sub) => (
                                <li key={sub} className="border-b border-dashed border-border/50 last:border-b-0">
                                  <button
                                    onClick={() => handleCategoryClick(sub)}
                                    className={`w-full py-2.5 text-sm text-primary hover:text-primary/70 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'}`}
                                  >
                                    <span className="text-primary font-medium">{isRTL ? '<' : '>'}</span>
                                    <span className="whitespace-nowrap">{sub}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
          <div className="hidden lg:flex items-center gap-2">
            {/* Cart Button - Desktop */}
            <Link to="/store?cart=open" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <ThemeToggle />
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
          <div className="lg:hidden flex items-center gap-1">
            {/* Cart Button - Mobile */}
            <Link to="/store?cart=open" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <ThemeToggle />
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
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        setExpandedMobileCategory(null);
                                        navigate(`/store?category=${encodeURIComponent(sub)}`);
                                      }}
                                      className={`block text-sm text-muted-foreground hover:text-primary py-2 w-full ${isRTL ? 'text-right' : 'text-left'}`}
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
