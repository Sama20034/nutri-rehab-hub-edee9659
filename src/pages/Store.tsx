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
  CheckCircle,
  Search,
  Filter,
  Star
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
      <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                {isRTL ? 'متجر المكملات الغذائية' : 'Supplements Store'}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {isRTL 
                  ? 'مكملات غذائية عالية الجودة لدعم رحلتك الصحية' 
                  : 'Premium supplements to support your health journey'}
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
                <Input
                  type="text"
                  placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-14 text-lg bg-card border-border/50 rounded-2xl ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 -mt-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {filteredProducts.length} {isRTL ? 'منتج' : 'Products'}
              </span>
            </div>
            
            {/* Cart Button */}
            <Button 
              onClick={() => setShowCart(true)}
              variant="outline"
              size="lg"
              className="relative gap-2 rounded-xl border-border/50 bg-card/50 hover:bg-card"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{isRTL ? 'السلة' : 'Cart'}</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs bg-primary">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Special Offer Banner */}
          <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isRTL ? '🎉 عرض خاص!' : '🎉 Special Offer!'}
                </h3>
                <p className="text-muted-foreground">
                  {isRTL 
                    ? 'عند شراء منتجات بقيمة 7,500 ج.م أو أكثر، احصل على وصول مجاني للمحتوى الغذائي!'
                    : 'Buy products worth 7,500 EGP+ and get FREE access to nutritional content!'}
                </p>
              </div>
              {grantsAccess && cartTotal > 0 && (
                <Badge className="bg-primary/20 text-primary border-0 px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {isRTL ? 'مؤهل للعرض!' : 'Eligible!'}
                </Badge>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/50">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery 
                  ? (isRTL ? 'لا توجد نتائج' : 'No results found')
                  : (isRTL ? 'لا توجد منتجات حالياً' : 'No products available')}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? (isRTL ? 'جرب البحث بكلمات أخرى' : 'Try different search terms')
                  : (isRTL ? 'سيتم إضافة منتجات قريباً' : 'Products will be added soon')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Package className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                      {product.video_url && (
                        <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur-sm">
                          <Play className="h-3 w-3" />
                          {isRTL ? 'فيديو' : 'Video'}
                        </Badge>
                      )}
                      {product.medical_followup_required && (
                        <Badge variant="destructive" className="gap-1 bg-destructive/90 backdrop-blur-sm ml-auto">
                          <Stethoscope className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                      {isRTL ? product.name_ar || product.name : product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                      {isRTL ? product.description_ar || product.description : product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                      <Button 
                        size="icon"
                        className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={cartLoading}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {isRTL ? selectedProduct.name_ar || selectedProduct.name : selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
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
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-xl"
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
                    <div className="p-4 bg-muted/50 rounded-xl">
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
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        {isRTL ? 'يناسب' : 'Suitable For'}
                      </h4>
                      <p className="text-muted-foreground">
                        {isRTL ? selectedProduct.suitable_for_ar || selectedProduct.suitable_for : selectedProduct.suitable_for}
                      </p>
                    </div>
                  )}

                  {/* Medical Follow-up */}
                  {selectedProduct.medical_followup_required && (
                    <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
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
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-3xl font-bold text-primary">
                        {selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="text-lg text-muted-foreground ml-2">
                        {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={cartLoading}
                      className="gap-2 rounded-xl px-6"
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
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
              </DialogTitle>
            </DialogHeader>

            {loadingCart ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate text-sm">
                        {isRTL ? item.product.name_ar || item.product.name : item.product.name}
                      </h4>
                      <p className="text-primary font-bold">
                        {item.product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={cartLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={cartLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveFromCart(item.id)}
                        disabled={cartLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Cart Summary */}
                <div className="pt-4 border-t border-border space-y-3">
                  {grantsAccess && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl text-primary">
                      <Gift className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {isRTL ? '🎉 مؤهل للحصول على المحتوى المجاني!' : '🎉 Eligible for FREE content access!'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium text-muted-foreground">
                      {isRTL ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="font-bold text-foreground text-xl">
                      {cartTotal.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-xl text-base"
                    onClick={handleCheckout}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isRTL ? 'إتمام الشراء' : 'Proceed to Checkout'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Store;
