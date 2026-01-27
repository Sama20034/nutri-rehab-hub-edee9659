import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Star, Check, ChevronLeft, ChevronRight, ShoppingBag, Target, Users, Award, Zap, Clock, Shield, Instagram, Facebook, Twitter, Youtube, Dumbbell, Heart, Crown, Sparkles } from 'lucide-react';
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
  '/assets/transformation7-combined.png': transformCombined7
};
const getImageSrc = (url: string | null) => {
  if (!url) return '';
  return assetMap[url] || url;
};

// Hero Transformation Card Component
const HeroTransformationCard = () => {
  const {
    isRTL
  } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchTransformations = async () => {
      const {
        data
      } = await supabase.from('transformations').select('*').eq('is_active', true).order('display_order', {
        ascending: true
      });
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
    return <div className="relative max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
        <div className="aspect-[3/4] rounded-2xl bg-card/50 border border-border animate-pulse" />
      </div>;
  }
  const transformation = transformations[currentIndex];
  const beforeImage = getImageSrc(transformation.before_image_url);
  const afterImage = getImageSrc(transformation.after_image_url);
  const isCombined = transformation.is_combined_image;
  return <div className="relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-secondary/20 rounded-3xl blur-3xl" />
      
      <motion.div animate={{
      y: [0, -10, 0]
    }} transition={{
      duration: 6,
      repeat: Infinity
    }} className="relative z-10 max-w-[280px] sm:max-w-sm md:max-w-md mx-auto perspective-1000">
        <div onClick={() => !isCombined && setIsFlipped(!isFlipped)} className={`relative aspect-[3/4] cursor-pointer transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{
        transformStyle: 'preserve-3d'
      }}>
          {/* Front - Before */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/50" style={{
          backfaceVisibility: 'hidden'
        }}>
            <img src={beforeImage} alt="Before" className="w-full h-full object-cover object-top" />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Duration Badge - Top Left */}
            {transformation.duration_text && <div className="absolute top-4 left-4 flex items-center gap-1 text-white/90 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{transformation.duration_text}</span>
              </div>}

            {/* Before Label - Top Right */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
              {isRTL ? 'قبل' : 'Before'}
            </div>

            {/* Click for Result Button */}
            {!isCombined && <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                <motion.div animate={{
              scale: [1, 1.05, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }} className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2">
                  👆 {isRTL ? 'اضغط للنتيجة' : 'Click for result'}
                </motion.div>
              </div>}

            {/* Client Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white/70 text-xs">{isRTL ? 'خسارة الوزن' : 'Weight Loss'}</div>
              <div className="text-white font-bold text-sm sm:text-base">{transformation.client_name}</div>
            </div>
          </div>

          {/* Back - After */}
          {!isCombined && <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-secondary/50 [transform:rotateY(180deg)]" style={{
          backfaceVisibility: 'hidden'
        }}>
              <img src={afterImage} alt="After" className="w-full h-full object-cover object-top" />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* After Label */}
              <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {isRTL ? 'بعد' : 'After'}
              </div>

              {/* Weight Loss Badge */}
              {transformation.weight_before && transformation.weight_after && <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  -{transformation.weight_before - transformation.weight_after} kg
                </div>}

              {/* Client Info */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="text-white font-bold text-sm sm:text-base">{transformation.client_name}</div>
                <div className="flex justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-secondary text-secondary" />)}
                </div>
              </div>
            </div>}
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      <div className="flex justify-center items-center gap-4 mt-4 relative z-20">
        <button onClick={() => {
        setIsFlipped(false);
        setCurrentIndex(prev => prev === 0 ? transformations.length - 1 : prev - 1);
      }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-primary/20 hover:border-primary transition-all duration-300 flex items-center justify-center group">
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
        
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border">
          <span className="text-primary font-bold text-sm">{currentIndex + 1}</span>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-muted-foreground text-sm">{transformations.length}</span>
        </div>

        <button onClick={() => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % transformations.length);
      }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-primary/20 hover:border-primary transition-all duration-300 flex items-center justify-center group">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Floating Elements */}
      <motion.div initial={{
      opacity: 0,
      scale: 0
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 0.8
    }} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-card/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border shadow-xl z-20">
        <div className="flex items-center gap-1 sm:gap-2">
          <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          <span className="font-bold text-xs sm:text-sm">{isRTL ? 'تدريب احترافي' : 'Pro Training'}</span>
        </div>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      scale: 0
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: 1
    }} className="absolute bottom-16 left-3 sm:bottom-20 sm:left-4 bg-card/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl border border-border shadow-xl z-20">
        <div className="flex items-center gap-1 sm:gap-2">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="font-bold text-xs sm:text-sm">{isRTL ? 'صحة مضمونة' : 'Guaranteed Health'}</span>
        </div>
      </motion.div>
    </div>;
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
          }} className="text-base sm:text-lg md:text-xl text-muted-foreground/90 mt-4 sm:mt-6 text-center max-w-xs sm:max-w-md mx-auto px-2">
              {isRTL ? 'مع د. محمود الريقي وفريق طبي متخصص - تقييم طبي ، تدريب رياضي، ومتابعة شخصية.' : 'With Dr. Mahmoud Al-Reaky and specialized medical team - therapeutic nutrition, sports training, and personal follow-up.'}
            </motion.p>

            {/* Stats - Mobile/Tablet Only (below image) */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.7
          }} className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:hidden">
              {[{
              value: '+10',
              label: isRTL ? 'سنوات' : 'Years',
              icon: Clock
            }, {
              value: '98%',
              label: isRTL ? 'نجاح' : 'Success',
              icon: Award
            }, {
              value: '16K',
              label: isRTL ? 'مستفيد' : 'Members',
              icon: Users
            }].map((stat, index) => <div key={index} className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card/50 border border-border/50">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-base sm:text-lg text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>)}
            </motion.div>
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



            {/* Stats - Desktop Only */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.7
          }} className="mt-6 sm:mt-8 md:mt-12 hidden lg:grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
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
  const {
    isRTL
  } = useLanguage();
  const [transformations, setTransformations] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchTransformations = async () => {
      const {
        data
      } = await supabase.from('transformations').select('*').eq('is_active', true).order('display_order', {
        ascending: true
      });
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
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, {
      ar: string;
      en: string;
    }> = {
      'weight_loss': {
        ar: 'خسارة الوزن',
        en: 'Weight Loss'
      },
      'muscle_building': {
        ar: 'بناء عضلات',
        en: 'Muscle Building'
      },
      'body_transformation': {
        ar: 'تحول كامل',
        en: 'Body Transformation'
      },
      'health_improvement': {
        ar: 'تحسين الصحة',
        en: 'Health Improvement'
      }
    };
    return categories[category] ? isRTL ? categories[category].ar : categories[category].en : category;
  };
  if (transformations.length === 0) return null;

  // Get visible cards for carousel (show 3 at a time on desktop)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < Math.min(3, transformations.length); i++) {
      const index = (currentIndex + i) % transformations.length;
      cards.push({
        ...transformations[index],
        originalIndex: index
      });
    }
    return cards;
  };
  const visibleCards = getVisibleCards();
  return <section className="py-12 sm:py-16 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Badge */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-8 sm:mb-12">
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
              return <motion.div key={item.id} layout initial={{
                opacity: 0,
                scale: 0.8,
                x: 100
              }} animate={{
                opacity: isCenter ? 1 : 0.6,
                scale: isCenter ? 1 : 0.85,
                x: 0,
                zIndex: isCenter ? 10 : 5 - displayIndex
              }} exit={{
                opacity: 0,
                scale: 0.8,
                x: -100
              }} transition={{
                duration: 0.5
              }} className={`perspective-1000 ${isCenter ? 'w-72 sm:w-80 md:w-96' : 'hidden md:block w-64 md:w-72'}`}>
                    <div onClick={() => !isCombined && toggleFlip(item.originalIndex)} className={`relative aspect-[3/4] cursor-pointer transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{
                  transformStyle: 'preserve-3d'
                }}>
                      {/* Front - Before */}
                      <div className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl ${isCenter ? 'border-4 border-primary/50' : 'border-2 border-border'}`} style={{
                    backfaceVisibility: 'hidden'
                  }}>
                        <img src={beforeImage} alt="Before" className="w-full h-full object-cover object-top" />
                        
                        {/* Emoji Mask */}
                        {item.use_emoji_mask && <img src={emojiMask} alt="" className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain z-10" />}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        {/* Duration Badge - Top Left */}
                        {item.duration_text && <div className="absolute top-4 left-4 flex items-center gap-1 text-white/90 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.duration_text}</span>
                          </div>}
                        
                        {/* Before Badge - Top Right */}
                        <Badge className="absolute top-4 right-4 bg-card/90 text-foreground text-xs px-3 py-1">
                          {isRTL ? 'قبل' : 'Before'}
                        </Badge>
                        
                        {/* Green CTA Button */}
                        {!isCombined && <motion.div className="absolute right-4 bottom-24 sm:bottom-28" whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 rounded-full shadow-lg" size="sm">
                              {isRTL ? 'اضغط للنتيجة' : 'Click for result'} 👆
                            </Button>
                          </motion.div>}
                        
                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                          {/* Category */}
                          {item.category && <p className="text-primary text-xs sm:text-sm font-medium mb-1">
                              {getCategoryLabel(item.category)}
                            </p>}
                          {/* Client Name */}
                          <h3 className="text-white text-lg sm:text-xl font-bold">
                            {item.client_name || item.title}
                          </h3>
                        </div>
                      </div>

                      {/* Back - After */}
                      {!isCombined && afterImage && <div className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-primary shadow-2xl [transform:rotateY(180deg)]" style={{
                    backfaceVisibility: 'hidden'
                  }}>
                          <img src={afterImage} alt="After" className="w-full h-full object-cover object-top" />
                          
                          {/* Emoji Mask on After */}
                          {item.use_emoji_mask && <img src={emojiMask} alt="" className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 object-contain z-10" />}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          {/* After Badge */}
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1">
                            {isRTL ? 'بعد' : 'After'}
                          </Badge>
                          
                          {/* Result Stats */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                            {item.weight_before && item.weight_after && <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-primary/90 text-primary-foreground">
                                  -{item.weight_before - item.weight_after} kg 🎉
                                </Badge>
                              </div>}
                            <h3 className="text-white text-lg sm:text-xl font-bold">
                              {item.client_name || item.title}
                            </h3>
                            {item.duration_text && <p className="text-primary text-sm mt-1">
                                {isRTL ? `في ${item.duration_text}` : `In ${item.duration_text}`}
                              </p>}
                          </div>
                        </div>}
                    </div>
                  </motion.div>;
            })}
            </AnimatePresence>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {transformations.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'}`} />)}
          </div>
        </div>
      </div>
    </section>;
};

