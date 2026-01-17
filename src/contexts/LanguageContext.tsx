import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'نبذة عنا',
    'nav.services': 'خدماتنا',
    'nav.success': 'قصص النجاح',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    
    // Hero
    'hero.title': 'رحلتك نحو التعافي',
    'hero.subtitle': 'تبدأ هنا',
    'hero.description': 'منصة متكاملة للتأهيل الطبي والتغذية العلاجية أونلاين، مع فريق من أفضل المتخصصين لمساعدتك في تحقيق أهدافك الصحية',
    'hero.cta': 'ابدأ رحلتك الآن',
    'hero.cta.secondary': 'اكتشف خدماتنا',
    
    // Features
    'features.title': 'لماذا تختار NutriRehab؟',
    'features.subtitle': 'نقدم لك تجربة علاجية فريدة ومتكاملة',
    'features.consultation.title': 'استشارات متخصصة',
    'features.consultation.desc': 'جلسات فردية مع أفضل أطباء التأهيل وخبراء التغذية',
    'features.programs.title': 'برامج علاجية مخصصة',
    'features.programs.desc': 'خطط علاجية مصممة خصيصاً لحالتك وأهدافك',
    'features.tracking.title': 'متابعة مستمرة',
    'features.tracking.desc': 'نظام متابعة ذكي لرصد تقدمك وتعديل خطتك',
    'features.videos.title': 'مكتبة فيديوهات',
    'features.videos.desc': 'تمارين وإرشادات مصورة لدعم رحلة علاجك',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول متكاملة لصحتك',
    'services.rehab.title': 'التأهيل الطبي',
    'services.rehab.desc': 'برامج تأهيل متخصصة لإصابات العظام والمفاصل والعمود الفقري',
    'services.nutrition.title': 'التغذية العلاجية',
    'services.nutrition.desc': 'خطط غذائية علمية لإدارة الوزن والأمراض المزمنة',
    'services.sports.title': 'تأهيل رياضي',
    'services.sports.desc': 'برامج متخصصة للرياضيين للتعافي والوقاية من الإصابات',
    'services.online.title': 'جلسات أونلاين',
    'services.online.desc': 'استشارات ومتابعة عن بُعد مع أفضل المتخصصين',
    
    // Stats
    'stats.clients': 'عميل سعيد',
    'stats.doctors': 'طبيب متخصص',
    'stats.sessions': 'جلسة ناجحة',
    'stats.rating': 'تقييم العملاء',
    
    // Success Stories
    'success.title': 'قصص نجاح ملهمة',
    'success.subtitle': 'شاهد كيف ساعدنا عملاءنا في تحقيق أهدافهم',
    
    // Contact
    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'نحن هنا لمساعدتك',
    'contact.name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'رقم الهاتف',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة',
    
    // Footer
    'footer.description': 'منصة رائدة في التأهيل الطبي والتغذية العلاجية أونلاين',
    'footer.links': 'روابط سريعة',
    'footer.policies': 'السياسات',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    'footer.refund': 'سياسة الاسترداد',
    'footer.rights': 'جميع الحقوق محفوظة',
    
    // About
    'about.title': 'من نحن',
    'about.subtitle': 'نؤمن بأن كل شخص يستحق رعاية صحية متميزة',
    'about.mission.title': 'مهمتنا',
    'about.mission.desc': 'تقديم خدمات تأهيل وتغذية علاجية عالمية المستوى، متاحة للجميع من أي مكان',
    'about.vision.title': 'رؤيتنا',
    'about.vision.desc': 'أن نكون المنصة الأولى للتأهيل الطبي والتغذية العلاجية في الشرق الأوسط',
    
    // Auth
    'auth.login.title': 'تسجيل الدخول',
    'auth.login.subtitle': 'مرحباً بعودتك',
    'auth.register.title': 'إنشاء حساب جديد',
    'auth.register.subtitle': 'انضم إلى عائلة NutriRehab',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.name': 'الاسم الكامل',
    'auth.login.button': 'تسجيل الدخول',
    'auth.register.button': 'إنشاء الحساب',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.forgot': 'نسيت كلمة المرور؟',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.success': 'Success Stories',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Hero
    'hero.title': 'Your Journey to Recovery',
    'hero.subtitle': 'Starts Here',
    'hero.description': 'A comprehensive platform for medical rehabilitation and therapeutic nutrition online, with a team of the best specialists to help you achieve your health goals',
    'hero.cta': 'Start Your Journey',
    'hero.cta.secondary': 'Discover Our Services',
    
    // Features
    'features.title': 'Why Choose NutriRehab?',
    'features.subtitle': 'We offer you a unique and integrated therapeutic experience',
    'features.consultation.title': 'Expert Consultations',
    'features.consultation.desc': 'Individual sessions with the best rehabilitation doctors and nutrition experts',
    'features.programs.title': 'Customized Programs',
    'features.programs.desc': 'Treatment plans designed specifically for your condition and goals',
    'features.tracking.title': 'Continuous Follow-up',
    'features.tracking.desc': 'Smart tracking system to monitor your progress and adjust your plan',
    'features.videos.title': 'Video Library',
    'features.videos.desc': 'Exercises and visual guides to support your treatment journey',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Integrated solutions for your health',
    'services.rehab.title': 'Medical Rehabilitation',
    'services.rehab.desc': 'Specialized rehabilitation programs for bone, joint, and spine injuries',
    'services.nutrition.title': 'Therapeutic Nutrition',
    'services.nutrition.desc': 'Scientific dietary plans for weight management and chronic diseases',
    'services.sports.title': 'Sports Rehabilitation',
    'services.sports.desc': 'Specialized programs for athletes for recovery and injury prevention',
    'services.online.title': 'Online Sessions',
    'services.online.desc': 'Remote consultations and follow-up with the best specialists',
    
    // Stats
    'stats.clients': 'Happy Clients',
    'stats.doctors': 'Specialists',
    'stats.sessions': 'Successful Sessions',
    'stats.rating': 'Client Rating',
    
    // Success Stories
    'success.title': 'Inspiring Success Stories',
    'success.subtitle': 'See how we helped our clients achieve their goals',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We are here to help you',
    'contact.name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.phone': 'Phone Number',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    
    // Footer
    'footer.description': 'A leading platform in medical rehabilitation and therapeutic nutrition online',
    'footer.links': 'Quick Links',
    'footer.policies': 'Policies',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.refund': 'Refund Policy',
    'footer.rights': 'All Rights Reserved',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'We believe everyone deserves excellent healthcare',
    'about.mission.title': 'Our Mission',
    'about.mission.desc': 'To provide world-class rehabilitation and therapeutic nutrition services, accessible to everyone from anywhere',
    'about.vision.title': 'Our Vision',
    'about.vision.desc': 'To be the leading platform for medical rehabilitation and therapeutic nutrition in the Middle East',
    
    // Auth
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Welcome back',
    'auth.register.title': 'Create Account',
    'auth.register.subtitle': 'Join the NutriRehab family',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.login.button': 'Login',
    'auth.register.button': 'Create Account',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.forgot': 'Forgot password?',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
