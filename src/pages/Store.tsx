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
  Star,
  Share2
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

// Star Rating Component
const StarRating = ({ rating = 4.5, count = 0 }: { rating?: number; count?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      <span className="text-amber-500 text-sm ml-1">({count})</span>
    </div>
  );
};

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
      <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {isRTL ? 'المنتجات' : 'Featured'}{' '}
                  <span className="text-amber-500">{isRTL ? 'المميزة' : 'Products'}</span>
                </h1>
                <p className="text-gray-500 mt-2">
                  {isRTL 
                    ? 'مكملات غذائية عالية الجودة لتحقيق أهدافك الرياضية' 
                    : 'High quality supplements to achieve your athletic goals'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="text"
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`h-10 w-48 md:w-64 bg-gray-50 border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                  />
                </div>
                
                {/* Cart Button */}
                <Button 
                  onClick={() => setShowCart(true)}
                  className="relative bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-10 px-4"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} hidden sm:inline`}>
                    {isRTL ? 'السلة' : 'Cart'}
                  </span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Special Offer Banner */}
          <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  {isRTL ? '🎉 عرض خاص!' : '🎉 Special Offer!'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isRTL 
                    ? 'عند شراء منتجات بقيمة 7,500 ج.م أو أكثر، احصل على وصول مجاني للمحتوى الغذائي!'
                    : 'Buy products worth 7,500 EGP+ and get FREE access to nutritional content!'}
                </p>
              </div>
              {grantsAccess && cartTotal > 0 && (
                <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {isRTL ? 'مؤهل!' : 'Eligible!'}
                </Badge>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
                  <Skeleton className="h-56 w-full bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                    <Skeleton className="h-5 w-3/4 bg-gray-100" />
                    <Skeleton className="h-5 w-20 bg-gray-100" />
                    <Skeleton className="h-10 w-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery 
                  ? (isRTL ? 'لا توجد نتائج' : 'No results found')
                  : (isRTL ? 'لا توجد منتجات حالياً' : 'No products available')}
              </h3>
              <p className="text-gray-500">
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
                  className="group rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Product Image Container */}
                  <div className="relative h-56 bg-gray-50 overflow-hidden p-4">
                    {/* Share Button */}
                    <button 
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share functionality
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    
                    {/* Badges */}
                    {product.medical_followup_required && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-1">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          {isRTL ? 'طبي' : 'Medical'}
                        </Badge>
                      </div>
                    )}
                    
                    {product.video_url && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-1">
                          <Play className="h-3 w-3 mr-1" />
                          {isRTL ? 'فيديو' : 'Video'}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Product Image */}
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-20 w-20 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4 border-t border-gray-100">
                    {/* Star Rating */}
                    <div className="flex justify-center mb-2">
                      <StarRating rating={4.5} count={Math.floor(Math.random() * 50) + 1} />
                    </div>
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 text-center mb-2 line-clamp-2 min-h-[2.5rem]">
                      {isRTL ? product.name_ar || product.name : product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="text-center mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        {isRTL ? 'ج.م' : 'LE'} {product.price.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-md transition-colors"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={cartLoading}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isRTL ? 'أضف للسلة' : 'ADD TO CART'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gray-900">
                    {isRTL ? selectedProduct.name_ar || selectedProduct.name : selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Image/Video */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedProduct.video_url ? (
                      <div className="aspect-video rounded-lg overflow-hidden">
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
                        className="w-full h-64 object-contain"
                      />
                    ) : null}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex justify-center">
                    <StarRating rating={4.5} count={Math.floor(Math.random() * 50) + 1} />
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      {isRTL ? 'الوصف' : 'Description'}
                    </h4>
                    <p className="text-gray-600">
                      {isRTL ? selectedProduct.description_ar || selectedProduct.description : selectedProduct.description}
                    </p>
                  </div>

                  {/* Usage Instructions */}
                  {(selectedProduct.usage_instructions || selectedProduct.usage_instructions_ar) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {isRTL ? 'طريقة الاستخدام' : 'Usage Instructions'}
                      </h4>
                      <p className="text-gray-600">
                        {isRTL ? selectedProduct.usage_instructions_ar || selectedProduct.usage_instructions : selectedProduct.usage_instructions}
                      </p>
                    </div>
                  )}

                  {/* Suitable For */}
                  {(selectedProduct.suitable_for || selectedProduct.suitable_for_ar) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        {isRTL ? 'يناسب' : 'Suitable For'}
                      </h4>
                      <p className="text-gray-600">
                        {isRTL ? selectedProduct.suitable_for_ar || selectedProduct.suitable_for : selectedProduct.suitable_for}
                      </p>
                    </div>
                  )}

                  {/* Medical Follow-up */}
                  {selectedProduct.medical_followup_required && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {isRTL ? 'يتطلب متابعة طبية' : 'Requires Medical Follow-up'}
                      </h4>
                      <p className="text-gray-600">
                        {isRTL 
                          ? selectedProduct.medical_followup_notes_ar || selectedProduct.medical_followup_notes 
                          : selectedProduct.medical_followup_notes}
                      </p>
                    </div>
                  )}

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {isRTL ? 'ج.م' : 'LE'} {selectedProduct.price.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-md"
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={cartLoading}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isRTL ? 'أضف للسلة' : 'ADD TO CART'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-lg bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                <ShoppingCart className="h-5 w-5 text-amber-500" />
                {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
              </DialogTitle>
            </DialogHeader>

            {loadingCart ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-20 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate text-sm">
                        {isRTL ? item.product.name_ar || item.product.name : item.product.name}
                      </h4>
                      <p className="text-amber-600 font-bold">
                        {isRTL ? 'ج.م' : 'LE'} {item.product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 rounded-md border-gray-200"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={cartLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 rounded-md border-gray-200"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={cartLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveFromCart(item.id)}
                        disabled={cartLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Cart Summary */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {grantsAccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700 border border-green-100">
                      <Gift className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {isRTL ? '🎉 مؤهل للحصول على المحتوى المجاني!' : '🎉 Eligible for FREE content access!'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium text-gray-600">
                      {isRTL ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="font-bold text-gray-900 text-xl">
                      {isRTL ? 'ج.م' : 'LE'} {cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold"
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
