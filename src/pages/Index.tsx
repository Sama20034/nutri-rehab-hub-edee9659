import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Apple, 
  Video, 
  Calendar, 
  TrendingUp, 
  Users,
  Star,
  ArrowRight,
  Heart,
  Activity,
  Plus,
  Cross,
  Dumbbell,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { t, isRTL } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Stethoscope,
      title: t('features.consultation.title'),
      description: t('features.consultation.desc'),
    },
    {
      icon: Calendar,
      title: t('features.programs.title'),
      description: t('features.programs.desc'),
    },
    {
      icon: TrendingUp,
      title: t('features.tracking.title'),
      description: t('features.tracking.desc'),
    },
    {
      icon: Video,
      title: t('features.videos.title'),
      description: t('features.videos.desc'),
    },
  ];

  const services = [
    {
      icon: Activity,
      title: t('services.rehab.title'),
      description: t('services.rehab.desc'),
      color: 'from-primary to-accent',
    },
    {
      icon: Apple,
      title: t('services.nutrition.title'),
      description: t('services.nutrition.desc'),
      color: 'from-accent to-primary',
    },
    {
      icon: Heart,
      title: t('services.sports.title'),
      description: t('services.sports.desc'),
      color: 'from-primary to-secondary',
    },
    {
      icon: Video,
      title: t('services.online.title'),
      description: t('services.online.desc'),
      color: 'from-secondary to-primary',
    },
  ];

  const stats = [
    { value: '5000+', label: t('stats.clients') },
    { value: '50+', label: t('stats.doctors') },
    { value: '25000+', label: t('stats.sessions') },
    { value: '4.9', label: t('stats.rating') },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a1a1f]">
        {/* Wave Background SVG */}
        <div className="absolute inset-0 z-0">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d2a2d" />
                <stop offset="100%" stopColor="#1a4a4f" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a4a4f" />
                <stop offset="50%" stopColor="#2d5a5f" />
                <stop offset="100%" stopColor="#1a4a4f" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q300,100 600,200 T1200,180 T1920,220 L1920,0 L0,0 Z" fill="url(#waveGradient1)" opacity="0.6" />
            <path d="M0,350 Q400,250 800,350 T1600,320 T1920,380 L1920,0 L0,0 Z" fill="url(#waveGradient2)" opacity="0.4" />
            <path d="M0,500 Q500,400 1000,500 T1920,480 L1920,0 L0,0 Z" fill="#1a3a3f" opacity="0.3" />
          </svg>
        </div>

        {/* Particle/Sparkle Effect */}
        <div className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Floating Medical Icons */}
        <motion.div
          className="absolute left-[10%] top-[20%] z-0"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-primary/50" />
          </div>
        </motion.div>

        <motion.div
          className="absolute left-[25%] top-[50%] z-0"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-accent/30 flex items-center justify-center">
            <Plus className="w-6 h-6 text-accent/50" />
          </div>
        </motion.div>

        <motion.div
          className="absolute left-[15%] top-[70%] z-0"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-primary/40" />
          </div>
        </motion.div>

        <motion.div
          className="absolute right-[15%] top-[15%] z-0"
          animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-accent/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-accent/50" />
          </div>
        </motion.div>

        <motion.div
          className="absolute right-[25%] top-[60%] z-0"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-primary/25 flex items-center justify-center">
            <Apple className="w-6 h-6 text-primary/40" />
          </div>
        </motion.div>

        <motion.div
          className="absolute right-[10%] top-[40%] z-0"
          animate={{ y: [0, 12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-14 h-14 rounded-full border-2 border-accent/20 flex items-center justify-center">
            <Plus className="w-7 h-7 text-accent/40" />
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">{isRTL ? 'رحلتك نحو ' : 'Your Journey to '}</span>
              <span className="text-primary">{isRTL ? 'التعافي' : 'Recovery'}</span>
              <span className="text-white">{isRTL ? ' تبدأ' : ' Starts'}</span>
              <br />
              <span className="text-primary">{isRTL ? 'هنا' : 'Here'}</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {isRTL 
                ? 'منصة متكاملة للتأهيل الطبي والتغذية العلاجية أونلاين'
                : 'An integrated platform for medical rehabilitation and clinical nutrition online'
              }
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl">
                  {isRTL ? 'ابدأ رحلتك' : 'Start Your Journey'}
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                  <Play className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'اكتشف خدماتنا' : 'Discover Our Services'}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              {t('features.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-500 shadow-card hover:shadow-elevated"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              {t('services.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
              {t('services.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative p-8 rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-500"
              >
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-32 h-32 bg-gradient-to-br ${service.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10 flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/services">
              <Button variant="outline" size="lg">
                {isRTL ? 'عرض جميع الخدمات' : 'View All Services'}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isRTL ? 'ابدأ رحلة التعافي اليوم' : 'Start Your Recovery Journey Today'}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                {isRTL 
                  ? 'انضم إلى آلاف العملاء الذين غيروا حياتهم مع NutriRehab'
                  : 'Join thousands of clients who have transformed their lives with NutriRehab'
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=register">
                  <Button variant="hero" size="lg">
                    {isRTL ? 'سجل مجاناً الآن' : 'Register for Free'}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    {t('nav.contact')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
