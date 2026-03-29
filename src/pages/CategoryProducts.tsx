import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/hooks/useCart";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/store/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, ChevronLeft, ChevronRight, Store, Tag } from "lucide-react";

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

interface CategoryInfo {
  id: string;
  name: string;
  name_ar: string | null;
  image_url: string | null;
}

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { setTheme } = useTheme();
  const { addToCart } = useCart();
  const isRTL = language === 'ar';
  const [searchQuery, setSearchQuery] = useState("");

  // Force light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-switching', '');
    setTheme('light');
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.removeAttribute('data-theme-switching');
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.setAttribute('data-theme-switching', '');
      setTheme('dark');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.removeAttribute('data-theme-switching');
        });
      });
    };
  }, [setTheme]);

  // Fetch category info
  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_categories')
        .select('id, name, name_ar, image_url')
        .eq('id', categoryId!)
        .single();
      if (error) throw error;
      return data as CategoryInfo;
    },
    enabled: !!categoryId,
  });

  // Fetch subcategories
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_categories')
        .select('name, name_ar')
        .eq('parent_id', categoryId!)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId,
  });

  // Build list of category names to match products against
  const categoryNames = useMemo(() => {
    if (!category) return [];
    const names: string[] = [];
    // Add main category names
    if (category.name) names.push(category.name);
    if (category.name_ar) names.push(category.name_ar);
    // Add subcategory names
    subcategories.forEach(sub => {
      if (sub.name) names.push(sub.name);
      if (sub.name_ar) names.push(sub.name_ar);
    });
    return names;
  }, [category, subcategories]);

  // Fetch category products
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['category-products', categoryNames],
    queryFn: async () => {
      if (categoryNames.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .in('category', categoryNames)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: categoryNames.length > 0,
  });

  // Fetch suggested products from other categories
  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggested-products', categoryNames],
    queryFn: async () => {
      if (categoryNames.length === 0) return [];
      // Get products NOT in this category
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(6);
      
      // Exclude current category products
      for (const name of categoryNames) {
        query = query.neq('category', name);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: categoryNames.length > 0,
  });

  // Filter by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.name_ar?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.description_ar?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const categoryName = category
    ? (isRTL ? category.name_ar || category.name : category.name)
    : '';

  const handleAddToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await addToCart(product);
  };

  if (loadingCategory) {
    return (
      <Layout>
        <div className="light min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="light min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Tag className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">{isRTL ? 'التصنيف غير موجود' : 'Category not found'}</h2>
            <Button onClick={() => navigate('/store')}>
              {isRTL ? 'العودة للمتجر' : 'Back to Store'}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`light min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header with category image */}
        <div className="relative">
          {category.image_url ? (
            <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
              <img
                src={category.image_url}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/10 to-secondary/10" />
          )}

          {/* Overlay content */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 ${category.image_url ? 'text-white' : 'text-foreground'}`}>
            <div className="container mx-auto">
              {/* Breadcrumb */}
              <Breadcrumb className="mb-3">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/store" className={category.image_url ? 'text-white/80 hover:text-white' : ''}>
                        {isRTL ? 'المتجر' : 'Store'}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    {isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className={category.image_url ? 'text-white font-semibold' : 'font-semibold'}>
                      {categoryName}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/store')}
                  className={`${category.image_url ? 'text-white hover:bg-white/20' : 'hover:bg-muted'} rounded-full`}
                >
                  {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">{categoryName}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Search + product count */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? `${filteredProducts.length} منتج`
                : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
            </p>
            <div className="relative w-full sm:w-72">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={isRTL ? 'ابحث في هذا التصنيف...' : 'Search in this category...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-10 text-sm ${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div id="products-grid">
            <ProductGrid
              products={filteredProducts}
              isLoading={loadingProducts}
              viewMode="grid"
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Back to store button */}
          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Button variant="outline" onClick={() => navigate('/store')}>
                <Store className="h-4 w-4 mr-2" />
                {isRTL ? 'تصفح جميع المنتجات' : 'Browse All Products'}
              </Button>
            </div>
          )}

          {/* Suggestions section */}
          {suggestions.length > 0 && (
            <motion.div
              className="mt-12 pt-8 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {isRTL ? 'منتجات قد تعجبك' : 'You Might Also Like'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/store')}>
                  {isRTL ? 'عرض الكل' : 'View All'}
                  {isRTL ? <ArrowLeft className="h-4 w-4 mr-1" /> : <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
              <ProductGrid
                products={suggestions}
                isLoading={false}
                viewMode="grid"
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProducts;
