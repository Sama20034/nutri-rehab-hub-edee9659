import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Facebook, Instagram, Youtube, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import alligatorLogo from '@/assets/alligator-fit-logo.png';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Threads Icon Component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.9-.746 2.134-1.163 3.477-1.176l.028-.001c.996.007 1.946.178 2.828.509.082-.334.123-.69.123-1.066 0-.37-.04-.726-.119-1.066-.2-.868-.6-1.591-1.183-2.153-.601-.58-1.367-.888-2.285-.917-.77.02-1.463.218-2.065.587-.665.408-1.175 1.012-1.514 1.795l-1.865-.807c.48-1.096 1.234-1.973 2.245-2.608.944-.594 2.047-.909 3.283-.938 1.404.037 2.608.499 3.583 1.374.931.838 1.547 1.93 1.828 3.245.046.218.082.438.107.66 1.073.531 1.95 1.282 2.594 2.27.854 1.308 1.171 2.86.917 4.489-.31 1.986-1.37 3.696-2.981 4.816-1.498 1.04-3.422 1.593-5.565 1.6zm-.09-7.345c-.944.028-1.756.28-2.342.726-.508.386-.756.888-.72 1.453.034.532.305.982.785 1.3.528.352 1.262.533 2.066.51 1.09-.06 1.958-.466 2.574-1.205.482-.576.808-1.335.97-2.26-.978-.355-2.088-.544-3.333-.524z"/>
  </svg>
);

const Footer = () => {
  const { t, isRTL } = useLanguage();

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://www.facebook.com/share/1Cs13SZqDx/', 
      label: 'Facebook',
      color: 'hover:bg-[#1877F2]'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/dr.mahmoud_reaky', 
      label: 'Instagram',
      color: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/alligator_fit_team', 
      label: 'Alligator Fit Team',
      color: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]'
    },
    { 
      icon: TikTokIcon, 
      href: 'https://www.tiktok.com/@mahmoudreagy', 
      label: 'TikTok',
      color: 'hover:bg-black'
    },
    { 
      icon: Youtube, 
      href: 'https://youtube.com/@mahmoudreagy', 
      label: 'YouTube',
      color: 'hover:bg-[#FF0000]'
    },
    { 
      icon: ThreadsIcon, 
      href: 'https://www.threads.com/@dr.mahmoud_reaky', 
      label: 'Threads',
      color: 'hover:bg-black'
    },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={alligatorLogo} alt="Dr. Mahmoud Al-Reaky" className="h-16 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isRTL 
                ? 'متخصصون في التغذية العلاجية والتأهيل الطبي. نساعدك في تحقيق أهدافك الصحية بأفضل الطرق العلمية الحديثة.'
                : 'Specialists in therapeutic nutrition and medical rehabilitation. We help you achieve your health goals with the best modern scientific methods.'
              }
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground ${social.color} hover:text-white transition-all duration-300`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">{t('footer.links')}</h4>
            <ul className="space-y-3">
              {[
                { path: '/', label: t('nav.home') },
                { path: '/about', label: t('nav.about') },
                { path: '/services', label: t('nav.services') },
                { path: '/packages', label: isRTL ? 'الباقات' : 'Packages' },
                { path: '/store', label: isRTL ? 'المتجر' : 'Store' },
                { path: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">{t('footer.policies')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {t('footer.refund')}
                </Link>
              </li>
              <li>
                <Link
                  to="/service-policy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {isRTL ? 'سياسة الخدمة' : 'Service Policy'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">{t('contact.title')}</h4>
            <ul className="space-y-4">
              {/* WhatsApp - Primary */}
              <li>
                <a 
                  href="https://wa.me/201016111733" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">{isRTL ? 'واتساب' : 'WhatsApp'}</span>
                    <span dir="ltr">01016111733</span>
                  </div>
                </a>
              </li>
              
              {/* Phone */}
              <li>
                <a href="tel:+201016111733" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">{isRTL ? 'اتصل بنا' : 'Call Us'}</span>
                    <span dir="ltr">01016111733</span>
                  </div>
                </a>
              </li>

              {/* Email */}
              <li>
                <a href="mailto:dr.mahmoudreaky@gmail.com" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                    <span>dr.mahmoudreaky@gmail.com</span>
                  </div>
                </a>
              </li>

              {/* Working Hours */}
              <li>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">{isRTL ? 'ساعات العمل' : 'Working Hours'}</span>
                    <span>{isRTL ? 'يومياً من 10 صباحاً - 10 مساءً' : 'Daily 10 AM - 10 PM'}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* WhatsApp CTA Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#25D366]/10 to-primary/10 border border-[#25D366]/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">
                  {isRTL ? 'تواصل معنا مباشرة عبر واتساب' : 'Contact us directly via WhatsApp'}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? 'نرد على جميع الاستفسارات في أسرع وقت' : 'We respond to all inquiries as quickly as possible'}
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/201016111733"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              {isRTL ? 'راسلنا الآن' : 'Message Us Now'}
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Dr. Mahmoud Al-Reaky. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
