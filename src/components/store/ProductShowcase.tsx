import { motion } from "framer-motion";
import { Package, Sparkles, TrendingUp, Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ProductShowcaseProps {
  products: Product[];
  isLoading: boolean;
  isRTL: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  cartLoading: boolean;
  searchQuery: string;
}

const ProductShowcase = ({
  products,
  isLoading,
  isRTL,
  onProductClick,
  onAddToCart,
  cartLoading,
  searchQuery
}: ProductShowcaseProps) => {
  // All products now have consistent size for uniform grid
  const getProductSize = (): 'small' | 'medium' | 'large' | 'featured' => {
    return 'medium'; // Uniform size for all products
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`${i === 1 ? 'col-span-2 row-span-2' : ''} rounded-3xl overflow-hidden bg-card/50 border border-border/30`}>
            <Skeleton className={`${i === 1 ? 'h-80' : 'h-52'} w-full`} />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div 
        className="text-center py-24"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50">
            <Package className="h-14 w-14 text-muted-foreground/30" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          {searchQuery 
            ? (isRTL ? 'لا توجد نتائج' : 'No results found')
            : (isRTL ? 'لا توجد منتجات حالياً' : 'No products available')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {searchQuery 
            ? (isRTL ? 'جرب البحث بكلمات أخرى أو تصفح جميع المنتجات' : 'Try different search terms or browse all products')
            : (isRTL ? 'سيتم إضافة منتجات رائعة قريباً، ترقبوا!' : 'Amazing products coming soon, stay tuned!')}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {isRTL ? 'منتجاتنا' : 'Our Products'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? `${products.length} منتج متاح` : `${products.length} products available`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Uniform Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isRTL={isRTL}
            size={getProductSize()}
            index={index}
            onAddToCart={onAddToCart}
            onClick={() => onProductClick(product)}
            isLoading={cartLoading}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      {products.length > 4 && (
        <motion.div 
          className="text-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'جميع المنتجات أصلية ومضمونة' : 'All products are original and guaranteed'}
            </span>
            <Zap className="h-4 w-4 text-secondary" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductShowcase;
