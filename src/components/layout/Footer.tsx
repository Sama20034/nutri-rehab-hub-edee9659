import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t, isRTL } = useLanguage();

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/share/1DBHN9Hbe6/?mibextid=wwXIfr', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/ptnutri_rehab?igsh=MTk4aG8zOW9vejE5bA%3D%3D&utm_source=qr', label: 'Instagram' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="NutriRehab" className="h-12 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
                { path: '/success-stories', label: t('nav.success') },
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
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">{t('contact.title')}</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:nutrirehabinfo@gmail.com" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span>nutrirehabinfo@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+201203246090" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span dir="ltr">01203246090</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/201203246090" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span>{isRTL ? 'واتساب: 01203246090' : 'WhatsApp: 01203246090'}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} NutriRehab. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
