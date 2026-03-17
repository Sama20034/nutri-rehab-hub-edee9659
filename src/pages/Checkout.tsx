import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Gift, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  FileText, 
  CreditCard, 
  Mail, 
  User,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Sparkles,
  Camera,
  AlertCircle,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  price: number;
  image_url: string | null;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

type PaymentMethod = 'cash_on_delivery' | 'vodafone_cash' | 'instapay' | 'paymob';

// Validation schema
const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255).or(z.literal('')).optional(),
  governorate: z.string().trim().min(2, 'Governorate is required').max(100),
  city: z.string().trim().min(2, 'City is required').max(100),
  street_address: z.string().trim().min(5, 'Street address must be at least 5 characters').max(500),
  phone: z.string().trim().regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
  notes: z.string().max(500).optional()
});

const PAYMENT_METHODS = {
  cash_on_delivery: {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    name_ar: 'الدفع عند الاستلام',
    description: 'Pay when you receive your order',
    description_ar: 'ادفع عند استلام طلبك',
    icon: Banknote,
    color: 'text-green-500'
  },
  vodafone_cash: {
    id: 'vodafone_cash',
    name: 'Vodafone Cash',
    name_ar: 'فودافون كاش',
    description: 'Transfer to: 01016111733',
    description_ar: 'حول إلى: 01016111733',
    icon: Smartphone,
    color: 'text-red-500'
  },
  instapay: {
    id: 'instapay',
    name: 'InstaPay',
    name_ar: 'انستاباي',
    description: 'Transfer to: mahmoudreaky@instapay',
    description_ar: 'حول إلى: mahmoudreaky@instapay',
    icon: Wallet,
    color: 'text-blue-500'
  },
  paymob: {
    id: 'paymob',
    name: 'Online Payment',
    name_ar: 'دفع إلكتروني',
    description: 'Visa / Mastercard / Mobile Wallets',
    description_ar: 'فيزا / ماستركارد / محافظ إلكترونية',
    icon: CreditCard,
    color: 'text-purple-500'
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, profile, loading } = useAuth();
  const queryClient = useQueryClient();
  const { cartItems, cartTotal: baseCartTotal, clearCart, updateQuantity, removeFromCart, isLoading: cartLoading, isCartReady } = useCart();
  const { trackPurchase, trackInitiateCheckout } = useFacebookPixel();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [checkoutData, setCheckoutData] = useState({
    full_name: '',
    email: '',
    governorate: '',
    city: '',
    street_address: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add-on plans
  const [freeUsagePlan, setFreeUsagePlan] = useState(false);
  const [monthlyNutritionPlan, setMonthlyNutritionPlan] = useState(false);
  const NUTRITION_PLAN_PRICE = 100;
  
  // Receipt screenshot
  const [receiptUrl, setReceiptUrl] = useState('');
  
  // Paymob loading state
  const [paymobLoading, setPaymobLoading] = useState(false);

  const productTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const addonsTotal = monthlyNutritionPlan ? NUTRITION_PLAN_PRICE : 0;
  const cartTotal = productTotal + addonsTotal;
  const grantsAccess = productTotal >= 7500;

  // Redirect if cart is empty only after cart is ready
  useEffect(() => {
    if (isCartReady && cartItems.length === 0) {
      toast.error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      navigate('/store');
    }
  }, [isCartReady, cartItems.length, navigate, isRTL]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setCheckoutData(prev => ({
        ...prev,
        full_name: prev.full_name || profile?.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  // Track InitiateCheckout when entering checkout page
  useEffect(() => {
    if (cartItems.length > 0 && isCartReady) {
      trackInitiateCheckout(cartTotal, 'EGP');
    }
  }, [isCartReady, cartItems.length, cartTotal, trackInitiateCheckout]);

  // Combine address fields into a single string
  const getFullAddress = () => {
    return `${checkoutData.governorate}, ${checkoutData.city}, ${checkoutData.street_address}`;
  };

  // Validate form
  const validateForm = () => {
    try {
      checkoutSchema.parse(checkoutData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep('payment');
    }
  };

  // Handle Paymob electronic payment
  const handlePaymobPayment = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) return;
    
    setPaymobLoading(true);
    try {
      const addOns: string[] = [];
      if (freeUsagePlan) addOns.push('✅ Optimal Usage Plan (FREE)');
      if (monthlyNutritionPlan) addOns.push(`✅ Monthly Nutrition Plan (+${NUTRITION_PLAN_PRICE} EGP)`);
      const addOnsText = addOns.length > 0 ? `\n\nAdd-ons:\n${addOns.join('\n')}` : '';

      const orderPayload: any = {
        total_amount: cartTotal,
        shipping_address: getFullAddress(),
        phone: checkoutData.phone,
        customer_name: checkoutData.full_name || null,
        guest_email: checkoutData.email || user?.email || null,
        notes: `${checkoutData.notes || ''}${addOnsText}\n\nPayment Method: Paymob (Online)`,
        status: 'pending_payment',
        grants_content_access: grantsAccess
      };

      if (user) {
        orderPayload.user_id = user.id;
      } else {
        orderPayload.guest_name = checkoutData.full_name || null;
      }

      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const nameParts = (checkoutData.full_name || user?.email || 'Customer').split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'N/A';

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      // Call edge function - it creates the order AND the Paymob intention
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-paymob-intention`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            amount: cartTotal,
            currency: 'EGP',
            order_data: {
              order: orderPayload,
              items: orderItems,
            },
            items: cartItems.map(item => ({
              name: item.product.name,
              amount: item.product.price,
              quantity: item.quantity,
              description: item.product.name,
            })),
            billing_data: {
              first_name: firstName,
              last_name: lastName,
              email: checkoutData.email || user?.email || 'customer@example.com',
              phone: checkoutData.phone,
              address: getFullAddress(),
              city: checkoutData.city || 'Cairo',
              country: 'EG',
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.client_secret) {
        throw new Error(result.error || 'Failed to create payment session');
      }

      // Clear cart
      if (user) {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } else {
        clearCart();
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      // Redirect to Paymob
      const publicKey = import.meta.env.VITE_PAYMOB_PUBLIC_KEY;
      const paymobUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${result.client_secret}`;
      window.location.href = paymobUrl;
    } catch (error: any) {
      console.error('Paymob payment error:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ في الدفع' : 'Payment error occurred'));
    } finally {
      setPaymobLoading(false);
    }
  };


  const placeOrder = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) throw new Error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      
      if (!validateForm()) {
        throw new Error(isRTL ? 'يرجى تصحيح الأخطاء' : 'Please fix the errors');
      }

      const addOns: string[] = [];
      if (freeUsagePlan) {
        addOns.push(isRTL ? '✅ خطة الاستخدام الأمثل (مجاناً)' : '✅ Optimal Usage Plan (FREE)');
      }
      if (monthlyNutritionPlan) {
        addOns.push(isRTL ? `✅ خطة تغذية شهرية (+${NUTRITION_PLAN_PRICE} ج.م)` : `✅ Monthly Nutrition Plan (+${NUTRITION_PLAN_PRICE} EGP)`);
      }
      
      const addOnsText = addOns.length > 0 
        ? `\n\nAdd-ons:\n${addOns.join('\n')}` 
        : '';

      const receiptText = receiptUrl 
        ? `\n\n📸 Receipt Screenshot: ${receiptUrl}` 
        : '';

      const orderPayload: any = {
        total_amount: cartTotal,
        shipping_address: getFullAddress(),
        phone: checkoutData.phone,
        customer_name: checkoutData.full_name || null,
        guest_email: checkoutData.email || user?.email || null,
        notes: checkoutData.notes 
          ? `${checkoutData.notes}${addOnsText}${receiptText}\n\nPayment Method: ${PAYMENT_METHODS[paymentMethod].name}`
          : `${addOnsText}${receiptText}\n\nPayment Method: ${PAYMENT_METHODS[paymentMethod].name}`,
        status: receiptUrl ? 'pending_verification' : 'pending',
        grants_content_access: grantsAccess
      };

      if (user) {
        orderPayload.user_id = user.id;
      } else {
        orderPayload.guest_name = checkoutData.full_name || null;
      }

      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      // Call edge function to create order server-side (bypasses RLS)
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            order: orderPayload,
            items: orderItems,
            clear_cart_user_id: user?.id || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear guest cart
      if (!user) {
        clearCart();
      }

      return result.order;
    },
    onSuccess: (order) => {
      trackPurchase(cartTotal, 'EGP', order?.id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(isRTL ? 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً' : 'Order placed successfully! We will contact you soon');
      navigate('/store');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;

  if (!isCartReady || cartLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => step === 'payment' ? setStep('details') : navigate('/store')}
            className="mb-3 sm:mb-4 h-10 text-sm"
          >
            <BackIcon className="h-4 w-4 mr-1 sm:mr-2" />
            {step === 'payment' 
              ? (isRTL ? 'العودة للبيانات' : 'Back to Details')
              : (isRTL ? 'العودة للمتجر' : 'Back to Store')}
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {isRTL ? 'إتمام الطلب' : 'Checkout'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {step === 'details'
                  ? (isRTL ? 'الخطوة 1: أدخل بياناتك' : 'Step 1: Enter your details')
                  : (isRTL ? 'الخطوة 2: اختر طريقة الدفع' : 'Step 2: Choose payment method')}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className={`flex items-center gap-1 sm:gap-2 ${step === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                {step === 'payment' ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : '1'}
              </div>
              <span className="text-xs sm:text-sm font-medium">{isRTL ? 'البيانات' : 'Details'}</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-muted" />
            <div className={`flex items-center gap-1 sm:gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-xs sm:text-sm font-medium">{isRTL ? 'الدفع' : 'Payment'}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-2 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={isRTL ? item.product.name_ar || item.product.name : item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                        {isRTL ? item.product.name_ar || item.product.name : item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={cartLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={cartLoading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                          disabled={cartLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary text-sm sm:text-base">
                        {(item.product.price * item.quantity).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Add-on Plans Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    {isRTL ? 'خدمات إضافية' : 'Add-on Services'}
                  </h4>
                  
                  {/* Free Usage Plan */}
                  <motion.div 
                    className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      freeUsagePlan 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFreeUsagePlan(!freeUsagePlan)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        freeUsagePlan 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {freeUsagePlan && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground text-sm sm:text-base">
                            {isRTL ? 'خطة الاستخدام الأمثل' : 'Optimal Usage Plan'}
                          </p>
                          <span className="text-primary font-bold text-sm sm:text-base">
                            {isRTL ? 'مجاناً' : 'FREE'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {isRTL 
                            ? 'احصل على دليل مجاني لأفضل طريقة لاستخدام المنتجات التي طلبتها'
                            : 'Get a free guide for the best way to use the products you ordered'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Monthly Nutrition Plan - 100 EGP */}
                  <motion.div 
                    className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      monthlyNutritionPlan 
                        ? 'border-secondary bg-secondary/10' 
                        : 'border-border hover:border-secondary/50'
                    }`}
                    onClick={() => setMonthlyNutritionPlan(!monthlyNutritionPlan)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        monthlyNutritionPlan 
                          ? 'bg-secondary border-secondary' 
                          : 'border-muted-foreground'
                      }`}>
                        {monthlyNutritionPlan && <CheckCircle2 className="h-3.5 w-3.5 text-secondary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-secondary" />
                            {isRTL ? 'خطة تغذية شهرية' : 'Monthly Nutrition Plan'}
                          </p>
                          <span className="text-secondary font-bold text-sm sm:text-base">
                            +{NUTRITION_PLAN_PRICE} {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {isRTL 
                            ? 'خطة تغذية مخصصة لمدة شهر كامل مع متابعة'
                            : 'A customized nutrition plan for a full month with follow-up'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{isRTL ? 'المنتجات:' : 'Products:'}</span>
                    <span>{productTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                  </div>
                  {monthlyNutritionPlan && (
                    <div className="flex justify-between items-center text-sm text-secondary">
                      <span>{isRTL ? 'خطة التغذية الشهرية:' : 'Monthly Nutrition Plan:'}</span>
                      <span>+{NUTRITION_PLAN_PRICE} {isRTL ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-base sm:text-lg pt-2 border-t border-border/50">
                    <span className="font-semibold">{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                    <span className="font-bold text-primary text-lg sm:text-xl">
                      {cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>

                {grantsAccess && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 sm:p-4 bg-primary/10 border border-primary/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 text-primary">
                      <Gift className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {isRTL ? '🎉 هدية مجانية!' : '🎉 Free Gift!'}
                        </p>
                        <p className="text-xs sm:text-sm opacity-90">
                          {isRTL 
                            ? 'ستحصل على وصول مجاني للمحتوى الغذائي المميز!'
                            : 'You will get FREE access to premium nutritional content!'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Form / Payment Selection */}
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      {isRTL ? 'بيانات الشحن' : 'Shipping Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-5">
                    {/* All users are now logged in - no guest fields needed */}

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        {isRTL ? 'المحافظة' : 'Governorate'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={checkoutData.governorate}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, governorate: e.target.value }))}
                        placeholder={isRTL ? 'مثال: القاهرة' : 'e.g. Cairo'}
                        className={`h-10 sm:h-11 text-sm sm:text-base ${errors.governorate ? 'border-destructive' : ''}`}
                      />
                      {errors.governorate && (
                        <p className="text-xs sm:text-sm text-destructive">{errors.governorate}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        {isRTL ? 'المدينة' : 'City'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={checkoutData.city}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder={isRTL ? 'مثال: مدينة نصر' : 'e.g. Nasr City'}
                        className={`h-10 sm:h-11 text-sm sm:text-base ${errors.city ? 'border-destructive' : ''}`}
                      />
                      {errors.city && (
                        <p className="text-xs sm:text-sm text-destructive">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        {isRTL ? 'اسم المنطقة والشارع وعلامة مميزة' : 'Area, Street & Landmark'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        value={checkoutData.street_address}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, street_address: e.target.value }))}
                        placeholder={isRTL ? 'مثال: شارع مصطفى النحاس، بجوار مسجد الحصري، عمارة 5 شقة 12' : 'e.g. Mostafa El Nahas St., beside Al-Hosary Mosque, Building 5 Apt 12'}
                        className={`min-h-[80px] sm:min-h-[100px] text-sm sm:text-base ${errors.street_address ? 'border-destructive' : ''}`}
                      />
                      {errors.street_address && (
                        <p className="text-xs sm:text-sm text-destructive">{errors.street_address}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01xxxxxxxxx"
                        type="tel"
                        className={`h-10 sm:h-11 text-sm sm:text-base ${errors.phone ? 'border-destructive' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-xs sm:text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        {isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                      </label>
                      <Textarea
                        value={checkoutData.notes}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                        className="min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                      />
                    </div>

                    <Separator />

                    <Button 
                      className="w-full h-11 sm:h-12 text-sm sm:text-base gap-2"
                      size="lg"
                      onClick={handleNextStep}
                    >
                      {isRTL ? 'التالي: اختر طريقة الدفع' : 'Next: Choose Payment'}
                      <NextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-sm">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                      {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-5">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="space-y-3 sm:space-y-4"
                    >
                      {Object.values(PAYMENT_METHODS).map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            className={`relative flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                            <div className={`p-2 sm:p-3 rounded-full bg-muted ${method.color}`}>
                              <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={method.id} className="text-sm sm:text-base font-semibold cursor-pointer">
                                {isRTL ? method.name_ar : method.name}
                              </Label>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {isRTL ? method.description_ar : method.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {/* Payment Instructions - only for manual methods */}
                    {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-xl border">
                          <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2">
                            {isRTL ? '📝 تعليمات الدفع' : '📝 Payment Instructions'}
                          </h4>
                          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2 list-decimal list-inside">
                            {paymentMethod === 'vodafone_cash' ? (
                              <>
                                <li>{isRTL ? 'افتح تطبيق فودافون كاش' : 'Open Vodafone Cash app'}</li>
                                <li>{isRTL ? 'حول المبلغ إلى: 01016111733' : 'Transfer to: 01016111733'}</li>
                                <li>{isRTL ? 'احتفظ برقم العملية' : 'Keep the transaction number'}</li>
                                <li>{isRTL ? 'سنتواصل معك للتأكيد' : 'We will contact you'}</li>
                              </>
                            ) : (
                              <>
                                <li>{isRTL ? 'افتح تطبيق البنك' : 'Open your bank app'}</li>
                                <li>{isRTL ? 'اختر InstaPay' : 'Choose InstaPay'}</li>
                                <li>{isRTL ? 'حول إلى: mahmoudreaky@instapay' : 'Transfer to: mahmoudreaky@instapay'}</li>
                                <li>{isRTL ? 'سنتواصل معك للتأكيد' : 'We will contact you'}</li>
                              </>
                            )}
                          </ol>
                        </div>

                        {/* Screenshot Upload Section */}
                        <div className="p-3 sm:p-4 bg-secondary/10 border-2 border-secondary/30 rounded-xl">
                          <div className="flex flex-col items-start gap-3">
                            <div className="flex-1 w-full">
                              <h4 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2 mb-2">
                                <Camera className="h-4 w-4 text-secondary sm:hidden" />
                                <AlertCircle className="h-4 w-4 text-secondary hidden sm:block" />
                                {isRTL ? 'ارفع صورة إيصال التحويل (إجباري)' : 'Upload Transfer Receipt (Required)'}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                                {isRTL 
                                  ? 'بعد تحويل المبلغ، ارفع سكرين شوت للمعاملة هنا (إجباري) ⚠️'
                                  : 'After transferring, upload a screenshot of the transaction here (required) ⚠️'}
                              </p>
                              
                              <div className="w-full">
                                <ImageUpload
                                  value={receiptUrl}
                                  onChange={setReceiptUrl}
                                  placeholder={isRTL ? '📸 اضغط لرفع صورة الإيصال' : '📸 Click to upload receipt'}
                                  bucket="uploads"
                                  folder="receipts"
                                  className="mb-3 w-full"
                                />
                              </div>

                              {receiptUrl && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-lg"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-primary">
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
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#20bd5a] transition-colors w-full sm:w-auto justify-center sm:justify-start"
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
                      </motion.div>
                    )}

                    {/* Paymob info */}
                    {paymentMethod === 'paymob' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-foreground text-sm sm:text-base">
                            {isRTL ? 'دفع آمن عبر الإنترنت' : 'Secure Online Payment'}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {isRTL 
                            ? 'سيتم تحويلك لصفحة الدفع الآمنة لإتمام العملية عبر فيزا أو ماستركارد أو محفظة إلكترونية'
                            : 'You will be redirected to a secure payment page to complete via Visa, Mastercard, or Mobile Wallet'}
                        </p>
                      </motion.div>
                    )}

                    {/* Receipt required warning - only for manual methods */}
                    {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && !receiptUrl && (
                       <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
                       >
                         <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                         <p className="text-xs sm:text-sm text-destructive font-medium">
                           {isRTL 
                             ? 'يجب رفع صورة إيصال التحويل قبل تأكيد الطلب'
                             : 'You must upload the transfer receipt before confirming the order'}
                         </p>
                       </motion.div>
                     )}

                    <Separator />

                    <div className="flex gap-2 sm:gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        onClick={() => setStep('details')}
                      >
                        <PrevIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        {isRTL ? 'السابق' : 'Back'}
                      </Button>
                      {paymentMethod === 'paymob' ? (
                        <Button 
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base gap-2"
                          size="lg"
                          onClick={handlePaymobPayment}
                          disabled={paymobLoading}
                        >
                          {paymobLoading 
                            ? (isRTL ? 'جارٍ التحويل...' : 'Redirecting...') 
                            : (isRTL ? 'ادفع الآن' : 'Pay Now')}
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                          size="lg"
                          onClick={() => placeOrder.mutate()}
                          disabled={placeOrder.isPending || ((paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && !receiptUrl)}
                        >
                          {placeOrder.isPending 
                            ? (isRTL ? 'جارٍ الإرسال...' : 'Processing...') 
                            : (isRTL ? 'تأكيد الطلب' : 'Confirm')}
                        </Button>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                      {paymentMethod === 'paymob'
                        ? (isRTL ? 'سيتم تحويلك لصفحة دفع آمنة من Paymob' : 'You will be redirected to a secure Paymob payment page')
                        : (isRTL ? 'بالضغط على تأكيد الطلب، ستتلقى اتصالاً للتأكيد' : 'By confirming, you will receive a call to confirm')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
