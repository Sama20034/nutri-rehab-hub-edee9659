import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, MessageCircle, Phone, Star, Check, 
  ChevronLeft, ChevronRight, Play, ShoppingBag,
  Target, Users, Award, Zap, Clock, Shield,
  Instagram, Facebook, Twitter, Youtube
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

// Hero Section Component
const HeroSection = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[120px]"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 4 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/20 text-primary border-primary/30">
              {isRTL ? '🔥 انضم لأكثر من 10,000+ متدرب' : '🔥 Join 10,000+ members'}
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-gradient">
              {isRTL ? 'ضمان فورمة مدى الحياة' : 'Lifetime Fitness Guarantee'}
            </span>
            <br />
            <span className="text-foreground">
              {isRTL ? '… مش مجرد نظام' : '…Not Just a Program'}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            {isRTL 
              ? 'متابعة شخصية مع دكتور محمود ريجي وفريق طبي ورياضي باستخدام أحدث أساليب التدريب والتغذية.'
              : 'Personalized follow-up with Dr. Mahmoud Regy and a medical & sports team using the latest training and nutrition methods.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25">
                {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary/50 hover:bg-primary/10">
                <Phone className="h-5 w-5" />
                {isRTL ? 'استشارة مجانية' : 'Free Consultation'}
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '10K+', label: isRTL ? 'متدرب' : 'Members' },
              { value: '98%', label: isRTL ? 'نسبة نجاح' : 'Success Rate' },
              { value: '5+', label: isRTL ? 'سنوات خبرة' : 'Years Experience' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

// Countdown Timer Component
const CountdownTimer = () => {
  const { isRTL } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: isRTL ? 'يوم' : 'Days' },
    { value: timeLeft.hours, label: isRTL ? 'ساعة' : 'Hours' },
    { value: timeLeft.minutes, label: isRTL ? 'دقيقة' : 'Minutes' },
    { value: timeLeft.seconds, label: isRTL ? 'ثانية' : 'Seconds' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge className="mb-4 bg-destructive/20 text-destructive border-destructive/30">
            {isRTL ? '⏰ عرض محدود' : '⏰ Limited Offer'}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            {isRTL ? 'خصم 50% ينتهي قريباً!' : '50% Off Ends Soon!'}
          </h2>

          <div className="flex justify-center gap-4 md:gap-8">
            {timeUnits.map((unit, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-card border border-border rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl md:text-4xl font-bold text-primary">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="mt-2 text-sm text-muted-foreground">{unit.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Transformations Carousel Component
const TransformationsCarousel = () => {
  const { isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const transformations = [
    { name: 'أحمد محمد', before: 95, after: 72, duration: '3 أشهر', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
    { name: 'سارة علي', before: 85, after: 62, duration: '4 أشهر', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400' },
    { name: 'محمد خالد', before: 110, after: 82, duration: '6 أشهر', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' },
    { name: 'نور حسن', before: 78, after: 58, duration: '3 أشهر', image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400' },
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % transformations.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + transformations.length) % transformations.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            {isRTL ? '💪 تحولات حقيقية' : '💪 Real Transformations'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'قصص نجاح عملائنا' : 'Our Success Stories'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'شاهد تحولات حقيقية لأشخاص حققوا أهدافهم معنا'
              : 'See real transformations from people who achieved their goals with us'}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Before/After Card */}
              <Card className="overflow-hidden border-border bg-card">
                <div className="relative aspect-[4/3]">
                  <img
                    src={transformations[currentIndex].image}
                    alt="Transformation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <Badge className="bg-red-500/20 text-red-400 mb-2">
                          {isRTL ? 'قبل' : 'Before'}
                        </Badge>
                        <div className="text-3xl font-bold">{transformations[currentIndex].before} kg</div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-400 mb-2">
                          {isRTL ? 'بعد' : 'After'}
                        </Badge>
                        <div className="text-3xl font-bold">{transformations[currentIndex].after} kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Info Card */}
              <Card className="border-border bg-card flex flex-col justify-center p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{transformations[currentIndex].name}</h3>
                      <p className="text-muted-foreground">
                        {isRTL ? `خسر ${transformations[currentIndex].before - transformations[currentIndex].after} كجم` 
                               : `Lost ${transformations[currentIndex].before - transformations[currentIndex].after} kg`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'المدة' : 'Duration'}</span>
                      <span className="font-semibold">{transformations[currentIndex].duration}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'الخسارة' : 'Lost'}</span>
                      <span className="font-semibold text-green-500">
                        -{transformations[currentIndex].before - transformations[currentIndex].after} kg
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {transformations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Mission Section Component
const MissionSection = () => {
  const { isRTL } = useLanguage();

  const features = [
    { icon: Target, title: isRTL ? 'نتائج مضمونة' : 'Guaranteed Results', desc: isRTL ? 'نلتزم بتحقيق أهدافك' : 'We commit to achieving your goals' },
    { icon: Users, title: isRTL ? 'متابعة شخصية' : 'Personal Follow-up', desc: isRTL ? 'فريق متخصص لك' : 'Dedicated team for you' },
    { icon: Award, title: isRTL ? 'خبرة علمية' : 'Scientific Expertise', desc: isRTL ? 'مبني على أسس علمية' : 'Based on scientific foundations' },
    { icon: Zap, title: isRTL ? 'تحولات سريعة' : 'Fast Transformations', desc: isRTL ? 'نتائج ملموسة في أسابيع' : 'Tangible results in weeks' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              {isRTL ? '🎯 رسالتنا' : '🎯 Our Mission'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {isRTL ? 'ضمان نتائج حقيقية مبنية على العلم' : 'Guaranteed Real Results Based on Science'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {isRTL 
                ? 'نؤمن بأن كل شخص يستحق جسماً صحياً وفورمة مثالية. هدفنا هو تقديم برامج مخصصة تناسب احتياجاتك مع متابعة مستمرة لضمان تحقيق أهدافك.'
                : 'We believe everyone deserves a healthy body and ideal physique. Our goal is to provide customized programs that suit your needs with continuous follow-up to ensure you achieve your goals.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"
                alt="Gym"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Play className="h-8 w-8 text-primary-foreground fill-current" />
              </motion.button>
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -left-6 md:left-auto md:-right-6 bg-card p-4 rounded-xl border border-border shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'رضا العملاء' : 'Client Satisfaction'}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Subscription Plans Preview
const SubscriptionPlans = () => {
  const { isRTL } = useLanguage();

  const plans = [
    {
      name: isRTL ? 'الأساسي' : 'Basic',
      price: 299,
      period: isRTL ? '/شهر' : '/month',
      features: [
        isRTL ? 'برنامج تدريب مخصص' : 'Custom training program',
        isRTL ? 'نظام غذائي أساسي' : 'Basic nutrition plan',
        isRTL ? 'متابعة أسبوعية' : 'Weekly follow-up',
        isRTL ? 'دعم عبر الواتساب' : 'WhatsApp support',
      ],
      popular: false,
    },
    {
      name: isRTL ? 'المميز' : 'Premium',
      price: 499,
      period: isRTL ? '/شهر' : '/month',
      features: [
        isRTL ? 'كل مميزات الأساسي' : 'All Basic features',
        isRTL ? 'متابعة يومية' : 'Daily follow-up',
        isRTL ? 'استشارة طبية' : 'Medical consultation',
        isRTL ? 'فيديوهات تعليمية' : 'Educational videos',
        isRTL ? 'تعديلات غير محدودة' : 'Unlimited adjustments',
      ],
      popular: true,
    },
    {
      name: isRTL ? 'VIP' : 'VIP',
      price: 999,
      period: isRTL ? '/شهر' : '/month',
      features: [
        isRTL ? 'كل مميزات المميز' : 'All Premium features',
        isRTL ? 'مكالمات فيديو' : 'Video calls',
        isRTL ? 'خطة مكملات' : 'Supplements plan',
        isRTL ? 'أولوية في الرد' : 'Priority response',
        isRTL ? 'خصومات على المتجر' : 'Store discounts',
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            {isRTL ? '💎 باقاتنا' : '💎 Our Plans'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'اختر الباقة المناسبة لك' : 'Choose Your Perfect Plan'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'باقات مرنة تناسب جميع الاحتياجات والميزانيات'
              : 'Flexible plans that suit all needs and budgets'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full border-2 ${plan.popular ? 'border-primary' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">
                      {isRTL ? 'الأكثر طلباً' : 'Most Popular'}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{isRTL ? 'ر.س' : 'SAR'}{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/packages">
            <Button variant="link" className="text-primary gap-2">
              {isRTL ? 'عرض جميع الباقات' : 'View All Plans'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Supplements Store Preview
const SupplementsPreview = () => {
  const { isRTL } = useLanguage();

  const products = [
    { name: isRTL ? 'واي بروتين' : 'Whey Protein', price: 199, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300' },
    { name: isRTL ? 'كرياتين' : 'Creatine', price: 89, image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300' },
    { name: isRTL ? 'أوميجا 3' : 'Omega 3', price: 59, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
              {isRTL ? '🛒 متجر المكملات' : '🛒 Supplements Store'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? 'مكملات بإرشاد طبي ورياضي حقيقي' : 'Supplements with Real Medical & Sports Guidance'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? 'نختار لك أفضل المكملات المناسبة لأهدافك مع إرشادات طبية ورياضية متخصصة لضمان أفضل النتائج بأمان.'
                : 'We select the best supplements suited to your goals with specialized medical and sports guidance to ensure the best results safely.'}
            </p>
            <Button className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              {isRTL ? 'تصفح المتجر' : 'Browse Store'}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4"
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  <div className="aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                    <p className="text-primary font-bold">{product.price} {isRTL ? 'ر.س' : 'SAR'}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// FAQ Preview
const FAQPreview = () => {
  const { isRTL } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: isRTL ? 'ما هي مدة البرنامج؟' : 'What is the program duration?',
      a: isRTL ? 'البرامج تبدأ من شهر واحد ويمكن تجديدها حسب احتياجاتك وأهدافك.' : 'Programs start from one month and can be renewed according to your needs and goals.',
    },
    {
      q: isRTL ? 'هل يمكنني التواصل مع المدرب مباشرة؟' : 'Can I communicate with the coach directly?',
      a: isRTL ? 'نعم، جميع الباقات تتضمن تواصل مباشر عبر الواتساب مع فريقنا المتخصص.' : 'Yes, all packages include direct communication via WhatsApp with our specialized team.',
    },
    {
      q: isRTL ? 'هل النظام مناسب للمبتدئين؟' : 'Is the system suitable for beginners?',
      a: isRTL ? 'بالتأكيد! نصمم برامج مخصصة تناسب جميع المستويات من المبتدئين إلى المحترفين.' : 'Absolutely! We design custom programs that suit all levels from beginners to professionals.',
    },
    {
      q: isRTL ? 'ماذا لو لم أحقق النتائج المرجوة؟' : 'What if I don\'t achieve the desired results?',
      a: isRTL ? 'نضمن لك النتائج مع الالتزام بالبرنامج، وفي حال عدم تحقيقها نقدم فترة إضافية مجانية.' : 'We guarantee results with program commitment, and if not achieved, we offer a free additional period.',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            {isRTL ? '❓ أسئلة شائعة' : '❓ FAQ'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            {isRTL ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`border-2 transition-colors cursor-pointer ${
                  openIndex === index ? 'border-primary' : 'border-border'
                }`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{faq.q}</h4>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-5 w-5 rotate-90" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground mt-3 overflow-hidden"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTA = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {isRTL ? 'ابدأ رحلتك نحو جسم أفضل اليوم!' : 'Start Your Journey to a Better Body Today!'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {isRTL 
              ? 'تواصل معنا الآن واحصل على استشارة مجانية لتحديد أفضل برنامج يناسبك'
              : 'Contact us now and get a free consultation to determine the best program for you'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-5 w-5" />
                {isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
              </Button>
            </a>
            <Link to="/register">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary/50">
                {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {[
              { icon: Shield, label: isRTL ? 'دفع آمن' : 'Secure Payment' },
              { icon: Clock, label: isRTL ? 'دعم 24/7' : '24/7 Support' },
              { icon: Award, label: isRTL ? 'ضمان النتائج' : 'Results Guarantee' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const FooterSection = () => {
  const { isRTL } = useLanguage();

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-gradient mb-4">FitLife</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {isRTL 
                ? 'منصة متكاملة للتدريب والتغذية مع متابعة شخصية من فريق متخصص لضمان تحقيق أهدافك.'
                : 'An integrated platform for training and nutrition with personal follow-up from a specialized team to ensure you achieve your goals.'}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{isRTL ? 'روابط سريعة' : 'Quick Links'}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">{isRTL ? 'الرئيسية' : 'Home'}</Link></li>
              <li><Link to="/packages" className="hover:text-primary transition-colors">{isRTL ? 'الباقات' : 'Packages'}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">{isRTL ? 'من نحن' : 'About'}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{isRTL ? 'تواصل معنا' : 'Contact'}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{isRTL ? 'قانوني' : 'Legal'}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/policies" className="hover:text-primary transition-colors">{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="/service-policy" className="hover:text-primary transition-colors">{isRTL ? 'شروط الخدمة' : 'Terms of Service'}</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 FitLife. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Index Component
const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CountdownTimer />
      <TransformationsCarousel />
      <MissionSection />
      <SubscriptionPlans />
      <SupplementsPreview />
      <FAQPreview />
      <FinalCTA />
      <FooterSection />
    </Layout>
  );
};

export default Index;