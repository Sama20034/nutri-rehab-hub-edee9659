import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Star, Check, ChevronLeft, ChevronRight, ShoppingBag, Target, Users, Award, Zap, Clock, Shield, Instagram, Facebook, Twitter, Youtube, Dumbbell, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import drMahmoud1 from '@/assets/dr-mahmoud-1.png';
import drMahmoud2 from '@/assets/dr-mahmoud-new.jpg';
import alligatorFitLogo from '@/assets/alligator-fit-logo.png';

// Import transformation images
import transformBefore1 from '@/assets/transformation-before.png';
import transformAfter1 from '@/assets/transformation-after.png';
import transformBefore2 from '@/assets/transformation2-before.png';
import transformAfter2 from '@/assets/transformation2-after.png';
import transformBefore3 from '@/assets/transformation3-before.png';
import transformAfter3 from '@/assets/transformation3-after.png';
import transformBefore4 from '@/assets/transformation4-before.png';
import transformAfter4 from '@/assets/transformation4-after.png';
import transformBefore5 from '@/assets/transformation5-before.png';
import transformAfter5 from '@/assets/transformation5-after.png';
import transformBefore6 from '@/assets/transformation6-before.png';
import transformAfter6 from '@/assets/transformation6-after.png';
import transformCombined7 from '@/assets/transformation7-combined.png';
import emojiMask from '@/assets/emoji-mask.png';

// Map for local assets
const assetMap: Record<string, string> = {
  '/assets/transformation-before.png': transformBefore1,
  '/assets/transformation-after.png': transformAfter1,
  '/assets/transformation2-before.png': transformBefore2,
  '/assets/transformation2-after.png': transformAfter2,
  '/assets/transformation3-before.png': transformBefore3,
  '/assets/transformation3-after.png': transformAfter3,
  '/assets/transformation4-before.png': transformBefore4,
  '/assets/transformation4-after.png': transformAfter4,
  '/assets/transformation5-before.png': transformBefore5,
  '/assets/transformation5-after.png': transformAfter5,
  '/assets/transformation6-before.png': transformBefore6,
  '/assets/transformation6-after.png': transformAfter6,
  '/assets/transformation7-combined.png': transformCombined7,
};

const getImageSrc = (url: string | null) => {
  if (!url) return '';
  return assetMap[url] || url;
};

