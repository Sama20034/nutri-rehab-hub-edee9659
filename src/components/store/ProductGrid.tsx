import { motion } from "framer-motion";
import { Package, Sparkles, Zap, Play, Stethoscope, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  video_url: string | null;
  medical_followup_required: boolean | null;
  category: string | null;
  stock_quantity: number | null;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isRTL: boolean;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  cartLoading: boolean;
}

const ProductGrid = ({
  products,
  isLoading,
  isRTL,
  viewMode,
  onAddToCart,
  cartLoading
}: ProductGridProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-card/50 border border-border/30">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {isRTL ? 'لا توجد منتجات' : 'No products found'}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isRTL ? 'جرب تغيير الفلاتر أو البحث بكلمات أخرى' : 'Try adjusting filters or search with different terms'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid/List View */}
      <div className={`grid gap-4 sm:gap-5 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`group relative rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-all duration-300 cursor-pointer ${
              viewMode === 'list' ? 'flex' : ''
            }`}
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {/* Hover Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10" />
            
            {/* Image */}
            <div className={`relative overflow-hidden ${
              viewMode === 'list' ? 'w-40 sm:w-48 flex-shrink-0' : 'aspect-[4/3]'
            }`}>
              {product.image_url ? (
                <motion.img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <div className="w-full h-full min-h-[160px] flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Package className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              
              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <div className="flex gap-2 flex-wrap">
                  {product.video_url && (
                    <Badge className="gap-1 bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-md text-xs">
                      <Play className="h-3 w-3" />
                      {isRTL ? 'فيديو' : 'Video'}
                    </Badge>
                  )}
                  {(product.stock_quantity === 0) && (
                    <Badge variant="destructive" className="shadow-md text-xs">
                      {isRTL ? 'نفذ' : 'Out of Stock'}
                    </Badge>
                  )}
                </div>
                {product.medical_followup_required && (
                  <Badge variant="destructive" className="gap-1 shadow-md text-xs">
                    <Stethoscope className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
              {/* Category */}
              {product.category && (
                <span className="text-[11px] font-medium text-primary uppercase tracking-wider mb-1">
                  {product.category}
                </span>
              )}
              
              {/* Name */}
              <h3 className="font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {isRTL ? product.name_ar || product.name : product.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                {isRTL ? product.description_ar || product.description : product.description}
              </p>
              
              {/* Price & Action */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-110 transition-all"
                  onClick={(e) => onAddToCart(product, e)}
                  disabled={cartLoading || product.stock_quantity === 0}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Guarantee */}
      {products.length > 3 && (
        <motion.div 
          className="text-center pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
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

export default ProductGrid;
