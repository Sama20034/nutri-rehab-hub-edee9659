import { motion } from "framer-motion";
import { 
  Target, 
  Heart, 
  Shield, 
  Award,
  Users,
  Video,
  Stethoscope,
  Dumbbell,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import drMahmoud1 from "@/assets/dr-mahmoud-1.png";
import drMahmoud2 from "@/assets/dr-mahmoud-2.png";
import alligatorFitLogo from "@/assets/alligator-fit-logo.png";

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: Users,
      title: "متابعة شخصية حقيقية",
      description: "متابعة مباشرة مع د. محمود ريجي شخصياً"
    },
    {
      icon: Stethoscope,
      title: "فريق طبي ورياضي متخصص",
      description: "أطباء ومدربين معتمدين لضمان سلامتك"
    },
    {
      icon: Target,
      title: "أنظمة مخصصة",
      description: "برامج حسب هدفك وحالتك الصحية"
    },
    {
      icon: Video,
      title: "محتوى تدريبي بالفيديو",
      description: "فيديوهات تعليمية للتمارين والتغذية"
    },
    {
      icon: Heart,
      title: "دمج التدريب مع التوعية الطبية",
      description: "نهج شامل يجمع الرياضة والصحة"
    },
    {
      icon: Shield,
      title: "ضمان الوصول للنتائج",
      description: "التزام كامل بتحقيق أهدافك"
    }
  ];

  const targetAudience = [
    { icon: Sparkles, text: "المبتدئين الراغبين في بداية صحيحة" },
    { icon: Dumbbell, text: "الرياضيين الباحثين عن أداء أفضل" },
    { icon: Activity, text: "أصحاب الإصابات أو الأمراض المزمنة" },
    { icon: TrendingUp, text: "كل من يبحث عن تغيير حقيقي وآمن" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-card">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <img 
                src={alligatorFitLogo} 
                alt="Alligator Fit Team" 
                className="w-32 h-32 mx-auto object-contain"
              />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">من نحن</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              د. محمود ريجي وفريق <span className="text-primary font-bold">Alligator Fit Team</span>
            </p>
            
            <p className="text-lg text-muted-foreground mt-6 max-w-3xl mx-auto leading-relaxed">
              نقدم أنظمة تدريب وتغذية مبنية على العلم، ومتابعة شخصية تهدف إلى ضمان 
              <span className="text-primary font-bold"> فورمة مدى الحياة</span>، 
              وليس مجرد خسارة وزن مؤقتة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
                <img 
                  src={drMahmoud1} 
                  alt="د. محمود ريجي" 
                  className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">فلسفتنا</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                التغيير الحقيقي يبدأ من <span className="text-gradient">الفهم الصحيح</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                نؤمن أن الجسم لا يتغير بالعشوائية أو الحرمان، بل بخطة ذكية تناسب نمط حياة العميل، 
                وتعتمد على المتابعة والتقييم المستمر.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-background/50 p-4 rounded-xl border border-primary/20">
                  <Zap className="w-8 h-8 text-primary mb-2" />
                  <h4 className="font-bold">خطة ذكية</h4>
                  <p className="text-sm text-muted-foreground">مصممة لنمط حياتك</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-secondary/20">
                  <Activity className="w-8 h-8 text-secondary mb-2" />
                  <h4 className="font-bold">متابعة مستمرة</h4>
                  <p className="text-sm text-muted-foreground">تقييم وتحسين دائم</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
              <Award className="w-5 h-5" />
              <span className="font-semibold">ماذا يميزنا؟</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا <span className="text-gradient">Alligator Fit</span>؟
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نجمع بين العلم والخبرة العملية لتقديم تجربة فريدة تضمن لك النتائج
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">رؤيتنا</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                أن نكون المنصة الرائدة في الوطن العربي في تقديم 
                <span className="text-primary font-bold"> فورمة صحية مستدامة مدى الحياة</span>.
              </p>
            </motion.div>
            
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-3xl p-8"
            >
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">رسالتنا</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                تغيير مفهوم الدايت والتمرين من معاناة مؤقتة إلى 
                <span className="text-secondary font-bold"> أسلوب حياة علمي سهل التطبيق</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">لمن هذه المنصة؟</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  منصة <span className="text-gradient">للجميع</span>
                </h2>
                
                <p className="text-lg text-muted-foreground">
                  سواء كنت مبتدئاً أو رياضياً محترفاً، نحن هنا لمساعدتك
                </p>
              </div>
              
              <div className="space-y-4">
                {targetAudience.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-3xl blur-2xl" />
              <img 
                src={drMahmoud2} 
                alt="Alligator Fit Team" 
                className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              ابدأ رحلتك <span className="text-gradient">الآن</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              واحصل على متابعة حقيقية مبنية على العلم والخبرة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/packages">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-6 text-lg gap-2 group"
                >
                  <span>اختر باقتك الآن</span>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <a 
                href="https://wa.me/201016111733?text=مرحباً، أريد استشارة مجانية"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-6 text-lg"
                >
                  استشارة مجانية
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
