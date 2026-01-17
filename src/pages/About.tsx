import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye, Award, Users, Heart, Shield, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import drBassemImg from '@/assets/dr-bassem.png';
import drMarwanImg from '@/assets/dr-marwan.png';
import drAbdelrhmanImg from '@/assets/dr-abdelrhman.png';
import drAbdulazizImg from '@/assets/dr-abdulaziz.png';

const About = () => {
  const { t, isRTL } = useLanguage();
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const values = [
    {
      icon: Heart,
      title: isRTL ? 'الرعاية الشاملة' : 'Holistic Care',
      description: isRTL 
        ? 'نؤمن بالعلاج الشامل للجسم والعقل معاً'
        : 'We believe in treating the whole person - body and mind',
    },
    {
      icon: Award,
      title: isRTL ? 'التميز العلمي' : 'Scientific Excellence',
      description: isRTL
        ? 'نعتمد على أحدث الأبحاث والبروتوكولات العلمية'
        : 'We rely on the latest research and scientific protocols',
    },
    {
      icon: Users,
      title: isRTL ? 'التركيز على العميل' : 'Client Focus',
      description: isRTL
        ? 'كل برنامج مصمم خصيصاً لاحتياجاتك الفريدة'
        : 'Every program is designed specifically for your unique needs',
    },
    {
      icon: Shield,
      title: isRTL ? 'الخصوصية والأمان' : 'Privacy & Security',
      description: isRTL
        ? 'نحمي بياناتك الصحية بأعلى معايير الأمان'
        : 'We protect your health data with the highest security standards',
    },
  ];

  const team = [
    {
      name: 'Dr. Bassem Khalifa',
      nameAr: 'د. باسم خليفة',
      role: isRTL ? 'أستاذ العلاج الطبيعي والتغذية العلاجية' : 'Assistant Professor of Physical Therapy & Clinical Nutrition',
      image: drBassemImg,
      description: isRTL 
        ? `أستاذ مساعد العلاج الطبيعي لأمراض العظام والإصابات الرياضية وجراحاتها، والتغذية العلاجية
مساعد مدير المعهد القومي للجهاز الحركي العصبي - مصر
دكتوراه في العلاج الطبيعي لأمراض العظام والإصابات الرياضية وجراحاتها - جامعة القاهرة
دبلوم في التأهيل - جامعة التأهيل، سلوفينيا
دبلوم في التغذية العلاجية - الأكاديمية الأمريكية للتنمية والعلوم
عضو الجمعية الدولية لدراسة السمنة
عضو الجمعية المصرية لدراسة السمنة
عضو جمعية الشرق الأوسط للطب البديل`
        : `Assistant Professor of Physical Therapy for Orthopedic, Sports Injuries and its Surgeries, and Clinical Nutrition
Assistant Director of the National Institute for Neuromotor System - Egypt
PhD in Physical Therapy for Orthopedics, Sports Injuries, and its Surgeries - Cairo University
Diploma in Rehabilitation - University of Rehabilitation, Slovenia
Diploma in Clinical Nutrition - American Academy of Development and Sciences
Member of the International Society for the Study of Obesity
Member of the Egyptian Society for the Study of Obesity
Member of the Middle East Society for Alternative Treatment`,
    },
    {
      name: 'Dr. Marwan Oraby',
      nameAr: 'د. مروان عربي',
      role: isRTL ? 'أخصائي علاج طبيعي' : 'Physical Therapist (BSc.PT)',
      image: drMarwanImg,
      description: isRTL 
        ? `أخصائي علاج طبيعي بخبرة أكثر من 3 سنوات في التأهيل الرياضي والعلاج الطبيعي`
        : `Physical therapist with 3+ years of experience in sports rehabilitation and physiotherapy`,
    },
    {
      name: 'Dr. Abdelrhman Hamdy',
      nameAr: 'د. عبدالرحمن حمدي',
      role: isRTL ? 'أخصائي علاج طبيعي ومدرب شخصي معتمد' : 'Physical Therapist & Certified Personal Trainer (BSc.PT)',
      image: drAbdelrhmanImg,
      description: isRTL 
        ? `أخصائي علاج طبيعي ومدرب شخصي معتمد بخبرة أكثر من 5 سنوات
أكملت العديد من الدورات المتخصصة في التمارين التصحيحية والوقاية من الإصابات والتدريب القائم على التأهيل
تصميم برامج آمنة وموجهة نحو النتائج ومصممة خصيصاً لكل حالة`
        : `Physiotherapist and certified Personal Trainer with 5+ years of experience
Completed multiple specialized courses in corrective exercise, injury prevention, and rehabilitation-based training
Designing safe, results-driven programs tailored to each individual`,
    },
    {
      name: 'Dr. Abdulaziz Khalil',
      nameAr: 'د. عبدالعزيز خليل',
      role: isRTL ? 'أخصائي علاج طبيعي وعلاج يدوي' : 'Physical Therapist & Manual Therapist',
      image: drAbdulazizImg,
      description: isRTL 
        ? `أخصائي علاج طبيعي بخبرة أكثر من 3 سنوات في تأهيل أمراض العظام ومشاكل المفصل الصدغي الفكي
معالج يدوي معتمد
ممارس معتمد للإبر الجافة
معالج بيلاتس معتمد`
        : `Physiotherapist with 3+ years of experience in rehabilitating orthopedic conditions and TMJ problems
Certified manual therapist
Certified dry needling practitioner
Certified pilates therapist`,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">{t('about.title')}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.mission.desc')}
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.vision.desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            {isRTL ? 'قيمنا' : 'Our Values'}
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'فريقنا المتخصص' : 'Our Expert Team'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isRTL 
                ? 'نخبة من أفضل المتخصصين في مجالاتهم'
                : 'A selection of the best specialists in their fields'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <div 
                  onClick={() => setExpandedMember(expandedMember === index ? null : index)}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 bg-background rounded-2xl border border-border overflow-hidden transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={isRTL ? member.nameAr : member.name}
                      className="w-full h-64 object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold mb-1">{isRTL ? member.nameAr : member.name}</h3>
                      <p className="text-primary text-sm font-medium">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 flex items-center justify-between border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {isRTL ? 'اضغط لعرض التفاصيل' : 'Click for details'}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedMember === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedMember === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30">
                          <div className="space-y-1.5">
                            {member.description.split('\n').map((line, i) => (
                              <p key={i} className="text-muted-foreground text-xs leading-relaxed flex items-start gap-1.5">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{line}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
