import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Wallet,
  Upload,
  Clock,
  Zap,
  CheckCircle2,
  CreditCard,
  Shield,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  Image,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import logo from "@/assets/logo.png";

type PaymentType = "manual" | "electronic" | null;

interface ManualPaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  number: string;
  holderName: string;
  holderNameEn: string;
  instructions: string;
  instructionsEn: string;
}

interface ElectronicPaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  country: string;
  countryEn: string;
  description: string;
  descriptionEn: string;
  available: boolean;
}

const manualPaymentMethods: ManualPaymentMethod[] = [
  {
    id: "vodafone-cash",
    name: "فودافون كاش",
    nameEn: "Vodafone Cash",
    icon: <Smartphone className="w-6 h-6" />,
    number: "01016111733",
    holderName: "محمود الريقي",
    holderNameEn: "Mahmoud Al-Reaky",
    instructions: "حول المبلغ للرقم أعلاه ثم ارفع صورة الإيصال",
    instructionsEn: "Transfer the amount to the number above then upload the receipt",
  },
  {
    id: "instapay",
    name: "انستاباي",
    nameEn: "InstaPay",
    icon: <Wallet className="w-6 h-6" />,
    number: "mahmoudreaky@instapay",
    holderName: "محمود الريقي",
    holderNameEn: "Mahmoud Al-Reaky",
    instructions: "حول المبلغ باستخدام الـ IPA أعلاه ثم ارفع صورة الإيصال",
    instructionsEn: "Transfer using the IPA above then upload the receipt",
  },
];

