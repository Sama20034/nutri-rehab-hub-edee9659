import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const SuccessStories = () => {
  const { t, isRTL } = useLanguage();

  const stories = [
    {
      name: isRTL ? 'محمد سعيد' : 'Mohamed Said',
      condition: isRTL ? 'إصابة في الركبة' : 'Knee Injury',
      story: isRTL
        ? 'بعد إصابة خطيرة في الركبة، اعتقدت أنني لن أتمكن من المشي بشكل طبيعي مرة أخرى. لكن فريق NutriRehab ساعدني في التعافي خلال 3 أشهر فقط!'
        : 'After a serious knee injury, I thought I would never walk normally again. But the NutriRehab team helped me recover in just 3 months!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      duration: isRTL ? '3 أشهر' : '3 months',
    },
    {
      name: isRTL ? 'سارة أحمد' : 'Sara Ahmed',
      condition: isRTL ? 'فقدان الوزن' : 'Weight Loss',
      story: isRTL
        ? 'خسرت 25 كيلو في 6 أشهر مع برنامج التغذية العلاجية. الفريق كان معي في كل خطوة والدعم المستمر هو ما جعل الفرق!'
        : 'I lost 25 kg in 6 months with the therapeutic nutrition program. The team was with me every step and the continuous support made all the difference!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      duration: isRTL ? '6 أشهر' : '6 months',
    },
    {
      name: isRTL ? 'أحمد علي' : 'Ahmed Ali',
      condition: isRTL ? 'آلام الظهر المزمنة' : 'Chronic Back Pain',
      story: isRTL
        ? 'عانيت من آلام الظهر لسنوات. البرنامج العلاجي المخصص غيّر حياتي تماماً - الآن أمارس الرياضة بدون ألم!'
        : 'I suffered from back pain for years. The customized treatment program completely changed my life - now I exercise without pain!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      duration: isRTL ? '4 أشهر' : '4 months',
    },
    {
      name: isRTL ? 'نورا محمد' : 'Noura Mohamed',
      condition: isRTL ? 'تأهيل بعد السكتة' : 'Stroke Rehabilitation',
      story: isRTL
        ? 'بعد السكتة الدماغية، كنت خائفة جداً. فريق التأهيل العصبي ساعدني في استعادة حركتي وثقتي بنفسي.'
        : 'After my stroke, I was very scared. The neurological rehabilitation team helped me regain my movement and self-confidence.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      duration: isRTL ? '8 أشهر' : '8 months',
    },
    {
      name: isRTL ? 'خالد حسن' : 'Khaled Hassan',
      condition: isRTL ? 'تأهيل رياضي' : 'Sports Rehabilitation',
      story: isRTL
        ? 'كلاعب كرة قدم، الإصابة كانت كارثة. لكن بفضل NutriRehab، عدت للملعب أقوى من قبل!'
        : 'As a football player, the injury was a disaster. But thanks to NutriRehab, I returned to the field stronger than before!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      duration: isRTL ? '5 أشهر' : '5 months',
    },
    {
      name: isRTL ? 'فاطمة إبراهيم' : 'Fatma Ibrahim',
      condition: isRTL ? 'إدارة السكري' : 'Diabetes Management',
      story: isRTL
        ? 'برنامج التغذية العلاجية ساعدني في التحكم في مستوى السكر بشكل طبيعي. نتائج مذهلة!'
        : 'The therapeutic nutrition program helped me control my blood sugar levels naturally. Amazing results!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
      duration: isRTL ? '6 أشهر' : '6 months',
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
              <span className="text-gradient">{t('success.title')}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('success.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
              >
                <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/20" />
                
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                  />
                  <div>
                    <h3 className="font-semibold">{story.name}</h3>
                    <p className="text-primary text-sm">{story.condition}</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{story.story}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex items-center gap-1">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'مدة البرنامج:' : 'Program Duration:'} {story.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'أرقام تتحدث' : 'Numbers Speak'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '95%', label: isRTL ? 'نسبة رضا العملاء' : 'Client Satisfaction' },
              { value: '5000+', label: isRTL ? 'قصة نجاح' : 'Success Stories' },
              { value: '4.9', label: isRTL ? 'متوسط التقييم' : 'Average Rating' },
              { value: '85%', label: isRTL ? 'تحقيق الأهداف' : 'Goals Achieved' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SuccessStories;