// Hero Transformation Card Component
const HeroTransformationCard = () => {
  const { isRTL } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTransformations = async () => {
      const { data } = await supabase
        .from('transformations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data && data.length > 0) {
        setTransformations(data);
      }
    };
    fetchTransformations();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (transformations.length === 0) return;
    const timer = setInterval(() => {
      setIsFlipped(false); // Reset flip when changing
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % transformations.length);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [transformations.length]);

  if (transformations.length === 0) {
    return (
      <div className="relative max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
        <div className="aspect-[3/4] rounded-2xl bg-card/50 border border-border animate-pulse" />
      </div>
    );
  }

  const transformation = transformations[currentIndex];
  const beforeImage = getImageSrc(transformation.before_image_url);
  const afterImage = getImageSrc(transformation.after_image_url);
  const isCombined = transformation.is_combined_image;

  return (
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-secondary/20 rounded-3xl blur-3xl" />
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="relative z-10 max-w-[280px] sm:max-w-sm md:max-w-md mx-auto perspective-1000"
      >
        <div
          onClick={() => !isCombined && setIsFlipped(!isFlipped)}
          className={`relative aspect-[3/4] cursor-pointer transition-transform duration-700 ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front - Before */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/50"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={beforeImage}
              alt="Before"
              className="w-full h-full object-cover object-top"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Duration Badge - Top Left */}
            {transformation.duration_text && (
              <div className="absolute top-4 left-4 flex items-center gap-1 text-white/90 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{transformation.duration_text}</span>
              </div>
            )}

            {/* Before Label - Top Right */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
              {isRTL ? 'قبل' : 'Before'}
            </div>

            {/* Click for Result Button */}
            {!isCombined && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2"
                >
                  👆 {isRTL ? 'اضغط للنتيجة' : 'Click for result'}
                </motion.div>
              </div>
            )}

            {/* Client Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white/70 text-xs">{isRTL ? 'خسارة الوزن' : 'Weight Loss'}</div>
              <div className="text-white font-bold text-sm sm:text-base">{transformation.client_name}</div>
            </div>
          </div>

          {/* Back - After */}
          {!isCombined && (
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-secondary/50 [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <img
                src={afterImage}
                alt="After"
                className="w-full h-full object-cover object-top"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* After Label */}
              <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {isRTL ? 'بعد' : 'After'}
              </div>

              {/* Weight Loss Badge */}
              {transformation.weight_before && transformation.weight_after && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  -{transformation.weight_before - transformation.weight_after} kg
                </div>
              )}

              {/* Client Info */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="text-white font-bold text-sm sm:text-base">{transformation.client_name}</div>
                <div className="flex justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4 relative z-20">
        {transformations.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary w-6 sm:w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-card/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border shadow-xl z-20"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          <span className="font-bold text-xs sm:text-sm">{isRTL ? 'تدريب احترافي' : 'Pro Training'}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-16 left-3 sm:bottom-20 sm:left-4 bg-card/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border shadow-xl z-20"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="font-bold text-xs sm:text-sm">{isRTL ? 'صحة مضمونة' : 'Guaranteed Health'}</span>
        </div>
      </motion.div>
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  const {
    isRTL
  } = useLanguage();
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Athletic Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Dynamic energy lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(8)].map((_, i) => <motion.div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" style={{
          top: `${15 + i * 12}%`,
          left: '-100%',
          width: '300%',
          transform: `rotate(${-5 + i * 2}deg)`
        }} animate={{
          x: ['0%', '33%']
        }} transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: 'linear'
        }} />)}
        </div>
      </div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-secondary/40 rounded-full" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        y: [0, -50, 0],
        opacity: [0.2, 1, 0.2],
        scale: [1, 2, 1]
      }} transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 2
      }} />)}
      </div>

      {/* Green/Orange Gradient Orbs */}
      <motion.div className="absolute top-1/4 left-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[150px]" animate={{
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.4, 0.2]
    }} transition={{
      duration: 10,
      repeat: Infinity
    }} />
      <motion.div className="absolute bottom-1/4 right-0 w-[150px] md:w-[400px] h-[150px] md:h-[400px] bg-secondary/20 rounded-full blur-[60px] md:blur-[120px]" animate={{
      scale: [1.2, 1, 1.2],
      opacity: [0.2, 0.4, 0.2]
    }} transition={{
      duration: 8,
      repeat: Infinity,
      delay: 4
    }} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-20 sm:pt-24">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Hero Image - Left on desktop */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="relative order-2 lg:order-1">
            <HeroTransformationCard />

            {/* Description - Below image */}
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6
          }} className="text-sm sm:text-base md:text-lg text-muted-foreground mt-4 sm:mt-6 text-center max-w-xs sm:max-w-md mx-auto px-2">
              {isRTL ? 'مع د. محمود الريقي وفريق طبي متخصص - تقييم طبي ، تدريب رياضي، ومتابعة شخصية.' : 'With Dr. Mahmoud Al-Reaky and specialized medical team - therapeutic nutrition, sports training, and personal follow-up.'}
            </motion.p>
          </motion.div>

          {/* Content - Right on desktop */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8
        }} className="text-right order-1 lg:order-2">
            {/* Badge */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="mb-6 flex justify-start">
              <Badge className="px-4 py-2 text-sm bg-secondary/20 text-secondary border-secondary/30 font-bold">
                {isRTL ? '🔥 Alligator Fit - القوة والصحة' : '🔥 Alligator Fit - Power & Health'}
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                {isRTL ? 'ضمان مكمل معاك للاخر' : 'Lifetime Fitness'}
              </span>
              <br />
              
            </motion.h1>



            {/* Stats */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.7
          }} className="mt-6 sm:mt-8 md:mt-12 grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
              {[{
              value: '16K',
              label: isRTL ? 'مستفيد' : 'Members',
              icon: Users
            }, {
              value: '98%',
              label: isRTL ? 'نجاح' : 'Success',
              icon: Award
            }, {
              value: '+10',
              label: isRTL ? 'سنوات' : 'Years',
              icon: Clock
            }].map((stat, index) => <div key={index} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card/50 border border-border/50">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-secondary" />
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>)}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity
    }}>
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2">
          <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{
          y: [0, 12, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
        </div>
      </motion.div>
    </section>;
};

// Countdown Timer Component
const CountdownTimer = () => {
  const {
    isRTL
  } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let {
          days,
          hours,
          minutes,
          seconds
        } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        return {
          days,
          hours,
          minutes,
          seconds
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const timeUnits = [{
    value: timeLeft.days,
    label: isRTL ? 'يوم' : 'Days'
  }, {
    value: timeLeft.hours,
    label: isRTL ? 'ساعة' : 'Hours'
  }, {
    value: timeLeft.minutes,
    label: isRTL ? 'دقيقة' : 'Minutes'
  }, {
    value: timeLeft.seconds,
    label: isRTL ? 'ثانية' : 'Seconds'
  }];
  return <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center">
          <Badge className="mb-3 sm:mb-4 bg-destructive/20 text-destructive border-destructive/30 text-xs sm:text-sm">
            {isRTL ? '⏰ عرض محدود' : '⏰ Limited Offer'}
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
            {isRTL ? 'خصم 50% ينتهي قريباً!' : '50% Off Ends Soon!'}
          </h2>

          <div className="flex justify-center gap-2 sm:gap-4 md:gap-8">
            {timeUnits.map((unit, index) => <motion.div key={index} initial={{
            scale: 0
          }} whileInView={{
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-card border border-border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl sm:text-2xl md:text-4xl font-bold text-primary">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">{unit.label}</span>
              </motion.div>)}
          </div>
        </motion.div>
      </div>
    </section>;
};

// Before/After Flip Cards Section Component - Original Design
const BeforeAfterFlipCards = () => {
  const { isRTL } = useLanguage();
  const [transformations, setTransformations] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTransformations = async () => {
      const { data } = await supabase
        .from('transformations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data && data.length > 0) {
        setTransformations(data);
      }
    };
    fetchTransformations();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (transformations.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % transformations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [transformations.length]);

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, { ar: string; en: string }> = {
      'weight_loss': { ar: 'خسارة الوزن', en: 'Weight Loss' },
      'muscle_building': { ar: 'بناء عضلات', en: 'Muscle Building' },
      'body_transformation': { ar: 'تحول كامل', en: 'Body Transformation' },
      'health_improvement': { ar: 'تحسين الصحة', en: 'Health Improvement' },
    };
    return categories[category] ? (isRTL ? categories[category].ar : categories[category].en) : category;
  };

  if (transformations.length === 0) return null;

  // Get visible cards for carousel (show 3 at a time on desktop)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < Math.min(3, transformations.length); i++) {
      const index = (currentIndex + i) % transformations.length;
      cards.push({ ...transformations[index], originalIndex: index });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <Badge className="px-6 py-2 text-base sm:text-lg bg-secondary text-secondary-foreground border-secondary font-bold">
            ⭐ {isRTL ? 'تم التحول!' : 'Transformed!'}
          </Badge>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          <div className="flex justify-center items-center gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {visibleCards.map((item, displayIndex) => {
                const beforeImage = getImageSrc(item.before_image_url);
                const afterImage = getImageSrc(item.after_image_url);
                const isFlipped = flippedCards[item.originalIndex];
                const isCombined = item.is_combined_image;
                const isCenter = displayIndex === 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ 
                      opacity: isCenter ? 1 : 0.6, 
                      scale: isCenter ? 1 : 0.85,
                      x: 0,
                      zIndex: isCenter ? 10 : 5 - displayIndex
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className={`perspective-1000 ${isCenter ? 'w-72 sm:w-80 md:w-96' : 'hidden md:block w-64 md:w-72'}`}
                  >
                    <div
                      onClick={() => !isCombined && toggleFlip(item.originalIndex)}
                      className={`relative aspect-[3/4] cursor-pointer transition-transform duration-700 ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front - Before */}
                      <div
                        className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl ${
                          isCenter ? 'border-4 border-primary/50' : 'border-2 border-border'
                        }`}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <img
                          src={beforeImage}
                          alt="Before"
                          className="w-full h-full object-cover object-top"
                        />
                        
                        {/* Emoji Mask */}
                        {item.use_emoji_mask && (
                          <img
                            src={emojiMask}
                            alt=""
                            className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain z-10"
                          />
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        {/* Duration Badge - Top Left */}
                        {item.duration_text && (
                          <div className="absolute top-4 left-4 flex items-center gap-1 text-white/90 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.duration_text}</span>
                          </div>
                        )}
                        
                        {/* Before Badge - Top Right */}
                        <Badge className="absolute top-4 right-4 bg-card/90 text-foreground text-xs px-3 py-1">
                          {isRTL ? 'قبل' : 'Before'}
                        </Badge>
                        
                        {/* Green CTA Button */}
                        {!isCombined && (
                          <motion.div 
                            className="absolute right-4 bottom-24 sm:bottom-28"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-full shadow-lg"
                              size="sm"
                            >
                              {isRTL ? 'اضغط للنتيجة' : 'Click for result'} 👆
                            </Button>
                          </motion.div>
                        )}
                        
                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                          {/* Category */}
                          {item.category && (
                            <p className="text-primary text-xs sm:text-sm font-medium mb-1">
                              {getCategoryLabel(item.category)}
                            </p>
                          )}
                          {/* Client Name */}
                          <h3 className="text-white text-lg sm:text-xl font-bold">
                            {item.client_name || item.title}
                          </h3>
                        </div>
                      </div>

                      {/* Back - After */}
                      {!isCombined && afterImage && (
                        <div
                          className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-primary shadow-2xl [transform:rotateY(180deg)]"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <img
                            src={afterImage}
                            alt="After"
                            className="w-full h-full object-cover object-top"
                          />
                          
                          {/* Emoji Mask on After */}
                          {item.use_emoji_mask && (
                            <img
                              src={emojiMask}
                              alt=""
                              className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain z-10"
                            />
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          {/* After Badge */}
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1">
                            {isRTL ? 'بعد' : 'After'}
                          </Badge>
                          
                          {/* Result Stats */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                            {item.weight_before && item.weight_after && (
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-primary/90 text-primary-foreground">
                                  -{item.weight_before - item.weight_after} kg 🎉
                                </Badge>
                              </div>
                            )}
                            <h3 className="text-white text-lg sm:text-xl font-bold">
                              {item.client_name || item.title}
                            </h3>
                            {item.duration_text && (
                              <p className="text-primary text-sm mt-1">
                                {isRTL ? `في ${item.duration_text}` : `In ${item.duration_text}`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {transformations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Transformations Carousel Component (Success Stories)
const TransformationsCarousel = () => {
  const { isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transformations from database
  useEffect(() => {
    const fetchTransformations = async () => {
      const { data, error } = await supabase
        .from('transformations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (!error && data && data.length > 0) {
        setTransformations(data);
      }
      setLoading(false);
    };
    
    fetchTransformations();
  }, []);

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % transformations.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + transformations.length) % transformations.length);
  
  useEffect(() => {
    if (transformations.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [transformations.length]);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse h-64 bg-muted rounded-lg"></div>
        </div>
      </section>
    );
  }

  if (transformations.length === 0) {
    return null;
  }

  const current = transformations[currentIndex];
  const weightBefore = current.weight_before || 0;
  const weightAfter = current.weight_after || 0;
  const clientName = current.client_name || '';
  const duration = current.duration_text || '';
  const beforeImage = getImageSrc(current.before_image_url);
  const afterImage = getImageSrc(current.after_image_url);
  const rating = current.rating || 5;
  const isCombined = current.is_combined_image;
  const useEmojiMask = current.use_emoji_mask;

  return <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
            {isRTL ? '💪 تحولات حقيقية' : '💪 Real Transformations'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {isRTL ? 'قصص نجاح عملائنا' : 'Our Success Stories'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {isRTL ? 'شاهد تحولات حقيقية لأشخاص حققوا أهدافهم معنا' : 'See real transformations from people who achieved their goals with us'}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-2 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{
            opacity: 0,
            x: 100
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -100
          }} transition={{
            duration: 0.5
          }} className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              
              {/* Before/After Images Card */}
              <Card className="overflow-hidden border-border bg-card">
                {isCombined ? (
                  // Combined image (before & after in one)
                  <div className="relative aspect-[4/3]">
                    <img src={beforeImage} alt="Before & After" className="w-full h-full object-cover" />
                    {useEmojiMask && (
                      <img 
                        src={emojiMask} 
                        alt="" 
                        className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 object-contain"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <Badge className="bg-red-500/20 text-red-400 mb-2">
                            {isRTL ? 'قبل' : 'Before'}
                          </Badge>
                          <div className="text-2xl font-bold">{weightBefore} kg</div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-500/20 text-green-400 mb-2">
                            {isRTL ? 'بعد' : 'After'}
                          </Badge>
                          <div className="text-2xl font-bold">{weightAfter} kg</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Separate before and after images
                  <div className="relative aspect-[4/3] grid grid-cols-2 gap-1">
                    <div className="relative">
                      <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                      {useEmojiMask && (
                        <img 
                          src={emojiMask} 
                          alt="" 
                          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 object-contain"
                        />
                      )}
                      <Badge className="absolute bottom-2 left-2 bg-red-500/80 text-white">
                        {isRTL ? 'قبل' : 'Before'}
                      </Badge>
                    </div>
                    <div className="relative">
                      <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                      {useEmojiMask && (
                        <img 
                          src={emojiMask} 
                          alt="" 
                          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 object-contain"
                        />
                      )}
                      <Badge className="absolute bottom-2 right-2 bg-green-500/80 text-white">
                        {isRTL ? 'بعد' : 'After'}
                      </Badge>
                    </div>
                  </div>
                )}
              </Card>

              {/* Info Card */}
              <Card className="border-border bg-card flex flex-col justify-center p-6">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{clientName}</h3>
                      <p className="text-muted-foreground">
                        {isRTL ? `خسر ${weightBefore - weightAfter} كجم` : `Lost ${weightBefore - weightAfter} kg`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'الوزن قبل' : 'Weight Before'}</span>
                      <span className="font-semibold text-red-400">{weightBefore} kg</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'الوزن بعد' : 'Weight After'}</span>
                      <span className="font-semibold text-green-400">{weightAfter} kg</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'المدة' : 'Duration'}</span>
                      <span className="font-semibold">{duration}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="text-muted-foreground">{isRTL ? 'الخسارة' : 'Lost'}</span>
                      <span className="font-semibold text-primary">
                        -{weightBefore - weightAfter} kg 🎉
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-4 md:-translate-x-12 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors z-10">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-4 md:translate-x-12 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors z-10">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {transformations.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'}`} />)}
          </div>
        </div>
      </div>
    </section>;
};