const electronicPaymentMethods: ElectronicPaymentMethod[] = [
  {
    id: "paymob",
    name: "Paymob",
    nameEn: "Paymob",
    icon: <CreditCard className="w-6 h-6" />,
    country: "مصر 🇪🇬",
    countryEn: "Egypt 🇪🇬",
    description: "ادفع بالبطاقة البنكية أو المحفظة الإلكترونية",
    descriptionEn: "Pay with bank card or e-wallet",
    available: true,
  },
  {
    id: "tap",
    name: "Tap Payments",
    nameEn: "Tap Payments",
    icon: <CreditCard className="w-6 h-6" />,
    country: "السعودية 🇸🇦",
    countryEn: "Saudi Arabia 🇸🇦",
    description: "ادفع بالبطاقة البنكية - مدى، فيزا، ماستركارد",
    descriptionEn: "Pay with bank card - Mada, Visa, Mastercard",
    available: false,
  },
];

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRTL } = useLanguage();
  const { user, profile } = useAuth();

  const [paymentType, setPaymentType] = useState<PaymentType>(null);
  const [selectedManualMethod, setSelectedManualMethod] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get package info from URL params or profile
  const packageId = searchParams.get("package") || profile?.selected_package;
  const amount = searchParams.get("amount") || "0";

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(isRTL ? "تم النسخ!" : "Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الملف كبير جداً (الحد الأقصى 5MB)" : "File too large (max 5MB)");
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleManualPaymentSubmit = async () => {
    if (!receiptFile) {
      toast.error(isRTL ? "الرجاء رفع صورة الإيصال" : "Please upload receipt image");
      return;
    }
    if (!senderName.trim()) {
      toast.error(isRTL ? "الرجاء إدخال اسم المرسل" : "Please enter sender name");
      return;
    }
    if (!senderPhone.trim()) {
      toast.error(isRTL ? "الرجاء إدخال رقم المرسل" : "Please enter sender phone");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user?.id || "guest"}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);

      if (uploadError) {
        // If bucket doesn't exist, show message
        if (uploadError.message.includes("Bucket not found")) {
          toast.error(
            isRTL
              ? "جاري تجهيز نظام الرفع، يرجى المحاولة لاحقاً"
              : "Upload system being prepared, please try again later"
          );
          setIsSubmitting(false);
          return;
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);

      // Save payment record (you would create a payments table)
      toast.success(
        isRTL
          ? "تم رفع الإيصال بنجاح! سيتم مراجعته وتفعيل حسابك خلال 24 ساعة"
          : "Receipt uploaded successfully! Your account will be activated within 24 hours"
      );

      // Navigate to pending page
      navigate("/pending-approval");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(isRTL ? "حدث خطأ أثناء الرفع" : "Upload error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleElectronicPayment = (methodId: string) => {
    toast.info(
      isRTL
        ? "الدفع الإلكتروني قيد التجهيز، يرجى استخدام الدفع اليدوي حالياً"
        : "Electronic payment is being prepared, please use manual payment for now"
    );
  };

  return (
    <Layout>
      <div className={`min-h-screen bg-background py-12 ${isRTL ? "rtl" : "ltr"}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {isRTL ? "إتمام الدفع" : "Complete Payment"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? "اختر طريقة الدفع المناسبة لك" : "Choose your preferred payment method"}
            </p>
            {amount && parseInt(amount) > 0 && (
              <div className="mt-4 inline-block px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-muted-foreground">{isRTL ? "المبلغ المطلوب:" : "Amount Due:"}</span>
                <span className="text-2xl font-bold text-primary mx-2">{parseInt(amount).toLocaleString()}</span>
                <span className="text-muted-foreground">{isRTL ? "ج.م" : "EGP"}</span>
              </div>
            )}
          </motion.div>

          {/* Payment Type Selection */}
          {!paymentType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Manual Payment Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentType("manual")}
                className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-start group"
              >
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs">
                    <Clock className="w-3 h-3" />
                    {isRTL ? "24 ساعة" : "24 hours"}
                  </div>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-orange-500" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {isRTL ? "دفع يدوي" : "Manual Payment"}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {isRTL
                    ? "فودافون كاش أو انستاباي - ارفع صورة الإيصال"
                    : "Vodafone Cash or InstaPay - Upload receipt"}
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {isRTL ? "فودافون كاش" : "Vodafone Cash"}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {isRTL ? "انستاباي" : "InstaPay"}
                  </li>
                  <li className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    {isRTL ? "التفعيل خلال 24 ساعة" : "Activation within 24 hours"}
                  </li>
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-primary font-semibold group-hover:underline">
                    {isRTL ? "اختر هذه الطريقة" : "Choose this method"}
                  </span>
                  <ArrowRight className={`w-5 h-5 text-primary ${isRTL ? "rotate-180" : ""}`} />
                </div>
              </motion.button>

              {/* Electronic Payment Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentType("electronic")}
                className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all text-start group"
              >
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs">
                    <Zap className="w-3 h-3" />
                    {isRTL ? "فوري" : "Instant"}
                  </div>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {isRTL ? "دفع إلكتروني" : "Electronic Payment"}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {isRTL
                    ? "ادفع بالبطاقة - تفعيل فوري"
                    : "Pay by card - Instant activation"}
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Paymob ({isRTL ? "مصر" : "Egypt"}) 🇪🇬
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Tap ({isRTL ? "السعودية" : "Saudi"}) 🇸🇦
                  </li>
                  <li className="flex items-center gap-2 text-green-600">
                    <Zap className="w-4 h-4" />
                    {isRTL ? "تفعيل تلقائي فوري" : "Automatic instant activation"}
                  </li>
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-primary font-semibold group-hover:underline">
                    {isRTL ? "اختر هذه الطريقة" : "Choose this method"}
                  </span>
                  <ArrowRight className={`w-5 h-5 text-primary ${isRTL ? "rotate-180" : ""}`} />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Comparison Table */}
          {!paymentType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border"
            >
              <h3 className="text-lg font-bold text-center mb-6">
                {isRTL ? "مقارنة بين الطريقتين" : "Comparison"}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-start font-semibold">{isRTL ? "الميزة" : "Feature"}</th>
                      <th className="py-3 px-4 text-center font-semibold text-orange-500">
                        {isRTL ? "دفع يدوي" : "Manual"}
                      </th>
                      <th className="py-3 px-4 text-center font-semibold text-primary">
                        {isRTL ? "دفع إلكتروني" : "Electronic"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">{isRTL ? "وقت التفعيل" : "Activation Time"}</td>
                      <td className="py-3 px-4 text-center text-yellow-600">{isRTL ? "24 ساعة" : "24 hours"}</td>
                      <td className="py-3 px-4 text-center text-green-600">{isRTL ? "فوري" : "Instant"}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">{isRTL ? "طريقة الدفع" : "Payment Method"}</td>
                      <td className="py-3 px-4 text-center">{isRTL ? "محفظة إلكترونية" : "E-Wallet"}</td>
                      <td className="py-3 px-4 text-center">{isRTL ? "بطاقة بنكية" : "Bank Card"}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">{isRTL ? "رسوم إضافية" : "Extra Fees"}</td>
                      <td className="py-3 px-4 text-center text-green-600">{isRTL ? "لا يوجد" : "None"}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{isRTL ? "رسوم بسيطة" : "Small fee"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">{isRTL ? "المراجعة" : "Review"}</td>
                      <td className="py-3 px-4 text-center">{isRTL ? "يدوية" : "Manual"}</td>
                      <td className="py-3 px-4 text-center">{isRTL ? "تلقائية" : "Automatic"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Manual Payment Flow */}
          <AnimatePresence mode="wait">
            {paymentType === "manual" && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPaymentType(null);
                    setSelectedManualMethod(null);
                  }}
                  className="mb-6"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {isRTL ? "رجوع" : "Back"}
                </Button>

                <h2 className="text-2xl font-bold mb-6">
                  {isRTL ? "الدفع اليدوي" : "Manual Payment"}
                </h2>

                {/* Payment Method Selection */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {manualPaymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedManualMethod(method.id)}
                      className={`p-4 rounded-xl border transition-all text-start ${
                        selectedManualMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            selectedManualMethod === method.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="font-bold">{isRTL ? method.name : method.nameEn}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? method.holderName : method.holderNameEn}
                          </p>
                        </div>
                        {selectedManualMethod === method.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Selected Method Details */}
                {selectedManualMethod && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Payment Details */}
                    {manualPaymentMethods
                      .filter((m) => m.id === selectedManualMethod)
                      .map((method) => (
                        <div key={method.id} className="p-6 rounded-xl bg-card border border-border">
                          <h3 className="font-bold mb-4">{isRTL ? "بيانات التحويل" : "Transfer Details"}</h3>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {method.id === "instapay" ? "IPA" : isRTL ? "الرقم" : "Number"}
                                </p>
                                <p className="font-mono font-bold text-lg">{method.number}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(method.number, "number")}
                              >
                                {copiedField === "number" ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {isRTL ? "اسم المستلم" : "Recipient Name"}
                                </p>
                                <p className="font-bold">{isRTL ? method.holderName : method.holderNameEn}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(method.holderName, "name")}
                              >
                                {copiedField === "name" ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm text-yellow-600 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {isRTL ? method.instructions : method.instructionsEn}
                            </p>
                          </div>
                        </div>
                      ))}

                    {/* Sender Info & Receipt Upload */}
                    <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                      <h3 className="font-bold">{isRTL ? "بيانات المرسل والإيصال" : "Sender Info & Receipt"}</h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {isRTL ? "اسم المرسل" : "Sender Name"} *
                          </label>
                          <Input
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder={isRTL ? "الاسم كما هو في المحفظة" : "Name as in wallet"}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {isRTL ? "رقم المرسل" : "Sender Phone"} *
                          </label>
                          <Input
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder={isRTL ? "رقم الهاتف" : "Phone number"}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {isRTL ? "ملاحظات (اختياري)" : "Notes (optional)"}
                        </label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={isRTL ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                          rows={2}
                        />
                      </div>

                      {/* Receipt Upload */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {isRTL ? "صورة الإيصال" : "Receipt Image"} *
                        </label>

                        {!receiptPreview ? (
                          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                            <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "اضغط لرفع صورة الإيصال" : "Click to upload receipt image"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isRTL ? "PNG, JPG حتى 5MB" : "PNG, JPG up to 5MB"}
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="relative">
                            <img
                              src={receiptPreview}
                              alt="Receipt"
                              className="w-full max-h-64 object-contain rounded-xl border border-border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={removeReceipt}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        variant="hero"
                        className="w-full py-6 text-lg"
                        onClick={handleManualPaymentSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isRTL ? "جاري الرفع..." : "Uploading..."}
                          </>
                        ) : (
                          <>
                            {isRTL ? "تأكيد الدفع" : "Confirm Payment"}
                            <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        {isRTL
                          ? "⏰ سيتم مراجعة الإيصال وتفعيل حسابك خلال 24 ساعة"
                          : "⏰ Receipt will be reviewed and your account activated within 24 hours"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Electronic Payment Flow */}
            {paymentType === "electronic" && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setPaymentType(null)}
                  className="mb-6"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {isRTL ? "رجوع" : "Back"}
                </Button>

                <h2 className="text-2xl font-bold mb-6">
                  {isRTL ? "الدفع الإلكتروني" : "Electronic Payment"}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {electronicPaymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: method.available ? 1.02 : 1 }}
                      className={`p-6 rounded-xl border transition-all ${
                        method.available
                          ? "bg-card border-border hover:border-primary/50 cursor-pointer"
                          : "bg-muted/30 border-border/50 opacity-70"
                      }`}
                      onClick={() => method.available && handleElectronicPayment(method.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            method.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <span className="text-lg">{method.country}</span>
                      </div>

                      <h3 className="text-xl font-bold mb-2">{method.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {isRTL ? method.description : method.descriptionEn}
                      </p>

                      {!method.available && (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm">
                          <Clock className="w-4 h-4" />
                          {isRTL ? "قريباً..." : "Coming soon..."}
                        </div>
                      )}

                      {method.available && (
                        <Button className="w-full mt-4">
                          {isRTL ? "ادفع الآن" : "Pay Now"}
                          <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">{isRTL ? "دفع آمن ومضمون" : "Secure Payment"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "جميع المعاملات مشفرة ومحمية. يتم تفعيل حسابك تلقائياً بعد الدفع الناجح."
                          : "All transactions are encrypted and protected. Your account is activated automatically after successful payment."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
