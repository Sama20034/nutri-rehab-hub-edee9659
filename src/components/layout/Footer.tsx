import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
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
    { icon: Instagram, href: 'https://www.instagram.com/dr.mahmoud_reaky', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/share/1Cs13SZqDx/', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com/@mahmoudreagy', label: 'YouTube' },
    { icon: TikTokIcon, href: 'https://www.tiktok.com/@mahmoudreagy', label: 'TikTok' },
    { icon: ThreadsIcon, href: 'https://www.threads.com/@dr.mahmoud_reaky', label: 'Threads' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-right order-1 md:order-3">
            <Link to="/" className="inline-flex items-center gap-3 justify-center md:justify-end">
              <img src={alligatorLogo} alt="Alligator Fit" className="h-12 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto md:mx-0 md:ml-auto">
              {isRTL 
                ? 'منصة متكاملة للتدريب والتغذية مع متابعة شخصية من فريق متخصص لضمان تحقيق أهدافك.'
                : 'An integrated platform for training and nutrition with personal follow-up from a specialized team to ensure you achieve your goals.'
              }
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 justify-center md:justify-end">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center order-2">
            <h4 className="text-foreground font-semibold mb-4">{isRTL ? 'روابط سريعة' : 'Quick Links'}</h4>
            <ul className="space-y-2">
              {[
                { path: '/', label: isRTL ? 'الرئيسية' : 'Home' },
                { path: '/packages', label: isRTL ? 'الباقات' : 'Packages' },
                { path: '/about', label: isRTL ? 'من نحن' : 'About Us' },
                { path: '/contact', label: isRTL ? 'تواصل معنا' : 'Contact Us' },
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

          {/* Legal Links */}
          <div className="text-center md:text-left order-3 md:order-1">
            <h4 className="text-foreground font-semibold mb-4">{isRTL ? 'قانوني' : 'Legal'}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Alligator Fit. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
