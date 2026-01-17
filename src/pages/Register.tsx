import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Package,
  CreditCard,
  CheckCircle2,
  Zap,
  Award,
  Crown,
  Star,
  Shield,
  Wallet,
  Smartphone,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

type Step = 1 | 2 | 3 | 4;

interface PackageOption {
  id: string;
  name: string;
  nameEn: string;
  duration: string;
  durationEn: string;
  regularPrice: number;
  medicalPrice: number;
  icon: React.ReactNode;
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  description: string;
  descriptionEn: string;
}

const packages: PackageOption[] = [
  {
    id: "6-weeks",
    name: "نظام 6 أسابيع",
    nameEn: "6 Weeks Program",
    duration: "6 أسابيع",
    durationEn: "6 weeks",
    regularPrice: 999,
    medicalPrice: 1499,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "90-days",
    name: "تحدي 90 يوم",
    nameEn: "90 Days Challenge",
    duration: "90 يوم + شهر هدية",
    durationEn: "90 days + 1 month free",
    regularPrice: 1699,
    medicalPrice: 1999,
    icon: <Award className="w-6 h-6" />,
    popular: true,
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
  },
  {
    id: "1-year",
    name: "نظام سنة كاملة",
    nameEn: "Full Year Program",
    duration: "12 شهر",
    durationEn: "12 months",
    regularPrice: 5999,
    medicalPrice: 8000,
    icon: <Star className="w-6 h-6" />,
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "vodafone-cash",
    name: "فودافون كاش",
    nameEn: "Vodafone Cash",
    icon: <Smartphone className="w-6 h-6" />,
    description: "ادفع عبر محفظة فودافون كاش",
    descriptionEn: "Pay via Vodafone Cash wallet",
  },
  {
    id: "instapay",
    name: "انستاباي",
    nameEn: "InstaPay",
    icon: <Wallet className="w-6 h-6" />,
    description: "تحويل فوري عبر انستاباي",
    descriptionEn: "Instant transfer via InstaPay",
  },
  {
    id: "bank-transfer",
    name: "تحويل بنكي",
    nameEn: "Bank Transfer",
    icon: <Building2 className="w-6 h-6" />,
    description: "تحويل مباشر للحساب البنكي",
    descriptionEn: "Direct bank transfer",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { signUp } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Personal Data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Package Selection
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [medicalFollowup, setMedicalFollowup] = useState(false);

  // Step 3: Payment Method
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const steps = [
    { number: 1, title: isRTL ? "البيانات الشخصية" : "Personal Data", icon: User },
    { number: 2, title: isRTL ? "اختيار النظام" : "Choose Plan", icon: Package },
    { number: 3, title: isRTL ? "طريقة الدفع" : "Payment", icon: CreditCard },
    { number: 4, title: isRTL ? "التأكيد" : "Confirm", icon: CheckCircle2 },
  ];

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error(isRTL ? "الرجاء إدخال الاسم الكامل" : "Please enter your full name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error(isRTL ? "الرجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return false;
    }
    if (!phone.trim()) {
      toast.error(isRTL ? "الرجاء إدخال رقم الهاتف" : "Please enter your phone number");
      return false;
    }
    if (password.length < 6) {
      toast.error(isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!selectedPackage) {
      toast.error(isRTL ? "الرجاء اختيار باقة" : "Please select a package");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!selectedPayment) {
      toast.error(isRTL ? "الرجاء اختيار طريقة الدفع" : "Please select a payment method");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep < 4) setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const getSelectedPackage = () => packages.find((p) => p.id === selectedPackage);
  const getSelectedPayment = () => paymentMethods.find((p) => p.id === selectedPayment);

  const calculatePrice = () => {
    const pkg = getSelectedPackage();
    if (!pkg) return 0;
    return medicalFollowup ? pkg.medicalPrice : pkg.regularPrice;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, "client", {
        full_name: fullName,
        phone,
        selected_package: selectedPackage || undefined,
        payment_method: selectedPayment || undefined,
        medical_followup: medicalFollowup,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(isRTL ? "البريد الإلكتروني مسجل بالفعل" : "Email already registered");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
        navigate("/pending-approval");
      }
    } catch {
      toast.error(isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-center mb-6">
              {isRTL ? "أدخل بياناتك الشخصية" : "Enter Your Personal Data"}
            </h2>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "الاسم الكامل" : "Full Name"}</label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                  className={`bg-background ${isRTL ? "pr-10" : "pl-10"}`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  className={`bg-background ${isRTL ? "pr-10" : "pl-10"}`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "رقم الهاتف" : "Phone Number"}</label>
              <div className="relative">
                <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isRTL ? "أدخل رقم هاتفك" : "Enter your phone number"}
                  className={`bg-background ${isRTL ? "pr-10" : "pl-10"}`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "كلمة المرور" : "Password"}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? "أدخل كلمة المرور" : "Enter password"}
                  className={`bg-background ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? "left-3" : "right-3"}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isRTL ? "أكد كلمة المرور" : "Confirm password"}
                  className={`bg-background ${isRTL ? "pr-10" : "pl-10"}`}
                  dir="ltr"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-center mb-2">
              {isRTL ? "اختر النظام المناسب لك" : "Choose Your Plan"}
            </h2>

            {/* Medical Followup Toggle */}
            <div className="flex items-center justify-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
              <span className={`text-sm ${!medicalFollowup ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {isRTL ? "عادي" : "Regular"}
              </span>
              <Switch checked={medicalFollowup} onCheckedChange={setMedicalFollowup} />
              <span className={`text-sm ${medicalFollowup ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {isRTL ? "متابعة طبية" : "Medical"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {packages.map((pkg) => (
                <motion.button
                  key={pkg.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 rounded-xl border transition-all text-start ${
                    selectedPackage === pkg.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {isRTL ? "الأكثر طلباً" : "Popular"}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPackage === pkg.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      {pkg.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{isRTL ? pkg.name : pkg.nameEn}</h3>
                      <p className="text-sm text-muted-foreground">{isRTL ? pkg.duration : pkg.durationEn}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-primary">
                        {(medicalFollowup ? pkg.medicalPrice : pkg.regularPrice).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{isRTL ? "ج.م" : "EGP"}</p>
                    </div>
                    {selectedPackage === pkg.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {medicalFollowup && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-primary">
                  {isRTL ? "يشمل متابعة طبية متخصصة مع طبيب مختص" : "Includes specialized medical follow-up"}
                </p>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-center mb-6">
              {isRTL ? "اختر طريقة الدفع" : "Choose Payment Method"}
            </h2>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-4 rounded-xl border transition-all text-start flex items-center gap-4 ${
                    selectedPayment === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === method.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{isRTL ? method.name : method.nameEn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? method.description : method.descriptionEn}
                    </p>
                  </div>
                  {selectedPayment === method.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Price Summary */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{isRTL ? "الباقة المختارة:" : "Selected Package:"}</span>
                <span className="font-semibold">
                  {isRTL ? getSelectedPackage()?.name : getSelectedPackage()?.nameEn}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">{isRTL ? "نوع المتابعة:" : "Follow-up Type:"}</span>
                <span className="font-semibold">
                  {medicalFollowup ? (isRTL ? "متابعة طبية" : "Medical") : (isRTL ? "عادي" : "Regular")}
                </span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between items-center">
                <span className="font-bold">{isRTL ? "الإجمالي:" : "Total:"}</span>
                <span className="text-2xl font-bold text-primary">
                  {calculatePrice().toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                </span>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{isRTL ? "تأكيد الطلب" : "Confirm Your Order"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? "راجع بياناتك قبل التأكيد" : "Review your details before confirming"}
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
              {/* Personal Info */}
              <div className="pb-3 border-b border-border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {isRTL ? "البيانات الشخصية" : "Personal Info"}
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">{isRTL ? "الاسم:" : "Name:"}</span> {fullName}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "البريد:" : "Email:"}</span> {email}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "الهاتف:" : "Phone:"}</span> {phone}</p>
                </div>
              </div>

              {/* Package Info */}
              <div className="pb-3 border-b border-border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  {isRTL ? "الباقة" : "Package"}
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">{isRTL ? "النظام:" : "Plan:"}</span> {isRTL ? getSelectedPackage()?.name : getSelectedPackage()?.nameEn}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "المدة:" : "Duration:"}</span> {isRTL ? getSelectedPackage()?.duration : getSelectedPackage()?.durationEn}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "النوع:" : "Type:"}</span> {medicalFollowup ? (isRTL ? "متابعة طبية" : "Medical") : (isRTL ? "عادي" : "Regular")}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {isRTL ? "الدفع" : "Payment"}
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">{isRTL ? "الطريقة:" : "Method:"}</span> {isRTL ? getSelectedPayment()?.name : getSelectedPayment()?.nameEn}</p>
                  <p className="text-lg font-bold text-primary mt-2">
                    {isRTL ? "الإجمالي:" : "Total:"} {calculatePrice().toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                {isRTL
                  ? "⚠️ سيتم مراجعة طلبك وتفعيل حسابك بعد تأكيد الدفع"
                  : "⚠️ Your request will be reviewed and your account activated after payment confirmation"}
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background ${isRTL ? "rtl" : "ltr"}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <img src={logo} alt="NutriRehab" className="h-12 w-auto" />
          <span className="text-xl font-bold text-gradient">NutriRehab</span>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 mx-1 rounded transition-all ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <p className="text-center text-sm text-muted-foreground mb-4">
          {isRTL ? `الخطوة ${currentStep} من 4` : `Step ${currentStep} of 4`}: {steps[currentStep - 1].title}
        </p>

        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-elevated">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {isRTL ? "السابق" : "Back"}
              </Button>
            )}
            {currentStep < 4 ? (
              <Button type="button" variant="hero" onClick={nextStep} className="flex-1">
                {isRTL ? "التالي" : "Next"}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            ) : (
              <Button
                type="button"
                variant="hero"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                ) : (
                  <>
                    {isRTL ? "تأكيد الطلب" : "Confirm Order"}
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-muted-foreground text-sm">
            {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              {isRTL ? "تسجيل الدخول" : "Login"}
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-2">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            {isRTL ? "← العودة للرئيسية" : "← Back to Home"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
