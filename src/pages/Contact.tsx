import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send, CheckCircle, MessageCircle, Facebook, Instagram, Youtube, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';

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

const Contact = () => {
  const { t, isRTL } = useLanguage();
  const { trackLead } = useFacebookPixel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Track Lead event on form submission
    trackLead('contact_form');
    
    toast.success(isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappNumber = '01016111733';
  const whatsappLink = `https://wa.me/201016111733?text=${encodeURIComponent(
    isRTL ? 'مرحباً، أريد الاستفسار عن خدماتكم' : 'Hello, I want to inquire about your services'
  )}`;

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://www.facebook.com/share/1Cs13SZqDx/', 
      label: 'Facebook',
      color: 'bg-[#1877F2]'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/dr.mahmoud_reaky', 
      label: isRTL ? 'إنستجرام - الصفحة الشخصية' : 'Instagram - Personal',
      color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/alligator_fit_team', 
      label: isRTL ? 'إنستجرام - فريق Alligator Fit' : 'Instagram - Alligator Fit Team',
      color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
    },
    { 
      icon: TikTokIcon, 
      href: 'https://www.tiktok.com/@mahmoudreagy', 
      label: 'TikTok',
      color: 'bg-black'
    },
    { 
      icon: Youtube, 
      href: 'https://youtube.com/@mahmoudreagy', 
      label: 'YouTube',
      color: 'bg-[#FF0000]'
    },
    { 
      icon: ThreadsIcon, 
      href: 'https://www.threads.com/@dr.mahmoud_reaky', 
      label: 'Threads',
      color: 'bg-black'
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">{t('contact.title')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {isRTL 
                ? 'نحن هنا لمساعدتك! تواصل معنا عبر الواتساب للرد السريع أو استخدم أي من وسائل التواصل الأخرى'
                : 'We are here to help you! Contact us via WhatsApp for a quick response or use any of our other contact methods'
              }
            </p>
            
            {/* Main WhatsApp CTA */}
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl shadow-[#25D366]/30"
            >
              <MessageCircle className="h-6 w-6" />
              {isRTL ? 'تواصل معنا عبر واتساب' : 'Contact Us on WhatsApp'}
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm" dir="ltr">
                {whatsappNumber}
              </span>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <h2 className="text-2xl font-bold mb-2">
                {isRTL ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'سنرد عليك في أقرب وقت ممكن' : 'We will respond as soon as possible'}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('contact.name')}</label>
                    <Input 
                      required 
                      placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('contact.phone')}</label>
                    <Input 
                      type="tel"
                      required
                      placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone'}
                      className="bg-background"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('contact.message')}</label>
                  <Textarea 
                    required
                    rows={5}
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    className="bg-background resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      />
                      {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {t('contact.send')}
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* WhatsApp Card - Primary */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 border border-[#25D366]/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-[#25D366] flex items-center justify-center">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{isRTL ? 'واتساب - التواصل الرئيسي' : 'WhatsApp - Main Contact'}</h3>
                    <p className="text-muted-foreground text-sm">{isRTL ? 'أسرع طريقة للتواصل معنا' : 'Fastest way to reach us'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {isRTL ? 'راسلنا الآن' : 'Message Now'}
                  </a>
                  <button
                    onClick={() => copyToClipboard(whatsappNumber, 'whatsapp')}
                    className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                    title={isRTL ? 'نسخ الرقم' : 'Copy number'}
                  >
                    {copiedField === 'whatsapp' ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-center text-lg font-semibold mt-3" dir="ltr">{whatsappNumber}</p>
              </div>

              {/* Other Contact Info */}
              <div className="grid gap-4">
                {/* Phone */}
                <a
                  href="tel:+201016111733"
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{isRTL ? 'اتصل بنا' : 'Call Us'}</h3>
                    <p className="text-muted-foreground" dir="ltr">01016111733</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:dr.mahmoudreaky@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{isRTL ? 'البريد الإلكتروني' : 'Email'}</h3>
                    <p className="text-muted-foreground">dr.mahmoudreaky@gmail.com</p>
                  </div>
                </a>

                {/* Working Hours */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{isRTL ? 'ساعات العمل' : 'Working Hours'}</h3>
                    <p className="text-muted-foreground">{isRTL ? 'يومياً من 10 صباحاً - 10 مساءً' : 'Daily 10 AM - 10 PM'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Response Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-primary/10 border border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">
                      {isRTL ? 'رد سريع مضمون' : 'Quick Response Guaranteed'}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {isRTL 
                        ? 'نرد على جميع الرسائل خلال ساعات قليلة كحد أقصى'
                        : 'We respond to all messages within a few hours maximum'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'تابعنا على السوشيال ميديا' : 'Follow Us on Social Media'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'ابق على اطلاع بأحدث النصائح والمحتوى الصحي'
                : 'Stay updated with the latest health tips and content'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-14 h-14 rounded-xl ${social.color} flex items-center justify-center text-white transition-transform group-hover:scale-110`}>
                  <social.icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-medium text-center">{social.label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isRTL ? 'معلومات الدفع' : 'Payment Information'}
              </h2>
              <p className="text-muted-foreground">
                {isRTL ? 'للتحويل اليدوي (InstaPay / Vodafone Cash)' : 'For manual transfer (InstaPay / Vodafone Cash)'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <span className="text-sm text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</span>
                    <p className="font-semibold">{isRTL ? 'محمود سيد أبو الحسن' : 'Mahmoud Sayed Abu Elhasan'}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('محمود سيد أبو الحسن', 'name')}
                    className="w-10 h-10 rounded-lg bg-background hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <span className="text-sm text-muted-foreground">{isRTL ? 'الرقم الرئيسي' : 'Primary Number'}</span>
                    <p className="font-semibold" dir="ltr">01016111733</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('01016111733', 'primary')}
                    className="w-10 h-10 rounded-lg bg-background hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    {copiedField === 'primary' ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <span className="text-sm text-muted-foreground">{isRTL ? 'الرقم الإضافي' : 'Secondary Number'}</span>
                    <p className="font-semibold" dir="ltr">01111166342</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('01111166342', 'secondary')}
                    className="w-10 h-10 rounded-lg bg-background hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    {copiedField === 'secondary' ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isRTL 
                  ? 'بعد التحويل، يرجى إرسال إيصال الدفع عبر الواتساب'
                  : 'After transfer, please send the payment receipt via WhatsApp'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
