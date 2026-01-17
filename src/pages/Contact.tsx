import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';

const Contact = () => {
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    {
      icon: Mail,
      title: isRTL ? 'البريد الإلكتروني' : 'Email',
      value: 'nutrirehabinfo@gmail.com',
      link: 'mailto:nutrirehabinfo@gmail.com',
    },
    {
      icon: Phone,
      title: isRTL ? 'رقم الهاتف' : 'Phone',
      value: '01203246090',
      link: 'tel:+201203246090',
    },
    {
      icon: MessageCircle,
      title: isRTL ? 'واتساب' : 'WhatsApp',
      value: '01203246090',
      link: 'https://wa.me/201203246090',
    },
    {
      icon: Clock,
      title: isRTL ? 'ساعات العمل' : 'Working Hours',
      value: isRTL ? '9 صباحاً - 9 مساءً' : '9 AM - 9 PM',
      link: '#',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
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
            <p className="text-xl text-muted-foreground">
              {t('contact.subtitle')}
            </p>
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
              <h2 className="text-2xl font-bold mb-6">
                {isRTL ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h2>
              
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
                      placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone'}
                      className="bg-background"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('contact.email')}</label>
                  <Input 
                    type="email"
                    required
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    className="bg-background"
                    dir="ltr"
                  />
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
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {isRTL ? 'معلومات التواصل' : 'Contact Information'}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {isRTL 
                    ? 'يسعدنا التواصل معك! اختر الطريقة المناسبة لك'
                    : 'We\'d love to hear from you! Choose the method that suits you'
                  }
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={index}
                    href={info.link}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{info.title}</h3>
                      <p className="text-muted-foreground">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
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
                        ? 'نرد على جميع الرسائل خلال 24 ساعة كحد أقصى'
                        : 'We respond to all messages within 24 hours maximum'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
