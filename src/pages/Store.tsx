import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useCart, GuestCartItem } from "@/hooks/useCart";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import ProductShowcase from "@/components/store/ProductShowcase";
import { 
  ShoppingCart, 
  Package, 
  Play, 
  Users, 
  Stethoscope,
  Plus,
  Minus,
  Gift,
  CheckCircle,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  
  const { guestCart, addToCart, updateQuantity, removeFromCart, isLoading: cartLoading } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch cart items from database for logged-in users
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
  const loadingCart = user ? loadingDbCart : false;

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grantsAccess = cartTotal >= 7500;

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.name_ar?.toLowerCase().includes(searchLower)) ||
      (product.description?.toLowerCase().includes(searchLower)) ||
      (product.description_ar?.toLowerCase().includes(searchLower))
    );
  });

  const handleAddToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await addToCart(product);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await updateQuantity(itemId, quantity);
  };

  const handleRemoveFromCart = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className={`min-h-screen bg-background overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Hero Section */}
        <div className="relative py-12 sm:py-20 md:py-28 overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-20 left-10 text-primary/20"
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>
            <motion.div 
              className="absolute top-32 right-20 text-secondary/20"
              animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="w-16 h-16" />
            </motion.div>
            <motion.div 
              className="absolute bottom-20 left-1/4 text-primary/10"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {isRTL ? 'منتجات أصلية 100%' : '100% Original Products'}
                </span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                <span className="text-foreground">
                  {isRTL ? 'اكتشف ' : 'Discover '}
                </span>
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {isRTL ? 'خطة مجانية بعد أي طلب يتخطى ٧٥٠٠ج' : 'Free Plan with Orders Over 7,500 EGP'}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
                {isRTL 
                  ? 'مكملات غذائية عالية الجودة مختارة بعناية لدعم رحلتك نحو حياة صحية أفضل' 
                  : 'Premium quality supplements carefully selected to support your journey to a healthier life'}
              </p>
              
              {/* Search Bar */}
              <motion.div 
                className="relative max-w-2xl mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                  <div className="relative flex items-center">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-5' : 'left-5'}`} />
                    <Input
                      type="text"
                      placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search for products...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`h-14 sm:h-16 text-base sm:text-lg bg-card/80 backdrop-blur-xl border-border/50 rounded-xl ${isRTL ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12 sm:pb-20 relative z-10">
          {/* Stats & Cart Row */}
          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {filteredProducts.length} {isRTL ? 'منتج' : 'Products'}
                </span>
              </div>
            </div>
            
            {/* Cart Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => setShowCart(true)}
                className="relative gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="font-semibold">{isRTL ? 'السلة' : 'Cart'}</span>
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg"
                  >
                    {cartCount}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Special Offer Banner */}
          <motion.div 
            className="mb-10 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.2),transparent_50%)]" />
            <div className="relative p-6 sm:p-8 rounded-2xl border border-primary/20 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <motion.div 
                  className="p-4 bg-gradient-to-br from-primary to-primary/60 rounded-2xl shadow-lg shadow-primary/30"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Gift className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-secondary" />
                    {isRTL ? 'عرض حصري!' : 'Exclusive Offer!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL 
                      ? 'اشتري بـ 7,500 ج.م أو أكثر واحصل على وصول مجاني للمحتوى الغذائي!'
                      : 'Buy 7,500 EGP+ and get FREE access to nutritional content!'}
                  </p>
                </div>
                {grantsAccess && cartTotal > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Badge className="bg-primary text-primary-foreground border-0 px-5 py-2.5 text-sm font-semibold shadow-lg">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isRTL ? 'مؤهل!' : 'Eligible!'}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Products Showcase */}
          <ProductShowcase
            products={filteredProducts}
            isLoading={loadingProducts}
            isRTL={isRTL}
            onProductClick={setSelectedProduct}
            onAddToCart={handleAddToCart}
            cartLoading={cartLoading}
            searchQuery={searchQuery}
          />
        </div>

        {/* Product Details Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {isRTL ? selectedProduct.name_ar || selectedProduct.name : selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Image/Video */}
                  {selectedProduct.video_url ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <iframe
                        src={selectedProduct.video_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : selectedProduct.image_url ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={selectedProduct.image_url} 
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                    </div>
                  ) : null}

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
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
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {isRTL ? 'طريقة الاستخدام' : 'Usage Instructions'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL ? selectedProduct.usage_instructions_ar || selectedProduct.usage_instructions : selectedProduct.usage_instructions}
                      </p>
                    </div>
                  )}

                  {/* Suitable For */}
                  {(selectedProduct.suitable_for || selectedProduct.suitable_for_ar) && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        {isRTL ? 'يناسب' : 'Suitable For'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL ? selectedProduct.suitable_for_ar || selectedProduct.suitable_for : selectedProduct.suitable_for}
                      </p>
                    </div>
                  )}

                  {/* Medical Warning */}
                  {selectedProduct.medical_followup_required && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                      <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        {isRTL ? 'يتطلب متابعة طبية' : 'Medical Follow-up Required'}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {isRTL ? selectedProduct.medical_followup_notes_ar || selectedProduct.medical_followup_notes : selectedProduct.medical_followup_notes}
                      </p>
                    </div>
                  )}

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div>
                      <span className="text-sm text-muted-foreground">{isRTL ? 'السعر' : 'Price'}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {selectedProduct.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">{isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 gap-2"
                        onClick={(e) => {
                          handleAddToCart(selectedProduct, e);
                          setSelectedProduct(null);
                        }}
                        disabled={cartLoading}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">{isRTL ? 'أضف للسلة' : 'Add to Cart'}</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-lg max-h-[90vh] rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingCart ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isRTL ? 'أضف منتجات للبدء' : 'Add products to get started'}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCart(false)}
                      className="rounded-xl gap-2"
                    >
                      <ArrowRight className={`h-4 w-4 ${isRTL ? '' : 'rotate-180'}`} />
                      {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item, index) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.product.image_url ? (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                              {isRTL ? item.product.name_ar || item.product.name : item.product.name}
                            </h4>
                            <p className="text-sm text-primary font-bold mt-1">
                              {item.product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button 
                                size="icon" 
                                variant="outline"
                                className="h-7 w-7 rounded-lg"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || cartLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button 
                                size="icon" 
                                variant="outline"
                                className="h-7 w-7 rounded-lg"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={cartLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                            onClick={() => handleRemoveFromCart(item.id)}
                            disabled={cartLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-border/50 bg-gradient-to-r from-muted/30 to-transparent space-y-4">
                  {/* Access Badge */}
                  {grantsAccess && (
                    <motion.div 
                      className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        {isRTL ? 'مؤهل للوصول المجاني للمحتوى!' : 'Eligible for free content access!'}
                      </span>
                    </motion.div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 text-lg font-semibold gap-2"
                      onClick={handleCheckout}
                    >
                      {isRTL ? 'إتمام الشراء' : 'Checkout'}
                      <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </Layout>
  );
};

export default Store;
