import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Sparkles, Crown, Zap, Award, Star, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import Layout from "@/components/layout/Layout";
interface Package {
  id: string;
  name: string;
  nameEn: string;
  duration: string;
  durationEn: string;
  regularPrice: number;
  medicalPrice: number;
  popular?: boolean;
  bestValue?: boolean;
  icon: React.ReactNode;
  features: string[];
  featuresEn: string[];
}

const packages: Package[] = [
  {
    id: "6-weeks",
    name: "نظام 6 أسابيع",
    nameEn: "6 Weeks Program",
    duration: "6 أسابيع",
    durationEn: "6 weeks",
    regularPrice: 999,
    medicalPrice: 1499,
    icon: <Zap className="w-6 h-6" />,
    features: [
      "برنامج تدريبي مخصص",
      "نظام غذائي متكامل",
      "متابعة أسبوعية",
      "دعم عبر الواتساب",
      "تحديثات البرنامج",
    ],
    featuresEn: [
      "Custom training program",
      "Complete nutrition plan",
      "Weekly follow-up",
      "WhatsApp support",
      "Program updates",
    ],
  },
  {
    id: "90-days",
    name: "تحدي 90 يوم",
    nameEn: "90 Days Challenge",
    duration: "90 يوم + شهر هدية",
    durationEn: "90 days + 1 month free",
    regularPrice: 1699,
    medicalPrice: 1999,
    popular: true,
    icon: <Award className="w-6 h-6" />,
    features: [
      "برنامج تدريبي مخصص",
      "نظام غذائي متكامل",
      "متابعة أسبوعية مكثفة",
      "دعم عبر الواتساب 24/7",
      "شهر إضافي مجاني",
      "تقارير تقدم شهرية",
    ],
    featuresEn: [
      "Custom training program",
      "Complete nutrition plan",
      "Intensive weekly follow-up",
      "24/7 WhatsApp support",
      "Extra free month",
      "Monthly progress reports",
    ],
  },
  {
    id: "6-months",
    name: "نظام 6 شهور",
    nameEn: "6 Months Program",
    duration: "6 شهور",
    durationEn: "6 months",
    regularPrice: 2999,
    medicalPrice: 4000,
    icon: <Crown className="w-6 h-6" />,
    features: [
      "كل مميزات تحدي 90 يوم",
      "جلسات استشارية شهرية",
      "تحديثات غير محدودة",
      "أولوية في الدعم",
      "خصومات على المكملات",
    ],
    featuresEn: [
      "All 90 days features",
      "Monthly consultation sessions",
      "Unlimited updates",
      "Priority support",
      "Supplement discounts",
    ],
  },
  {
    id: "1-year",
    name: "نظام سنة كاملة",
    nameEn: "Full Year Program",
    duration: "12 شهر",
    durationEn: "12 months",
    regularPrice: 5999,
    medicalPrice: 8000,
    bestValue: true,
    icon: <Star className="w-6 h-6" />,
    features: [
      "كل مميزات 6 شهور",
      "تحول شامل مضمون",
      "متابعة VIP مستمرة",
      "جلسات فيديو شهرية",
      "مكملات مجانية",
      "ضمان استرداد المال",
    ],
    featuresEn: [
      "All 6 months features",
      "Guaranteed full transformation",
      "Continuous VIP follow-up",
      "Monthly video sessions",
      "Free supplements",
      "Money-back guarantee",
    ],
  },
];

