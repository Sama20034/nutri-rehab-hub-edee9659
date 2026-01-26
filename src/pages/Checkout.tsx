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
  ChevronLeft
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
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCart, GuestCartItem } from '@/hooks/useCart';
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

type PaymentMethod = 'cash_on_delivery' | 'vodafone_cash' | 'instapay';

// Validation schema
const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  shipping_address: z.string().trim().min(10, 'Address must be at least 10 characters').max(500),
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
    description: 'Transfer to: 01012345678',
    description_ar: 'حول إلى: 01012345678',
    icon: Smartphone,
    color: 'text-red-500'
  },
  instapay: {
    id: 'instapay',
    name: 'InstaPay',
    name_ar: 'انستاباي',
    description: 'Transfer to: mahmoud.sayed@instapay',
    description_ar: 'حول إلى: mahmoud.sayed@instapay',
    icon: Wallet,
    color: 'text-blue-500'
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { guestCart, clearCart } = useCart();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [checkoutData, setCheckoutData] = useState({
    full_name: '',
    email: '',
    shipping_address: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch cart items for logged-in users
  const { data: dbCartItems = [], isLoading: loadingDbCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        product: item.product as unknown as Product
      })) as CartItem[];
    },
    enabled: !!user
  });

  // Use database cart for logged-in users, guest cart for guests
  const cartItems: (CartItem | GuestCartItem)[] = user ? dbCartItems : guestCart;
  const isLoading = user ? loadingDbCart : false;

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grantsAccess = cartTotal >= 7500;

  // Track if we've done the initial check
  const [hasCheckedCart, setHasCheckedCart] = useState(false);

  // Redirect if cart is empty (with delay to allow localStorage to load)
  useEffect(() => {
    // Give localStorage time to load for guest users
    const timer = setTimeout(() => {
      if (!isLoading && cartItems.length === 0 && hasCheckedCart) {
        toast.error(isRTL ? 'السلة فارغة' : 'Cart is empty');
        navigate('/store');
      }
      if (!hasCheckedCart) {
        setHasCheckedCart(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [cartItems, isLoading, navigate, isRTL, hasCheckedCart]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user?.email) {
      setCheckoutData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  // Validate form
  const validateForm = () => {
    try {
      // For logged-in users, email is optional (we have their user_id)
      const schemaToUse = user 
        ? checkoutSchema.extend({
            email: z.string().optional(),
            full_name: z.string().optional()
          })
        : checkoutSchema;
      
      schemaToUse.parse(checkoutData);
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

  // Place order mutation
  const placeOrder = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) throw new Error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      
      if (!validateForm()) {
        throw new Error(isRTL ? 'يرجى تصحيح الأخطاء' : 'Please fix the errors');
      }

      // Create order data
      const orderData: any = {
        total_amount: cartTotal,
        shipping_address: checkoutData.shipping_address,
        phone: checkoutData.phone,
        notes: checkoutData.notes 
          ? `${checkoutData.notes}\n\nPayment Method: ${PAYMENT_METHODS[paymentMethod].name}`
          : `Payment Method: ${PAYMENT_METHODS[paymentMethod].name}`,
        status: 'pending',
        grants_content_access: grantsAccess
      };

      // If user is logged in, include user_id
      if (user) {
        orderData.user_id = user.id;
      } else {
        // Guest order - store guest info in dedicated columns
        orderData.guest_name = checkoutData.full_name;
        orderData.guest_email = checkoutData.email;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      if (user) {
        const { error: clearError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (clearError) throw clearError;
      } else {
        clearCart();
      }

      return order;
    },
    onSuccess: () => {
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

  if (isLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => step === 'payment' ? setStep('details') : navigate('/store')}
            className="mb-4"
          >
            <BackIcon className="h-4 w-4 mr-2" />
            {step === 'payment' 
              ? (isRTL ? 'العودة للبيانات' : 'Back to Details')
              : (isRTL ? 'العودة للمتجر' : 'Back to Store')}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {isRTL ? 'إتمام الطلب' : 'Checkout'}
              </h1>
              <p className="text-muted-foreground">
                {step === 'details'
                  ? (isRTL ? 'الخطوة 1: أدخل بياناتك' : 'Step 1: Enter your details')
                  : (isRTL ? 'الخطوة 2: اختر طريقة الدفع' : 'Step 2: Choose payment method')}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                {step === 'payment' ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="hidden sm:inline font-medium">{isRTL ? 'البيانات' : 'Details'}</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">{isRTL ? 'الدفع' : 'Payment'}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={isRTL ? item.product.name_ar || item.product.name : item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {isRTL ? item.product.name_ar || item.product.name : item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'الكمية:' : 'Qty:'} {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {(item.product.price * item.quantity).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="font-bold text-primary text-xl">
                    {cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                {grantsAccess && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-primary/10 border border-primary/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3 text-primary">
                      <Gift className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {isRTL ? '🎉 هدية مجانية!' : '🎉 Free Gift!'}
                        </p>
                        <p className="text-sm opacity-90">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {isRTL ? 'بيانات الشحن' : 'Shipping Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Guest fields - only show if not logged in */}
                    {!user && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {isRTL ? 'الاسم الكامل' : 'Full Name'}
                            <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={checkoutData.full_name}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                            className={errors.full_name ? 'border-destructive' : ''}
                          />
                          {errors.full_name && (
                            <p className="text-sm text-destructive">{errors.full_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                            <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="email"
                            value={checkoutData.email}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="example@email.com"
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {isRTL ? 'عنوان الشحن' : 'Shipping Address'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        value={checkoutData.shipping_address}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, shipping_address: e.target.value }))}
                        placeholder={isRTL ? 'أدخل عنوان الشحن بالتفصيل (المدينة - الحي - الشارع - رقم المبنى)...' : 'Enter detailed shipping address (City - District - Street - Building)...'}
                        className={`min-h-[100px] ${errors.shipping_address ? 'border-destructive' : ''}`}
                      />
                      {errors.shipping_address && (
                        <p className="text-sm text-destructive">{errors.shipping_address}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01xxxxxxxxx"
                        type="tel"
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                      </label>
                      <Textarea
                        value={checkoutData.notes}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={isRTL ? 'أي ملاحظات إضافية للتوصيل...' : 'Any additional delivery notes...'}
                      />
                    </div>

                    <Separator />

                    <Button 
                      className="w-full h-12 text-base gap-2"
                      size="lg"
                      onClick={handleNextStep}
                    >
                      {isRTL ? 'التالي: اختر طريقة الدفع' : 'Next: Choose Payment Method'}
                      <NextIcon className="h-5 w-5" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="space-y-4"
                    >
                      {Object.values(PAYMENT_METHODS).map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                            <div className={`p-3 rounded-full bg-muted ${method.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="text-base font-semibold cursor-pointer">
                                {isRTL ? method.name_ar : method.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? method.description_ar : method.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {/* Payment Instructions */}
                    {paymentMethod !== 'cash_on_delivery' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-muted/50 rounded-xl border"
                      >
                        <h4 className="font-semibold text-foreground mb-2">
                          {isRTL ? '📝 تعليمات الدفع' : '📝 Payment Instructions'}
                        </h4>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                          {paymentMethod === 'vodafone_cash' ? (
                            <>
                              <li>{isRTL ? 'افتح تطبيق فودافون كاش' : 'Open Vodafone Cash app'}</li>
                              <li>{isRTL ? 'حول المبلغ إلى: 01012345678' : 'Transfer amount to: 01012345678'}</li>
                              <li>{isRTL ? 'احتفظ برقم العملية' : 'Keep the transaction number'}</li>
                              <li>{isRTL ? 'سنتواصل معك لتأكيد الطلب' : 'We will contact you to confirm'}</li>
                            </>
                          ) : (
                            <>
                              <li>{isRTL ? 'افتح تطبيق البنك الخاص بك' : 'Open your bank app'}</li>
                              <li>{isRTL ? 'اختر InstaPay' : 'Choose InstaPay'}</li>
                              <li>{isRTL ? 'حول المبلغ إلى: mahmoud.sayed@instapay' : 'Transfer to: mahmoud.sayed@instapay'}</li>
                              <li>{isRTL ? 'سنتواصل معك لتأكيد الطلب' : 'We will contact you to confirm'}</li>
                            </>
                          )}
                        </ol>
                      </motion.div>
                    )}

                    <Separator />

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={() => setStep('details')}
                      >
                        <PrevIcon className="h-5 w-5 mr-2" />
                        {isRTL ? 'السابق' : 'Previous'}
                      </Button>
                      <Button 
                        className="flex-1 h-12 text-base"
                        size="lg"
                        onClick={() => placeOrder.mutate()}
                        disabled={placeOrder.isPending}
                      >
                        {placeOrder.isPending 
                          ? (isRTL ? 'جارٍ إرسال الطلب...' : 'Processing...') 
                          : (isRTL ? 'تأكيد الطلب' : 'Confirm Order')}
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      {isRTL 
                        ? 'بالضغط على تأكيد الطلب، ستتلقى اتصالاً لتأكيد الطلب'
                        : 'By confirming, you will receive a call to confirm the order'}
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