// Mission Section Component
const MissionSection = () => {
  const {
    isRTL
  } = useLanguage();
  const features = [{
    icon: Target,
    title: isRTL ? 'نتائج مضمونه بإذن الله' : 'Guaranteed Results',
    desc: isRTL ? 'نلتزم بتحقيق أهدافك' : 'We commit to achieving your goals'
  }, {
    icon: Users,
    title: isRTL ? 'متابعة شخصية' : 'Personal Follow-up',
    desc: isRTL ? 'فريق متخصص لك مع متابعه مع د. محمود الريقي شخصياً' : 'Dedicated team for you'
  }, {
    icon: Award,
    title: isRTL ? 'خبرة علمية' : 'Scientific Expertise',
    desc: isRTL ? 'مبني على أسس علميه في علم الطب والرياضه والتغذيه' : 'Based on scientific foundations'
  }, {
    icon: Zap,
    title: isRTL ? 'تحولات سريعة' : 'Fast Transformations',
    desc: isRTL ? 'نتائج ملموسة في أسابيع' : 'Tangible results in weeks'
  }, {
    icon: Award,
    title: isRTL ? 'شهادات معتمدة' : 'Certified Credentials',
    desc: isRTL ? 'اكتر من 20 شهاده و ميدالية رياضية' : 'More than 20 certificates and sports medals'
  }];
  return <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }}>
            <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
              {isRTL ? '🎯 رسالتنا' : '🎯 Our Mission'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              {isRTL ? 'ضمان نتائج حقيقية مبنية على العلم' : 'Guaranteed Real Results Based on Science'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
              {isRTL ? 'نؤمن بأن كل شخص يستحق جسماً صحياً وفورمة مثالية. هدفنا هو تقديم برامج مخصصة تناسب احتياجاتك مع متابعة مستمرة لضمان تحقيق أهدافك.' : 'We believe everyone deserves a healthy body and ideal physique. Our goal is to provide customized programs that suit your needs with continuous follow-up to ensure you achieve your goals.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1
            }} className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>)}
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={drMahmoud2} alt="Dr. Mahmoud Regy - Alligator Fit" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
            </div>

            {/* Floating Card */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="absolute -bottom-6 -left-6 md:left-auto md:-right-6 bg-card p-4 rounded-xl border border-border shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
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
    </section>;
};