const PackageCard = ({ pkg, index }: { pkg: Package; index: number }) => {
  const [isMedical, setIsMedical] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const currentPrice = isMedical ? pkg.medicalPrice : pkg.regularPrice;
  const features = isRTL ? pkg.features : pkg.featuresEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative group h-full ${pkg.popular ? "z-10" : ""}`}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isRTL ? "الأكثر طلباً" : "Most Popular"}
          </div>
        </div>
      )}

      {/* Best Value badge */}
      {pkg.bestValue && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isRTL ? "أفضل قيمة" : "Best Value"}
          </div>
        </div>
      )}

      <div
        className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 ${
          pkg.popular
            ? "bg-gradient-to-b from-primary/20 via-primary/10 to-card border-2 border-primary shadow-2xl shadow-primary/20 scale-[1.02] lg:scale-105"
            : "bg-card border border-border hover:border-primary/50 hover:shadow-xl"
        }`}
      >
        {/* Card Content */}
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                pkg.popular
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              {pkg.icon}
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              {isRTL ? pkg.name : pkg.nameEn}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isRTL ? pkg.duration : pkg.durationEn}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-6 p-3 bg-muted/50 rounded-xl border border-border/50">
            <span
              className={`text-sm transition-colors ${
                !isMedical ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {isRTL ? "عادي" : "Regular"}
            </span>
            <Switch
              checked={isMedical}
              onCheckedChange={setIsMedical}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground [&>span]:rtl:data-[state=checked]:translate-x-5"
            />
            <span
              className={`text-sm transition-colors ${
                isMedical ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {isRTL ? "متابعة طبية" : "Medical"}
            </span>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <motion.div
              key={currentPrice}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline justify-center gap-2"
            >
              <span className="text-4xl lg:text-5xl font-bold text-foreground">
                {currentPrice.toLocaleString()}
              </span>
              <span className="text-lg text-muted-foreground">
                {isRTL ? "ج.م" : "EGP"}
              </span>
            </motion.div>
            {isMedical && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary mt-2 flex items-center justify-center gap-1"
              >
                <Shield className="w-3 h-3" />
                {isRTL ? "يشمل متابعة طبية متخصصة" : "Includes specialized medical follow-up"}
              </motion.p>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border mb-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  pkg.popular ? "bg-primary/20" : "bg-primary/10"
                }`}>
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/80">{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/payment")}
            className={`w-full py-6 text-lg font-bold transition-all duration-300 rounded-xl ${
              pkg.popular
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {isRTL ? "اشترك الآن" : "Subscribe Now"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const Packages = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { setTheme, theme } = useTheme();

  // Force dark theme for Packages page
  useEffect(() => {
    const previousTheme = theme;
    setTheme("dark");
    
    return () => {
      // Restore previous theme when leaving the page
      if (previousTheme && previousTheme !== "dark") {
        setTheme(previousTheme);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <span className="text-lg">💎</span>
                {isRTL ? "باقاتنا" : "Our Packages"}
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {isRTL ? "اختر الباقة المناسبة لك" : "Choose the Right Package for You"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isRTL
                  ? "باقات مرنة تناسب جميع الاحتياجات والميزانيات"
                  : "Flexible packages to suit all needs and budgets"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 items-stretch">
              {packages.map((pkg, index) => (
                <PackageCard key={pkg.id} pkg={pkg} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-primary/10 via-card to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center md:text-start">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {isRTL ? "ضمان الوصول للفورمة" : "Fitness Guarantee"}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {isRTL
                        ? "نحن واثقون من برامجنا لدرجة أننا نضمن لك النتائج. إذا التزمت بالبرنامج ولم تحقق أهدافك، سنعمل معك مجاناً حتى تصل لهدفك أو نعيد لك أموالك بالكامل."
                        : "We're so confident in our programs that we guarantee results. If you follow the program and don't achieve your goals, we'll work with you for free until you do, or give you a full refund."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {isRTL ? "جاهز تبدأ رحلتك؟" : "Ready to Start Your Journey?"}
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                {isRTL
                  ? "تواصل معنا الآن واحصل على استشارة مجانية"
                  : "Contact us now and get a free consultation"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="https://wa.me/201016111733" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-bold gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isRTL ? "ادفع عن طريق الواتساب" : "Pay via WhatsApp"}
                  </Button>
                </a>
                <Link to="/payment">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold gap-2"
                  >
                    {isRTL ? "اشترك الان عبر الدفع الالكتروني" : "Subscribe via Electronic Payment"}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Packages;
