import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Apple, 
  Activity,
  Video, 
  Heart,
  Sparkles,
  ClipboardCheck,
  Combine,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Services = () => {
  const { t, isRTL } = useLanguage();

  const services = [
    {
      icon: Apple,
      title: isRTL ? 'استشارات تغذية فردية' : 'Individual Nutrition Consultations',
      description: isRTL 
        ? 'جلسات استشارية فردية مع أخصائي تغذية معتمد لتصميم خطة غذائية مخصصة تناسب أهدافك الصحية وأسلوب حياتك'
        : 'Individual consultation sessions with a certified nutritionist to design a customized dietary plan that fits your health goals and lifestyle',
      features: isRTL 
        ? ['تقييم غذائي شامل', 'خطة وجبات مخصصة', 'متابعة دورية', 'إرشادات تغذوية متكاملة']
        : ['Comprehensive nutritional assessment', 'Customized meal plan', 'Regular follow-up', 'Complete dietary guidance'],
      price: isRTL ? 'من 500 ج.م' : 'From 500 EGP',
    },
    {
      icon: Activity,
      title: isRTL ? 'استشارات العلاج الطبيعي والتأهيل الفردية' : 'Individual Physical Therapy & Rehabilitation Consultations',
      description: isRTL 
        ? 'جلسات تقييم وعلاج فردية مع أخصائي علاج طبيعي لتشخيص وعلاج الحالات العضلية الهيكلية وإعادة التأهيل'
        : 'Individual assessment and treatment sessions with a physical therapist for diagnosis and treatment of musculoskeletal conditions and rehabilitation',
      features: isRTL
        ? ['تقييم عضلي هيكلي شامل', 'تشخيص دقيق للحالة', 'خطة علاج مخصصة', 'تمارين تأهيلية موجهة']
        : ['Comprehensive musculoskeletal assessment', 'Accurate condition diagnosis', 'Customized treatment plan', 'Guided rehabilitation exercises'],
      price: isRTL ? 'من 500 ج.م' : 'From 500 EGP',
    },
    {
      icon: Video,
      title: isRTL ? 'برامج تأهيل شخصية أونلاين' : 'Personal Online Rehabilitation Programs',
      description: isRTL 
        ? 'برامج تأهيل متكاملة عبر الإنترنت تشمل تمارين مصورة ومتابعة مستمرة وتعديلات دورية على البرنامج'
        : 'Comprehensive online rehabilitation programs including video exercises, continuous follow-up, and periodic program adjustments',
      features: isRTL
        ? ['تمارين فيديو مفصلة', 'جلسات متابعة أونلاين', 'تعديلات مستمرة للبرنامج', 'دعم عبر التطبيق']
        : ['Detailed video exercises', 'Online follow-up sessions', 'Continuous program adjustments', 'In-app support'],
      price: isRTL ? 'من 2,000 ج.م/شهر' : 'From 2,000 EGP/month',
    },
    {
      icon: Heart,
      title: isRTL ? 'جلسات الاستشفاء العلاجي (Recovery)' : 'Therapeutic Recovery Sessions',
      description: isRTL 
        ? 'جلسات استشفاء متخصصة باستخدام تقنيات متقدمة لتسريع التعافي وتخفيف التوتر العضلي وتحسين الأداء'
        : 'Specialized recovery sessions using advanced techniques to accelerate healing, relieve muscle tension, and improve performance',
      features: isRTL
        ? ['تقنيات الإبر الجافة', 'العلاج بالضغط', 'تحرير اللفافة', 'استرخاء العضلات العميق']
        : ['Dry needling techniques', 'Pressure therapy', 'Myofascial release', 'Deep muscle relaxation'],
      price: isRTL ? 'من 500 ج.م' : 'From 500 EGP',
    },
    {
      icon: Sparkles,
      title: isRTL ? 'جلسات الحجامة العلاجية' : 'Therapeutic Cupping Sessions',
      description: isRTL 
        ? 'جلسات حجامة علاجية متخصصة لتحسين الدورة الدموية وتخفيف الآلام وتعزيز الشفاء الطبيعي للجسم'
        : 'Specialized therapeutic cupping sessions to improve blood circulation, relieve pain, and enhance natural body healing',
      features: isRTL
        ? ['حجامة الجزء العلوي', 'حجامة الجزء السفلي', 'حجامة كامل الجسم', 'جلسات مدمجة']
        : ['Upper body cupping', 'Lower body cupping', 'Full body cupping', 'Combined sessions'],
      price: isRTL ? 'من 450 ج.م' : 'From 450 EGP',
    },
    {
      icon: ClipboardCheck,
      title: isRTL ? 'متابعة وتقييم دوري للبرنامج العلاجي' : 'Regular Program Follow-up & Assessment',
      description: isRTL 
        ? 'متابعة دورية شاملة لتقييم التقدم وتعديل البرنامج العلاجي لضمان تحقيق أفضل النتائج'
        : 'Comprehensive periodic follow-up to assess progress and adjust the treatment program to ensure the best results',
      features: isRTL
        ? ['تقييم دوري للتقدم', 'تعديل الخطة العلاجية', 'قياسات ومؤشرات', 'تقارير تفصيلية']
        : ['Periodic progress assessment', 'Treatment plan adjustment', 'Measurements and indicators', 'Detailed reports'],
      price: isRTL ? 'من 300 ج.م' : 'From 300 EGP',
    },
    {
      icon: Combine,
      title: isRTL ? 'برامج دمج التغذية مع العلاج الطبيعي' : 'Integrated Nutrition & Physical Therapy Programs',
      description: isRTL 
        ? 'برامج متكاملة تجمع بين التغذية العلاجية والعلاج الطبيعي لتحسين الأداء الوظيفي والصحي بشكل شامل'
        : 'Comprehensive programs combining therapeutic nutrition and physical therapy to improve functional and health performance holistically',
      features: isRTL
        ? ['خطة تغذية + تأهيل', 'تحسين الأداء الوظيفي', 'تسريع التعافي', 'نتائج مستدامة']
        : ['Nutrition + rehab plan', 'Functional performance improvement', 'Accelerated recovery', 'Sustainable results'],
      price: isRTL ? 'من 4,500 ج.م/شهر' : 'From 4,500 EGP/month',
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
              <span className="text-gradient">{t('services.title')}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                  <Link to="/auth?mode=register">
                    <Button variant="outline" size="sm">
                      {isRTL ? 'احجز الآن' : 'Book Now'}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'لست متأكداً من الخدمة المناسبة؟' : 'Not Sure Which Service is Right for You?'}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {isRTL 
                ? 'تواصل معنا للحصول على استشارة مجانية وسنساعدك في اختيار البرنامج المناسب'
                : 'Contact us for a free consultation and we\'ll help you choose the right program'
              }
            </p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                {isRTL ? 'احصل على استشارة مجانية' : 'Get Free Consultation'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