// Subscription Plans Preview
const SubscriptionPlans = () => {
  const { isRTL } = useLanguage();
  
  const plans = [
    {
      name: isRTL ? '6 أسابيع' : '6 Weeks',
      regularPrice: 999,
      medicalPrice: 1499,
      features: [
        isRTL ? 'برنامج تدريب مخصص' : 'Custom training program',
        isRTL ? 'نظام غذائي شخصي' : 'Personalized diet plan',
        isRTL ? 'متابعة أسبوعية' : 'Weekly follow-up',
        isRTL ? 'دعم عبر الواتساب' : 'WhatsApp support'
      ],
      popular: false,
      bestValue: false
    },
    {
      name: isRTL ? 'تحدي 90 يوم' : '90 Days Challenge',
      regularPrice: 1699,
      medicalPrice: 1999,
      features: [
        isRTL ? 'كل مميزات 6 أسابيع' : 'All 6 Weeks features',
        isRTL ? 'متابعة يومية' : 'Daily follow-up',
        isRTL ? 'فيديوهات تعليمية' : 'Educational videos',
        isRTL ? 'تعديلات غير محدودة' : 'Unlimited adjustments'
      ],
      popular: true,
      bestValue: false
    },
    {
      name: isRTL ? '6 شهور' : '6 Months',
      regularPrice: 2999,
      medicalPrice: 4000,
      features: [
        isRTL ? 'كل مميزات 90 يوم' : 'All 90 Days features',
        isRTL ? 'مكالمات فيديو شهرية' : 'Monthly video calls',
        isRTL ? 'خطة مكملات' : 'Supplements plan',
        isRTL ? 'أولوية في الرد' : 'Priority response'
      ],
      popular: false,
      bestValue: false
    },
    {
      name: isRTL ? 'سنة كاملة' : 'Full Year',
      regularPrice: 5999,
      medicalPrice: 8000,
      features: [
        isRTL ? 'كل مميزات 6 شهور' : 'All 6 Months features',
        isRTL ? 'مكالمات فيديو أسبوعية' : 'Weekly video calls',
        isRTL ? 'خصومات حصرية' : 'Exclusive discounts',
        isRTL ? 'دعم VIP' : 'VIP support'
      ],
      popular: false,
      bestValue: true
    }
  ];

  const [medicalToggles, setMedicalToggles] = useState<boolean[]>(plans.map(() => false));

  const toggleMedical = (index: number) => {
    const newToggles = [...medicalToggles];
    newToggles[index] = !newToggles[index];
    setMedicalToggles(newToggles);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
            {isRTL ? '💎 باقاتنا' : '💎 Our Plans'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {isRTL ? 'اختر الباقة المناسبة لك' : 'Choose Your Perfect Plan'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {isRTL ? 'باقات مرنة تناسب جميع الاحتياجات والميزانيات' : 'Flexible plans that suit all needs and budgets'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const isMedical = medicalToggles[index];
            const currentPrice = isMedical ? plan.medicalPrice : plan.regularPrice;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`relative h-full border-2 bg-card/50 backdrop-blur-sm ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 whitespace-nowrap">
                        {isRTL ? 'الأكثر طلباً' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  {plan.bestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-amber-500 text-white px-4 whitespace-nowrap">
                        {isRTL ? 'أفضل قيمة' : 'Best Value'}
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-3">{plan.name}</h3>
                      
                      {/* Medical Toggle */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className={`text-xs ${!isMedical ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {isRTL ? 'عادي' : 'Regular'}
                        </span>
                        <Switch
                          checked={isMedical}
                          onCheckedChange={() => toggleMedical(index)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className={`text-xs ${isMedical ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {isRTL ? 'طبي' : 'Medical'}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl font-bold text-primary">{currentPrice}</span>
                        <span className="text-muted-foreground text-sm">
                          {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/register">
                      <Button 
                        className={`w-full text-sm ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} 
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/packages">
            <Button variant="link" className="text-primary gap-2">
              {isRTL ? 'عرض تفاصيل الباقات' : 'View Plan Details'}
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
  const {
    isRTL
  } = useLanguage();
  const products = [{
    name: isRTL ? 'واي بروتين' : 'Whey Protein',
    price: 199,
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300'
  }, {
    name: isRTL ? 'كرياتين' : 'Creatine',
    price: 89,
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300'
  }, {
    name: isRTL ? 'أوميجا 3' : 'Omega 3',
    price: 59,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
  }];
  return <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }}>
            <Badge className="mb-3 sm:mb-4 bg-accent/20 text-accent border-accent/30 text-xs sm:text-sm">
              {isRTL ? '🛒 متجر المكملات' : '🛒 Supplements Store'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              {isRTL ? 'مكملات بإرشاد طبي ورياضي حقيقي' : 'Supplements with Real Medical & Sports Guidance'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {isRTL ? 'نختار لك أفضل المكملات المناسبة لأهدافك مع إرشادات طبية ورياضية متخصصة لضمان أفضل النتائج بأمان.' : 'We select the best supplements suited to your goals with specialized medical and sports guidance to ensure the best results safely.'}
            </p>
            <Button className="gap-2 text-sm sm:text-base">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {isRTL ? 'تصفح المتجر' : 'Browse Store'}
            </Button>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {products.map((product, index) => <motion.div key={index} whileHover={{
            y: -5
          }} className="group">
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  <div className="aspect-square relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                    <p className="text-primary font-bold">{product.price} {isRTL ? 'ر.س' : 'SAR'}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </div>
    </section>;
};

// FAQ Preview
const FAQPreview = () => {
  const {
    isRTL
  } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{
    q: isRTL ? 'ما هي مدة البرنامج؟' : 'What is the program duration?',
    a: isRTL ? 'البرامج تبدأ من شهر واحد ويمكن تجديدها حسب احتياجاتك وأهدافك.' : 'Programs start from one month and can be renewed according to your needs and goals.'
  }, {
    q: isRTL ? 'هل يمكنني التواصل مع المدرب مباشرة؟' : 'Can I communicate with the coach directly?',
    a: isRTL ? 'نعم، جميع الباقات تتضمن تواصل مباشر عبر الواتساب مع فريقنا المتخصص.' : 'Yes, all packages include direct communication via WhatsApp with our specialized team.'
  }, {
    q: isRTL ? 'هل النظام مناسب للمبتدئين؟' : 'Is the system suitable for beginners?',
    a: isRTL ? 'بالتأكيد! نصمم برامج مخصصة تناسب جميع المستويات من المبتدئين إلى المحترفين.' : 'Absolutely! We design custom programs that suit all levels from beginners to professionals.'
  }, {
    q: isRTL ? 'ماذا لو لم أحقق النتائج المرجوة؟' : 'What if I don\'t achieve the desired results?',
    a: isRTL ? 'نضمن لك النتائج مع الالتزام بالبرنامج، وفي حال عدم تحقيقها نقدم فترة إضافية مجانية.' : 'We guarantee results with program commitment, and if not achieved, we offer a free additional period.'
  }];
  return <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
            {isRTL ? '❓ أسئلة شائعة' : '❓ FAQ'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {isRTL ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }}>
              <Card className={`border-2 transition-colors cursor-pointer ${openIndex === index ? 'border-primary' : 'border-border'}`} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{faq.q}</h4>
                    <motion.div animate={{
                  rotate: openIndex === index ? 180 : 0
                }} transition={{
                  duration: 0.2
                }}>
                      <ChevronRight className="h-5 w-5 rotate-90" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {openIndex === index && <motion.p initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: 'auto',
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }} className="text-muted-foreground mt-3 overflow-hidden">
                        {faq.a}
                      </motion.p>}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
};

// Final CTA Section
const FinalCTA = () => {
  const {
    isRTL
  } = useLanguage();
  return <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" animate={{
        scale: [1, 1.2, 1]
      }} transition={{
        duration: 6,
        repeat: Infinity
      }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-accent/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" animate={{
        scale: [1.2, 1, 1.2]
      }} transition={{
        duration: 6,
        repeat: Infinity
      }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            {isRTL ? 'ابدأ رحلتك نحو جسم أفضل اليوم!' : 'Start Your Journey to a Better Body Today!'}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
            {isRTL ? 'تواصل معنا الآن واحصل على استشارة مجانية لتحديد أفضل برنامج يناسبك' : 'Contact us now and get a free consultation to determine the best program for you'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="https://wa.me/201016111733" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-[#25D366] hover:bg-[#20BD5A]">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                {isRTL ? 'ادفع عن طريق الواتساب' : 'Pay via WhatsApp'}
              </Button>
            </a>
            <Link to="/payment" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 border-primary/50">
                {isRTL ? 'اشترك الان عبر الدفع الالكتروني' : 'Subscribe via Electronic Payment'}
                <ArrowRight className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[{
            icon: Shield,
            label: isRTL ? 'دفع آمن' : 'Secure Payment'
          }, {
            icon: Clock,
            label: isRTL ? 'دعم 24/7' : '24/7 Support'
          }, {
            icon: Award,
            label: isRTL ? 'ضمان النتائج' : 'Results Guarantee'
          }].map((item, index) => <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{item.label}</span>
              </div>)}
          </div>
        </motion.div>
      </div>
    </section>;
};

// Footer Component
const FooterSection = () => {
  const {
    isRTL
  } = useLanguage();
  const socialLinks = [{
    icon: Instagram,
    href: '#',
    label: 'Instagram'
  }, {
    icon: Facebook,
    href: '#',
    label: 'Facebook'
  }, {
    icon: Twitter,
    href: '#',
    label: 'Twitter'
  }, {
    icon: Youtube,
    href: '#',
    label: 'YouTube'
  }];
  return <footer className="bg-card border-t border-border py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-gradient mb-4">FitLife</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {isRTL ? 'منصة متكاملة للتدريب والتغذية مع متابعة شخصية من فريق متخصص لضمان تحقيق أهدافك.' : 'An integrated platform for training and nutrition with personal follow-up from a specialized team to ensure you achieve your goals.'}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => <a key={index} href={social.href} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors" aria-label={social.label}>
                  <social.icon className="h-5 w-5" />
                </a>)}
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
    </footer>;
};

// Main Index Component
const Index = () => {
  return <Layout>
      <HeroSection />
      <CountdownTimer />
      <BeforeAfterFlipCards />
      <TransformationsCarousel />
      <MissionSection />
      <SubscriptionPlans />
      <SupplementsPreview />
      <FAQPreview />
      <FinalCTA />
      <FooterSection />
    </Layout>;
};
export default Index;