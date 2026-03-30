import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import logo from '@/assets/logo.png';

const OrderSuccess = () => {
  const { isRTL } = useLanguage();
  const location = useLocation();
  const { trackPurchase } = useFacebookPixel();
  const orderId = location.state?.orderId;
  const governorate = location.state?.governorate;

  useEffect(() => {
    if (orderId) {
      trackPurchase(0, 'EGP', orderId);
    }
  }, [orderId, trackPurchase]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="NutriRehab" className="h-14 w-auto" />
          <span className="text-2xl font-bold text-gradient">NutriRehab</span>
        </Link>

        <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border shadow-elevated text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isRTL ? 'تم استلام طلبك بنجاح!' : 'Order Received Successfully!'}
          </h1>

          <p className="text-muted-foreground mb-4">
            {isRTL
              ? 'شكراً لك! سنتواصل معك قريباً لتأكيد الطلب.'
              : 'Thank you! We will contact you soon to confirm your order.'}
          </p>

          {orderId && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'رقم الطلب' : 'Order ID'}
              </p>
              <p className="font-mono text-sm font-semibold text-foreground mt-1">
                {orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          {governorate && (
            <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'مدة التوصيل المتوقعة' : 'Expected Delivery'}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {isRTL ? 'من 3 إلى 4 أيام عمل' : '3-4 business days'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/store" className="block">
              <Button variant="hero" className="w-full">
                <ShoppingBag className="h-5 w-5" />
                {isRTL ? 'تسوق المزيد' : 'Continue Shopping'}
              </Button>
            </Link>

            <Link to="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                <LayoutDashboard className="h-4 w-4" />
                {isRTL ? 'متابعة طلبي' : 'Track My Order'}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
