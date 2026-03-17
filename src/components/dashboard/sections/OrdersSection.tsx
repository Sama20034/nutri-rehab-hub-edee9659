import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  FileText,
  Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    name_ar: string | null;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string | null;
  created_at: string;
  shipping_address: string | null;
  phone: string | null;
  notes: string | null;
  order_items: OrderItem[];
}

interface OrdersSectionProps {
  isRTL: boolean;
  clientId: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; labelAr: string; labelEn: string; color: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
  },
  pending_payment: {
    icon: <Clock className="h-4 w-4" />,
    labelAr: 'في انتظار الدفع',
    labelEn: 'Pending Payment',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  },
  pending_verification: {
    icon: <Clock className="h-4 w-4" />,
    labelAr: 'في انتظار التحقق',
    labelEn: 'Pending Verification',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  confirmed: {
    icon: <CheckCircle className="h-4 w-4" />,
    labelAr: 'مؤكد',
    labelEn: 'Confirmed',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  shipped: {
    icon: <Truck className="h-4 w-4" />,
    labelAr: 'تم الشحن',
    labelEn: 'Shipped',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  delivered: {
    icon: <Package className="h-4 w-4" />,
    labelAr: 'تم التوصيل',
    labelEn: 'Delivered',
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    color: 'bg-red-500/10 text-red-600 border-red-500/20'
  }
};

// Progress steps for order tracking
const ORDER_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export const OrdersSection = ({ isRTL, clientId }: OrdersSectionProps) => {
  const queryClient = useQueryClient();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', clientId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['client-orders', clientId] });
      toast({
        title: isRTL ? 'تم إلغاء الطلب' : 'Order Cancelled',
        description: isRTL ? 'تم إلغاء طلبك بنجاح' : 'Your order has been cancelled successfully',
      });
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['client-orders', clientId],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, shipping_address, phone, notes')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch order items with product details
      const orderIds = ordersData?.map(o => o.id) || [];
      if (orderIds.length === 0) return [];

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('id, order_id, product_id, quantity, unit_price, product:products(name, name_ar, image_url)')
        .in('order_id', orderIds);

      const itemsMap = new Map<string, OrderItem[]>();
      itemsData?.forEach(item => {
        const orderId = (item as any).order_id;
        if (!itemsMap.has(orderId)) itemsMap.set(orderId, []);
        itemsMap.get(orderId)!.push({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          product: item.product as any
        });
      });

      return ordersData.map(order => ({
        ...order,
        order_items: itemsMap.get(order.id) || []
      })) as Order[];
    },
    enabled: !!clientId
  });

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  const getStepIndex = (status: string) => {
    const idx = ORDER_STEPS.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isRTL ? 'طلباتي' : 'My Orders'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL ? `${orders.length} طلب` : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isRTL 
                ? 'عندما تقوم بطلب منتجات من المتجر ستظهر هنا لمتابعة حالتها' 
                : 'When you place orders from the store, they will appear here for tracking'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status || 'pending');
            const isExpanded = expandedOrder === order.id;
            const currentStep = getStepIndex(order.status || 'pending');
            const isCancelled = order.status === 'cancelled';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">
                          {order.total_amount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                        <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                          {statusConfig.icon}
                          {isRTL ? statusConfig.labelAr : statusConfig.labelEn}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Quick product preview */}
                    {!isExpanded && order.order_items.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2 rtl:space-x-reverse">
                          {order.order_items.slice(0, 3).map((item) => (
                            <div 
                              key={item.id} 
                              className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                            >
                              {item.product?.image_url ? (
                                <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.order_items.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                              +{order.order_items.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isRTL 
                            ? `${order.order_items.length} منتج` 
                            : `${order.order_items.length} item${order.order_items.length !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="p-4 pt-0 space-y-4">
                          <Separator />

                          {/* Order Progress Tracker */}
                          {!isCancelled && (
                            <div className="py-3">
                              <div className="flex items-center justify-between relative">
                                {/* Progress line */}
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                                <div 
                                  className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                                  style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                                />

                                {ORDER_STEPS.map((step, idx) => {
                                  const stepConfig = STATUS_CONFIG[step];
                                  const isCompleted = idx <= currentStep;
                                  const isCurrent = idx === currentStep;

                                  return (
                                    <div key={step} className="flex flex-col items-center relative z-10">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted text-muted-foreground'
                                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                                        {stepConfig.icon}
                                      </div>
                                      <span className={`text-xs mt-2 font-medium ${
                                        isCompleted ? 'text-primary' : 'text-muted-foreground'
                                      }`}>
                                        {isRTL ? stepConfig.labelAr : stepConfig.labelEn}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {isCancelled && (
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-center">
                              <p className="text-sm text-red-600 font-medium">
                                {isRTL ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
                              </p>
                            </div>
                          )}

                          {/* Order Items */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {isRTL ? 'المنتجات' : 'Products'}
                            </h4>
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {item.product?.image_url ? (
                                    <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {isRTL 
                                      ? (item.product?.name_ar || item.product?.name || 'منتج')
                                      : (item.product?.name || 'Product')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {isRTL ? 'الكمية:' : 'Qty:'} {item.quantity} × {item.unit_price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                  </p>
                                </div>
                                <span className="font-semibold text-sm">
                                  {(item.quantity * item.unit_price).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping info */}
                          {order.shipping_address && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{isRTL ? 'العنوان:' : 'Address:'}</span>
                                  <span>{order.shipping_address}</span>
                                </div>
                                {order.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{isRTL ? 'التلفون:' : 'Phone:'}</span>
                                    <span dir="ltr">{order.phone}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
