import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
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
import FilterSidebar from "@/components/store/FilterSidebar";
import PromoBannerSlider from "@/components/store/PromoBannerSlider";
import ShopByCategories from "@/components/store/ShopByCategories";
import SortBar, { SortOption } from "@/components/store/SortBar";
import ProductGrid from "@/components/store/ProductGrid";
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
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();
  const isRTL = language === 'ar';
  
  // Force light theme on Store page
  useEffect(() => {
    setTheme('light');
    return () => {
      setTheme('dark'); // Restore dark theme when leaving
    };
  }, [setTheme]);
  
  const { guestCart, addToCart, updateQuantity, removeFromCart, isLoading: cartLoading } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter & Sort State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Read category from URL query params and apply filter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Find matching category in DB (check both EN and AR names)
      const fetchCategoryMatch = async () => {
        // First try to find exact match from subcategories
        const { data: subCats } = await supabase
          .from('store_categories')
          .select('name, name_ar')
          .eq('is_active', true)
          .not('parent_id', 'is', null);
        
        if (subCats) {
          // Find the subcategory that matches (either by name or name_ar)
          const matchedSub = subCats.find(
            c => c.name === categoryParam || c.name_ar === categoryParam
          );
          
          if (matchedSub) {
            // Use both EN and AR names for robust filtering
            const filterNames = [matchedSub.name, matchedSub.name_ar].filter(Boolean) as string[];
            setSelectedCategories(filterNames);
            // Scroll to products section
            setTimeout(() => {
              document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return;
          }
        }
        
        // Fallback: use the param directly
        setSelectedCategories([categoryParam]);
        setTimeout(() => {
          document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      };
      
      fetchCategoryMatch();
    }
  }, [searchParams]);

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

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = products
      .map(p => p.category)
      .filter((c): c is string => c !== null && c !== '');
    return [...new Set(cats)];
  }, [products]);

  // Calculate max price
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 50000;
    return Math.max(...products.map(p => p.price), 50000);
  }, [products]);

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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.name_ar?.toLowerCase().includes(searchLower)) ||
        (product.description?.toLowerCase().includes(searchLower)) ||
        (product.description_ar?.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => 
        product.category && selectedCategories.includes(product.category)
      );
    }

    // Price range filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Stock filter
    if (inStockOnly) {
      result = result.filter(product => 
        product.stock_quantity === null || product.stock_quantity > 0
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // Already sorted by created_at desc
        break;
      case 'oldest':
        result = [...result].reverse();
        break;
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, inStockOnly, sortBy]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategories, priceRange, maxPrice, inStockOnly]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
    setSearchQuery("");
  };

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
      <div className={`light min-h-screen bg-background overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Subtle Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        {/* Compact Hero Section */}
        <div className="relative py-8 sm:py-12 border-b border-border/30">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {isRTL ? 'منتجات أصلية 100%' : '100% Original Products'}
                </span>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                <span className="text-foreground">
                  {isRTL ? 'احصل على ' : 'Get a '}
                </span>
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {isRTL ? 'خطة مجانية بعد أي طلب' : 'Free Plan with Any Order'}
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
                {isRTL 
                  ? 'مكملات غذائية عالية الجودة مختارة بعناية لدعم رحلتك' 
                  : 'Premium supplements carefully selected to support your journey'}
              </p>
              
              {/* Search Bar */}
              <motion.div 
                className="relative max-w-lg mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="relative flex items-center">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
                    <Input
                      type="text"
                      placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search for products...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`h-11 text-sm bg-card/80 backdrop-blur-sm border-border/50 rounded-xl ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Promo Banner Slider - Top */}
        <PromoBannerSlider isRTL={isRTL} position="top" />

        {/* Second Promo Banner Slider - Bottom */}
        <PromoBannerSlider isRTL={isRTL} position="bottom" />

        {/* Shop By Categories */}
        <ShopByCategories 
          isRTL={isRTL} 
          onCategorySelect={async (categoryId) => {
            // Fetch subcategories of this main category with both names
            const { data: subcategories } = await supabase
              .from('store_categories')
              .select('name, name_ar')
              .eq('parent_id', categoryId)
              .eq('is_active', true);
            
            if (subcategories && subcategories.length > 0) {
              // Use both EN and AR names for filtering (to match any stored category format)
              const subNames = subcategories.flatMap(sub => [
                sub.name,
                sub.name_ar
              ].filter(Boolean) as string[]);
              setSelectedCategories(subNames);
            } else {
              // If no subcategories, use main category name
              const { data: mainCat } = await supabase
                .from('store_categories')
                .select('name, name_ar')
                .eq('id', categoryId)
                .single();
              
              if (mainCat) {
                setSelectedCategories([mainCat.name, mainCat.name_ar].filter(Boolean) as string[]);
              }
            }
          }} 
        />

        {/* Main Content */}
        <div id="products-section" className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
          {/* Products Area - Full Width */}
          <div className="w-full space-y-5">
            {/* Top Bar: Filters + Cart */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterSidebar
                isRTL={isRTL}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceRangeChange={setPriceRange}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                onReset={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
              />
              
              {/* Cart Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => setShowCart(true)}
                  className="relative gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-semibold text-sm">{isRTL ? 'السلة' : 'Cart'}</span>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Sort Bar */}
            <SortBar
              isRTL={isRTL}
              productCount={filteredProducts.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Special Offer Banner */}
            <motion.div 
              className="relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 rounded-xl" />
              <div className="relative p-4 sm:p-5 rounded-xl border border-primary/20 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-lg shadow-primary/30"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Gift className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-0.5 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      {isRTL ? 'عرض حصري!' : 'Exclusive Offer!'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
                      <Badge className="bg-primary text-primary-foreground border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        {isRTL ? 'مؤهل!' : 'Eligible!'}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <div id="products-grid">
              <ProductGrid
                products={filteredProducts}
                isLoading={loadingProducts}
                isRTL={isRTL}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                cartLoading={cartLoading}
              />
            </div>

            {/* Features Section */}
            <motion.div 
              className="mt-12 py-10 rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-primary/10 border border-accent/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
                {/* Money Back */}
                <motion.div 
                  className="flex flex-col items-center text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                    {isRTL ? 'استرداد الأموال' : 'Money Back'}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isRTL ? 'ضمان استرداد خلال 30 يوم' : '30 days money back guarantee'}
                  </p>
                </motion.div>

                {/* Free Consultation */}
                <motion.div 
                  className="flex flex-col items-center text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                    {isRTL ? 'استشارة مجانية' : 'Free Consultation'} 💊
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isRTL ? 'استشارة مجانية من أطبائنا' : 'Free consultation from doctors'}
                  </p>
                </motion.div>

                {/* Fast Delivery */}
                <motion.div 
                  className="flex flex-col items-center text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                    {isRTL ? 'توصيل سريع' : 'Fast Delivery'}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isRTL ? 'سوف تحصل على طلبك بسرعة' : 'You will get your order earlier'}
                  </p>
                </motion.div>

                {/* Online Support */}
                <motion.div 
                  className="flex flex-col items-center text-center group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-secondary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                    {isRTL ? 'دعم أونلاين' : 'Online Support'}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isRTL ? 'متواجدون دائماً لمساعدتك' : "We're always available to help you"}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
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
