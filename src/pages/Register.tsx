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
  Camera,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { toast } from "sonner";
import logo from "@/assets/alligator-fit-logo.png";

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
  const { trackLead, trackCompleteRegistration } = useFacebookPixel();

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

  // Receipt screenshot
  const [receiptUrl, setReceiptUrl] = useState("");

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
        // Track Lead and CompleteRegistration events
        trackLead('registration_form');
        trackCompleteRegistration();
        
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
            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-bold">{isRTL ? "تأكيد الطلب" : "Confirm Your Order"}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL ? "راجع بياناتك قبل التأكيد" : "Review your details before confirming"}
              </p>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-card border border-border text-sm">
              {/* Personal Info */}
              <div className="pb-2 border-b border-border">
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {isRTL ? "البيانات الشخصية" : "Personal Info"}
                </h3>
                <div className="text-xs space-y-0.5">
                  <p><span className="text-muted-foreground">{isRTL ? "الاسم:" : "Name:"}</span> {fullName}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "البريد:" : "Email:"}</span> {email}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "الهاتف:" : "Phone:"}</span> {phone}</p>
                </div>
              </div>

              {/* Package Info */}
              <div className="pb-2 border-b border-border">
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  {isRTL ? "الباقة" : "Package"}
                </h3>
                <div className="text-xs space-y-0.5">
                  <p><span className="text-muted-foreground">{isRTL ? "النظام:" : "Plan:"}</span> {isRTL ? getSelectedPackage()?.name : getSelectedPackage()?.nameEn}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "المدة:" : "Duration:"}</span> {isRTL ? getSelectedPackage()?.duration : getSelectedPackage()?.durationEn}</p>
                  <p><span className="text-muted-foreground">{isRTL ? "النوع:" : "Type:"}</span> {medicalFollowup ? (isRTL ? "متابعة طبية" : "Medical") : (isRTL ? "عادي" : "Regular")}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  {isRTL ? "الدفع" : "Payment"}
                </h3>
                <div className="text-xs space-y-0.5">
                  <p><span className="text-muted-foreground">{isRTL ? "الطريقة:" : "Method:"}</span> {isRTL ? getSelectedPayment()?.name : getSelectedPayment()?.nameEn}</p>
                  <p className="text-base font-bold text-primary mt-1">
                    {isRTL ? "الإجمالي:" : "Total:"} {calculatePrice().toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {selectedPayment && selectedPayment !== 'cash' && (
              <div className="p-3 bg-muted/50 rounded-xl border space-y-2">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  📝 {isRTL ? 'تعليمات الدفع' : 'Payment Instructions'}
                </h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  {selectedPayment === 'vodafone-cash' ? (
                    <>
                      <li>{isRTL ? 'افتح تطبيق فودافون كاش' : 'Open Vodafone Cash app'}</li>
                      <li>{isRTL ? 'حول المبلغ إلى: 01016111733' : 'Transfer to: 01016111733'}</li>
                      <li>{isRTL ? 'احتفظ برقم العملية' : 'Keep the transaction number'}</li>
                      <li>{isRTL ? 'ارفع سكرين شوت التحويل أدناه' : 'Upload transfer screenshot below'}</li>
                    </>
                  ) : selectedPayment === 'instapay' ? (
                    <>
                      <li>{isRTL ? 'افتح تطبيق البنك' : 'Open your bank app'}</li>
                      <li>{isRTL ? 'اختر InstaPay' : 'Choose InstaPay'}</li>
                      <li>{isRTL ? 'حول إلى: mahmoudreaky@instapay' : 'Transfer to: mahmoudreaky@instapay'}</li>
                      <li>{isRTL ? 'ارفع سكرين شوت التحويل أدناه' : 'Upload transfer screenshot below'}</li>
                    </>
                  ) : (
                    <>
                      <li>{isRTL ? 'حول المبلغ للحساب البنكي' : 'Transfer to bank account'}</li>
                      <li>{isRTL ? 'سنتواصل معك لإرسال تفاصيل الحساب' : 'We will contact you with account details'}</li>
                      <li>{isRTL ? 'ارفع سكرين شوت التحويل أدناه' : 'Upload transfer screenshot below'}</li>
                    </>
                  )}
                </ol>
              </div>
            )}

            {/* Screenshot Upload Section */}
            {selectedPayment && selectedPayment !== 'cash' && (
              <div className="p-3 bg-secondary/10 border-2 border-secondary/30 rounded-xl">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex-1 w-full">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-secondary" />
                      {isRTL ? 'ارفع صورة إيصال التحويل' : 'Upload Transfer Receipt'}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {isRTL 
                        ? 'بعد تحويل المبلغ، ارفع سكرين شوت للمعاملة هنا للتأكيد السريع ✅'
                        : 'After transferring, upload a screenshot of the transaction here for quick confirmation ✅'}
                    </p>
                    
                    {/* Image Upload Component */}
                    <div className="w-full">
                      <ImageUpload
                        value={receiptUrl}
                        onChange={setReceiptUrl}
                        placeholder={isRTL ? '📸 اضغط لرفع صورة الإيصال' : '📸 Click to upload receipt'}
                        bucket="receipts"
                        folder="subscriptions"
                        className="mb-2 w-full"
                      />
                    </div>

                    {receiptUrl && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-primary">
                          {isRTL ? 'تم رفع الصورة بنجاح!' : 'Receipt uploaded successfully!'}
                        </span>
                      </motion.div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-secondary/20">
                      <p className="text-xs text-muted-foreground mb-2">
                        {isRTL ? 'أو أرسل عبر واتساب:' : 'Or send via WhatsApp:'}
                      </p>
                      <a 
                        href="https://wa.me/201016111733" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20bd5a] transition-colors w-full justify-center"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {isRTL ? 'أرسل عبر واتساب' : 'Send via WhatsApp'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {isRTL
                  ? "سيتم مراجعة طلبك وتفعيل حسابك بعد تأكيد الدفع"
                  : "Your account will be activated after payment confirmation"}
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
          <img src={logo} alt="Alligator Fit" className="h-12 w-auto" />
          <span className="text-xl font-bold text-gradient">Alligator Fit</span>
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