// Transformations Carousel Component (Success Stories)
const TransformationsCarousel = () => {
  const {
    isRTL
  } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transformations from database
  useEffect(() => {
    const fetchTransformations = async () => {
      const {
        data,
        error
      } = await supabase.from('transformations').select('*').eq('is_active', true).order('display_order', {
        ascending: true
      });
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
    return <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse h-64 bg-muted rounded-lg"></div>
        </div>
      </section>;
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
          <p className="text-base sm:text-lg text-muted-foreground/90 max-w-2xl mx-auto px-2">
            {isRTL ? 'شاهد تحولات حقيقية لأشخاص حققوا أهدافهم معنا' : 'See real transformations from people who achieved their goals with us'}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-2 sm:px-8">
          {/* Fixed height container to prevent layout shift */}
          <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[400px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={currentIndex} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.3,
              ease: "easeInOut"
            }} className="absolute inset-0 grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                
                {/* Before/After Images Card */}
                <Card className="overflow-hidden border-border bg-card h-full">
                  {isCombined ?
                // Combined image (before & after in one)
                <div className="relative h-full min-h-[280px] sm:min-h-[320px]">
                      <img src={beforeImage} alt="Before & After" className="absolute inset-0 w-full h-full object-cover object-top" loading="eager" />
                      {useEmojiMask && <img src={emojiMask} alt="" className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 object-contain" />}
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
                    </div> :
                // Separate before and after images
                <div className="relative h-full min-h-[280px] sm:min-h-[320px] grid grid-cols-2 gap-1">
                      <div className="relative overflow-hidden">
                        <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover object-top" loading="eager" />
                        {useEmojiMask && <img src={emojiMask} alt="" className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 object-contain" />}
                        <Badge className="absolute bottom-2 left-2 bg-red-500/80 text-white">
                          {isRTL ? 'قبل' : 'Before'}
                        </Badge>
                      </div>
                      <div className="relative overflow-hidden">
                        <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover object-top" loading="eager" />
                        {useEmojiMask && <img src={emojiMask} alt="" className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 object-contain" />}
                        <Badge className="absolute bottom-2 right-2 bg-green-500/80 text-white">
                          {isRTL ? 'بعد' : 'After'}
                        </Badge>
                      </div>
                    </div>}
                </Card>

                {/* Info Card */}
                <Card className="border-border bg-card flex flex-col justify-center p-6 h-full">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
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
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

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
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 mb-6 sm:mb-8">
              {isRTL ? 'نؤمن بأن كل شخص يستحق جسماً صحياً وفورمة مثالية. هدفنا هو تقديم برامج مخصصة تناسب احتياجاتك مع متابعة مستمرة لضمان تحقيق أهدافك.' : 'We believe everyone deserves a healthy body and ideal physique. Our goal is to provide customized programs that suit your needs with continuous follow-up to ensure you achieve your goals.'}
            </p>

            {/* Doctor Image - Mobile/Tablet Only */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="lg:hidden mb-6">
              <div className="relative rounded-2xl overflow-hidden">
                <img src={drMahmoud2} alt="Dr. Mahmoud Al-Reaky" className="w-full h-[350px] sm:h-[400px] object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </motion.div>

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
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Desktop Only - Doctor Image */}
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} className="relative hidden lg:block">
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
  const {
    isRTL
  } = useLanguage();
  const plans = [{
    name: isRTL ? '6 أسابيع' : '6 Weeks',
    regularPrice: 999,
    medicalPrice: 1499,
    features: [isRTL ? 'نظام غذائي مخصص لهدفك' : 'Custom diet plan for your goal', isRTL ? 'نظام تدريبي مشروح بالفيديو مع المتابعة' : 'Video-explained training with follow-up', isRTL ? 'متابعة أسبوعية من الفريق' : 'Weekly follow-up from the team', isRTL ? 'صفحة خاصة بك وبهدفك وحالتك على الموقع' : 'Personal page with your goals and progress'],
    popular: false,
    bestValue: false
  }, {
    name: isRTL ? 'تحدي 90 يوم' : '90 Days Challenge',
    regularPrice: 1699,
    medicalPrice: 1999,
    features: [isRTL ? 'نظام غذائي مخصص لهدفك' : 'Custom diet plan for your goal', isRTL ? 'نظام تدريبي مخصص لهدفك' : 'Custom training plan for your goal', isRTL ? 'متابعة يومية من الفريق على واتساب' : 'Daily WhatsApp follow-up from team', isRTL ? 'وصول كامل لبرامج ومجتمع Alligator التعليمي' : 'Full access to Alligator programs & community'],
    popular: true,
    bestValue: false
  }, {
    name: isRTL ? '6 شهور' : '6 Months',
    regularPrice: 2999,
    medicalPrice: 4000,
    features: [isRTL ? 'متابعة يومية مع د. محمود شخصياً' : 'Daily follow-up with Dr. Mahmoud personally', isRTL ? 'نظامك الغذائي والتدريبي المخصص لهدفك' : 'Your custom diet & training plans', isRTL ? 'تقييم صحي ورياضي شامل' : 'Comprehensive health & fitness assessment', isRTL ? 'وصول لمجتمع Alligator الاحترافي طول المدة' : 'Access to Alligator pro community'],
    popular: false,
    bestValue: false
  }, {
    name: isRTL ? 'سنة كاملة' : 'Full Year',
    regularPrice: 5999,
    medicalPrice: 8000,
    features: [isRTL ? 'خصم 5% على منتجات Alligator Store' : '5% discount on Alligator Store products', isRTL ? 'متابعة يومية من د. محمود شخصياً' : 'Daily follow-up from Dr. Mahmoud', isRTL ? 'تقييم صحي أسبوعي + نظامك الكامل' : 'Weekly health assessment + full system', isRTL ? 'فرصة الانضمام لعائلة Alligator' : 'Chance to join Alligator family'],
    popular: false,
    bestValue: true
  }];
  const [medicalToggles, setMedicalToggles] = useState<boolean[]>(plans.map(() => false));
  const toggleMedical = (index: number) => {
    const newToggles = [...medicalToggles];
    newToggles[index] = !newToggles[index];
    setMedicalToggles(newToggles);
  };

  // Plan icons mapping
  const planIcons = [Zap, Award, Crown, Star];

  // Plan durations
  const planDurations = [isRTL ? '6 أسابيع' : '6 weeks', isRTL ? '90 يوم + شهر هدية' : '90 days + free month', isRTL ? '6 شهور' : '6 months', isRTL ? '12 شهر' : '12 months'];
  return <section className="py-12 sm:py-16 md:py-20 bg-[#0a1a0f]">
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
            {isRTL ? '💎 باقاتنا' : '💎 Our Plans'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
            {isRTL ? 'اختر الباقة المناسبة لك' : 'Choose Your Perfect Plan'}
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-2">
            {isRTL ? 'باقات مرنة تناسب جميع الاحتياجات والميزانيات' : 'Flexible plans that suit all needs and budgets'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
          const isMedical = medicalToggles[index];
          const currentPrice = isMedical ? plan.medicalPrice : plan.regularPrice;
          const IconComponent = planIcons[index];
          return <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="relative">
                {/* Badge for popular/best value */}
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 whitespace-nowrap flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {isRTL ? 'الأكثر طلباً' : 'Most Popular'}
                    </Badge>
                  </div>}
                {plan.bestValue && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-secondary text-secondary-foreground px-4 py-1 whitespace-nowrap flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {isRTL ? 'أفضل قيمة' : 'Best Value'}
                    </Badge>
                  </div>}

                <div className={`relative h-full rounded-2xl border-2 bg-[#111b14] overflow-hidden ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'border-[#1a2e1f]'}`}>
                  <div className="p-5 sm:p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${plan.popular ? 'bg-primary/20' : 'bg-[#1a2e1f]'}`}>
                      <IconComponent className={`h-7 w-7 ${plan.popular ? 'text-primary' : 'text-primary'}`} />
                    </div>

                    {/* Title & Duration */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-5">{planDurations[index]}</p>
                    
                    {/* Medical Toggle */}
                    <div className="flex items-center gap-3 mb-5 bg-[#1a2e1f] rounded-full px-4 py-2 w-fit">
                      <span className={`text-xs ${isMedical ? 'text-gray-400' : 'text-primary font-medium'}`}>
                        {isRTL ? 'عادي' : 'Regular'}
                      </span>
                      <Switch checked={isMedical} onCheckedChange={() => toggleMedical(index)} className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-600" />
                      <span className={`text-xs ${isMedical ? 'text-primary font-medium' : 'text-gray-400'}`}>
                        {isRTL ? 'متابعة طبية' : 'Medical'}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className={`flex items-baseline gap-2 mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="text-4xl sm:text-5xl font-bold text-white">{currentPrice.toLocaleString()}</span>
                      <span className="text-gray-400 text-lg">
                        {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => <li key={i} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>)}
                    </ul>

                    {/* CTA Button */}
                    <Link to="/register">
                      <Button className={`w-full py-6 text-base font-semibold rounded-xl ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'}`}>
                        {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>;
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
    </section>;
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
            <p className="text-base sm:text-lg text-muted-foreground/90 mb-4 sm:mb-6">
              {isRTL ? 'نختار لك أفضل المكملات المناسبة لأهدافك مع إرشادات طبية ورياضية متخصصة لضمان أفضل النتائج بأمان.' : 'We select the best supplements suited to your goals with specialized medical and sports guidance to ensure the best results safely.'}
            </p>
            <Link to="/store">
              <Button className="gap-2 text-sm sm:text-base">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {isRTL ? 'تصفح المتجر' : 'Browse Store'}
              </Button>
            </Link>
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
    q: isRTL ? 'ازاي الاونلاين احسن من الكوتش اللي معايا في الجيم؟' : 'How is online coaching better than the gym coach?',
    a: isRTL ? 'انت يا صديقي بتروح الجيم بتعتمد اعتماد كلي علي الكوتش اللي معاك ودة خطأ جدا في اوقات كتير وغالبا مش كل المعلومات متوفرة ولا حتي الكوتش موجود كل مرة وكمان فيه غيرك معاه فلازم اللي هيمرنك دة يكون ارنولد\n\nوكمان ميزة الأونلاين انت بتاخد الاداء العالي والثابت كل تمرين والشرح والنظام الغذائي والمتابعة مع فريق كامل ومع الدكتور محمود شخصيا\n\nدة كله عاوز تقارنه بشخص واحد بيتابع معاك, مستحيل طبعا' : 'You go to the gym relying entirely on a coach who may not always be available or have all the information. With online coaching, you get consistent high performance, video explanations, diet plans, and follow-up with a complete team plus Dr. Mahmoud personally.'
  }, {
    q: isRTL ? 'طيب اللي بيفرق معاك عن اي حد؟' : 'What makes you different from others?',
    a: isRTL ? 'الاشتراك المدي الحياة علي مدرسة الكورسات قناة بينزل عليها احدث المواضيع الرياضية والطبية والصحية عشان تفهم جسمك احسن من اي حد تاني تخيل يكون عندك خلفية رياضية وطبية وكمان غذائية\n\nمش هتحتاج حد تاني بعد ما تشترك معانا\n\nكمان تقدر معانا تلحق العرض بتاعنا وتشترك دلوقتي وتبدأ بعدين' : 'Lifetime subscription to our courses platform with the latest sports, medical, and health topics. You\'ll understand your body better than anyone else and won\'t need anyone after subscribing with us.'
  }, {
    q: isRTL ? 'ازاي انت ضحية الاشتراكات؟' : 'How can you be a victim of subscriptions?',
    a: isRTL ? 'خليني اقولك حاجة في منتهي الصراحة\n\nصحتك هي اولوية وواجب عليك والمدربين وبعض الاطباء بتستغل دة انه يعمل كورس ويبيع واشتراكات بغض النظر عن القيمة الحقيقية\n\nوانا هدفي معاك يا صديقي المتابعة المباشرة معايا من خلال النظام والهدف التاني اني اعلمك كل حاجة عن جسمك عشان بعد ما نوصل للفورمة بتاعتنا او لهدفنا متحتاجش لاي حد تاني باذن الله' : 'Your health is a priority, but some trainers and doctors exploit this with courses and subscriptions regardless of real value. My goal is direct follow-up and teaching you everything about your body so you won\'t need anyone else after reaching your goal.'
  }, {
    q: isRTL ? 'طب احنا بنقدم ايه عشان نحل كل المشاكل دي؟' : 'What do we offer to solve all these problems?',
    a: isRTL ? 'بفضل الله ليا سنين بجمع فريق يشتغل لعدد كبير من الناس عشان نوفر قيمة مقابل سعر وكل واحد فاهم في شغله يديني اعلي قيمة واعلي تقييم صحي وبدني ونفسي\n\nفعملنا الكورس اللي اشتراكه مدي الحياة هتلاقيه موجود تحت و هتلاقي بعديه تحت برضو اشتراكات الانظمة\n\nالكورس المدي الحياة هيخليك في خلال فترة مثلا شهرين مكثف تفهم كل حاجة انت محتاج تعرفها عن جسمك وعملناه خدمة للناس اصل مين مش معاه جنيه يوميا لمدة سنة ياخد اشتراك مدي الحياة اهم شئ تدعيلي معاك\n\nاما الانظمة ف انت بتاخد الكورس مجانا لو اشتركت في اي نظام فيهم وبنقدملك الخطة الغذائية والتدريبية والتقييم الصحي الخاص بيك وانا بنفسي باذن الله بتابع معاك يوميا\n\nفلو عاوز توصل لهدفك بسرعة وتبدأ معايا التحدي ، من تمرينة واحدة لو مشوفتش فرق في جسمك انا هرجعلك المبلغ كامل ، ومش بقول كدة غرور اللهم نا فوق الارض ويوم العرض انما تحت الاسئلة نشوف امثلة للناس اللي معايا ووصلو لهدفهم في قد ايه\n\nلان انا بفضل الله علم الطب والرياضة والخبرة من الصعب جدا ان لم يكن مستحيل موصلكش لهدفك مهما كان ظروف وقتك وشغلك ، لان دة شغلي اصلا اني اعمل انسب ظروف مناسبة لحالتك توصل بيها لهدفك مش اني اعمل حمل زيادة عليك' : 'We\'ve built a team over years to provide value for money. The lifetime course helps you understand your body in 2 months. With our plans, you get free course access + diet, training, health assessment, and my personal daily follow-up. If you don\'t see a difference from the first workout, full refund guaranteed!'
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
  
  return null;
};

// Main Index Component
const Index = () => {
  return <Layout>
      <HeroSection />
      <CountdownTimer />
      <MissionSection />
      <SubscriptionPlans />
      <TransformationsCarousel />
      <SupplementsPreview />
      <FAQPreview />
      <FinalCTA />
      <FooterSection />
    </Layout>;
};
export default Index;