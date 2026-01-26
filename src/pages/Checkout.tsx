import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Gift, ShoppingBag, MapPin, Phone, FileText, CreditCard } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
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

const Checkout = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';

  const [checkoutData, setCheckoutData] = useState({
    shipping_address: '',
    phone: '',
    notes: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      navigate('/auth');
    }
  }, [user, navigate, isRTL]);

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
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

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grantsAccess = cartTotal >= 7500;

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && user) {
      toast.error(isRTL ? 'السلة فارغة' : 'Cart is empty');
      navigate('/store');
    }
  }, [cartItems, isLoading, navigate, isRTL, user]);

  // Place order mutation
  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error(isRTL ? 'يجب تسجيل الدخول' : 'Please login');
      if (cartItems.length === 0) throw new Error(isRTL ? 'السلة فارغة' : 'Cart is empty');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          shipping_address: checkoutData.shipping_address,
          phone: checkoutData.phone,
          notes: checkoutData.notes,
          status: 'pending',
          grants_content_access: grantsAccess
        })
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
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearError) throw clearError;

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
            onClick={() => navigate('/store')}
            className="mb-4"
          >
            <BackIcon className="h-4 w-4 mr-2" />
            {isRTL ? 'العودة للمتجر' : 'Back to Store'}
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
                {isRTL ? 'أكمل بياناتك لإتمام الطلب' : 'Complete your details to place the order'}
              </p>
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

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
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
                    className="min-h-[100px]"
                  />
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
                  />
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
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={() => placeOrder.mutate()}
                  disabled={placeOrder.isPending || !checkoutData.shipping_address || !checkoutData.phone}
                >
                  {placeOrder.isPending 
                    ? (isRTL ? 'جارٍ إرسال الطلب...' : 'Processing Order...') 
                    : (isRTL ? 'تأكيد الطلب' : 'Confirm Order')}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {isRTL 
                    ? 'بالضغط على تأكيد الطلب، ستتلقى اتصالاً لتأكيد الطلب والدفع عند الاستلام'
                    : 'By confirming, you will receive a call to confirm the order and pay on delivery'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
