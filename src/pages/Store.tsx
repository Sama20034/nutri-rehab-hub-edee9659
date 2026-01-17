import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Package, 
  Play, 
  AlertTriangle, 
  Users, 
  Stethoscope,
  Plus,
  Minus,
  Trash2,
  Gift,
  CheckCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  video_url: string | null;
  usage_instructions: string | null;
  usage_instructions_ar: string | null;
  suitable_for: string | null;
  suitable_for_ar: string | null;
  medical_followup_required: boolean | null;
  medical_followup_notes: string | null;
  medical_followup_notes_ar: string | null;
  category: string | null;
  stock_quantity: number | null;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

const Store = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shipping_address: '',
    phone: '',
    notes: ''
  });

  // Fetch products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: loadingCart } = useQuery({
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

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');
      
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(isRTL ? 'تمت الإضافة للسلة' : 'Added to cart');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update cart quantity
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  // Remove from cart
  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(isRTL ? 'تم الحذف من السلة' : 'Removed from cart');
    }
  });

  // Place order
  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('يجب تسجيل الدخول');
      if (cartItems.length === 0) throw new Error('السلة فارغة');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          shipping_address: checkoutData.shipping_address,
          phone: checkoutData.phone,
          notes: checkoutData.notes,
          status: 'pending'
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
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setShowCheckout(false);
      setShowCart(false);
      toast.success(
        isRTL 
          ? `تم إنشاء الطلب بنجاح! ${order.grants_content_access ? '🎉 حصلت على وصول مجاني للمحتوى الغذائي' : ''}`
          : `Order placed successfully! ${order.grants_content_access ? '🎉 You got free access to nutritional content' : ''}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <Layout>
      <div className={`min-h-screen bg-background py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                {isRTL ? 'متجر المكملات الغذائية' : 'Supplements Store'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isRTL ? 'مكملات غذائية عالية الجودة مع متابعة طبية' : 'High-quality supplements with medical follow-up'}
              </p>
            </div>

            {user && (
              <Button 
                onClick={() => setShowCart(true)}
                variant="outline"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {isRTL ? 'السلة' : 'Cart'}
                </span>
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Access Promotion Banner */}
          <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {isRTL ? '🎉 عرض خاص!' : '🎉 Special Offer!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL 
                      ? 'عند شراء منتجات بقيمة 7,500 ج.م أو أكثر، احصل على وصول مجاني كامل للمحتوى الغذائي والوصفات!'
                      : 'Purchase products worth 7,500 EGP or more and get FREE full access to nutritional content and recipes!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? 'لا توجد منتجات حالياً' : 'No products available'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? 'سيتم إضافة منتجات قريباً' : 'Products will be added soon'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <Card 
                  key={product.id} 
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {product.video_url && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="gap-1">
                          <Play className="h-3 w-3" />
                          {isRTL ? 'فيديو' : 'Video'}
                        </Badge>
                      </div>
                    )}
                    {product.medical_followup_required && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="gap-1">
                          <Stethoscope className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {product.name}
                    </h3>
                    {product.name_ar && (
                      <p className="text-sm text-muted-foreground mb-2">{product.name_ar}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {isRTL ? product.description_ar || product.description : product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
                            return;
                          }
                          addToCart.mutate(product.id);
                        }}
                        disabled={addToCart.isPending}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                  {selectedProduct.name_ar && (
                    <p className="text-lg text-muted-foreground">{selectedProduct.name_ar}</p>
                  )}
                </DialogHeader>

                <div className="space-y-6">
                  {/* Image/Video */}
                  {selectedProduct.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={selectedProduct.video_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : selectedProduct.image_url ? (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : null}

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      {isRTL ? 'الوصف' : 'Description'}
                    </h4>
                    <p className="text-muted-foreground">
                      {isRTL ? selectedProduct.description_ar || selectedProduct.description : selectedProduct.description}
                    </p>
                  </div>

                  {/* Usage Instructions */}
                  {(selectedProduct.usage_instructions || selectedProduct.usage_instructions_ar) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {isRTL ? 'طريقة الاستخدام' : 'Usage Instructions'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL ? selectedProduct.usage_instructions_ar || selectedProduct.usage_instructions : selectedProduct.usage_instructions}
                      </p>
                    </div>
                  )}

                  {/* Suitable For */}
                  {(selectedProduct.suitable_for || selectedProduct.suitable_for_ar) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        {isRTL ? 'يناسب' : 'Suitable For'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL ? selectedProduct.suitable_for_ar || selectedProduct.suitable_for : selectedProduct.suitable_for}
                      </p>
                    </div>
                  )}

                  {/* Medical Follow-up */}
                  {selectedProduct.medical_followup_required && (
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {isRTL ? 'يتطلب متابعة طبية' : 'Requires Medical Follow-up'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL 
                          ? selectedProduct.medical_followup_notes_ar || selectedProduct.medical_followup_notes 
                          : selectedProduct.medical_followup_notes}
                      </p>
                    </div>
                  )}

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">
                      {selectedProduct.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                    <Button 
                      size="lg"
                      onClick={() => {
                        if (!user) {
                          toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
                          return;
                        }
                        addToCart.mutate(selectedProduct.id);
                        setSelectedProduct(null);
                      }}
                      disabled={addToCart.isPending}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {isRTL ? 'أضف للسلة' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
              </DialogTitle>
            </DialogHeader>

            {loadingCart ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{item.product.name}</h4>
                      <p className="text-primary font-medium">{item.product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Cart Total */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                    <span className="font-bold text-primary">{cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                  </div>

                  {grantsAccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600">
                        <Gift className="h-5 w-5" />
                        <span className="font-medium">
                          {isRTL ? '🎉 ستحصل على وصول مجاني للمحتوى الغذائي!' : '🎉 You will get FREE access to nutritional content!'}
                        </span>
                      </div>
                    </div>
                  )}

                  {!grantsAccess && (
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? `أضف ${(7500 - cartTotal).toLocaleString()} ج.م للحصول على وصول مجاني للمحتوى`
                        : `Add ${(7500 - cartTotal).toLocaleString()} EGP more to get free content access`}
                    </p>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    {isRTL ? 'إتمام الطلب' : 'Proceed to Checkout'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'إتمام الطلب' : 'Checkout'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {isRTL ? 'عنوان الشحن' : 'Shipping Address'}
                </label>
                <Textarea
                  value={checkoutData.shipping_address}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, shipping_address: e.target.value }))}
                  placeholder={isRTL ? 'أدخل عنوان الشحن بالتفصيل...' : 'Enter detailed shipping address...'}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <Input
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={isRTL ? '01xxxxxxxxx' : '01xxxxxxxxx'}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  {isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                </label>
                <Textarea
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                  className="mt-1"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg mb-4">
                  <span className="font-semibold">{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="font-bold text-primary">{cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                </div>

                {grantsAccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Gift className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        {isRTL ? '🎉 ستحصل على وصول مجاني للمحتوى الغذائي!' : '🎉 You will get FREE access to nutritional content!'}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => placeOrder.mutate()}
                  disabled={placeOrder.isPending || !checkoutData.shipping_address || !checkoutData.phone}
                >
                  {placeOrder.isPending 
                    ? (isRTL ? 'جارٍ الإرسال...' : 'Processing...') 
                    : (isRTL ? 'تأكيد الطلب' : 'Confirm Order')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Store;
