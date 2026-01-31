import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Play, Stethoscope, Plus, Star, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import ProductImageSlider from "./ProductImageSlider";

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
}

interface ProductCardProps {
  product: Product;
  isRTL: boolean;
  size?: 'small' | 'medium' | 'large' | 'featured';
  index: number;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onClick?: () => void;
  isLoading?: boolean;
}

const getYoutubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // If it's already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  return url;
};

const ProductCard = ({ 
  product, 
  isRTL, 
  size = 'medium', 
  index, 
  onAddToCart, 
  onClick,
  isLoading 
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Fetch additional images for this product
  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id)
        .order('display_order');
      
      if (data) {
        setAdditionalImages(data.map(img => img.image_url));
      }
    };
    fetchImages();
  }, [product.id]);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideo(true);
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-1 sm:col-span-1',
    large: 'col-span-1 sm:col-span-2 row-span-1',
    featured: 'col-span-2 row-span-2 sm:col-span-2'
  };

  const imageHeights = {
    small: 'h-32 sm:h-40',
    medium: 'h-40 sm:h-52',
    large: 'h-48 sm:h-64',
    featured: 'h-64 sm:h-80'
  };

  const isFeatured = size === 'featured' || size === 'large';
  const embedUrl = product.video_url ? getYoutubeEmbedUrl(product.video_url) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
        className={`group relative ${sizeClasses[size]}`}
        onClick={handleCardClick}
      >
        {/* Animated Border Gradient */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:blur-[2px]" />
        
        <div className={`relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border/30 hover:border-transparent transition-all duration-500 cursor-pointer ${isFeatured ? 'shadow-2xl shadow-primary/10' : ''}`}>
          {/* Image Container with Slider */}
          <div className={`relative ${imageHeights[size]} overflow-hidden`}>
            <ProductImageSlider
              images={additionalImages}
              mainImage={product.image_url}
              productName={product.name}
              size={size}
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
              <div className="flex gap-2 flex-wrap">
                {isFeatured && (
                  <Badge className="gap-1.5 bg-secondary/90 text-secondary-foreground border-0 shadow-lg backdrop-blur-sm">
                    <Flame className="h-3 w-3" />
                    <span className="text-xs font-bold">{isRTL ? 'مميز' : 'Hot'}</span>
                  </Badge>
                )}
                {product.video_url && (
                  <Badge 
                    className="gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-lg cursor-pointer hover:bg-primary transition-colors"
                    onClick={handleVideoClick}
                  >
                    <Play className="h-3 w-3" />
                    <span className="text-xs">{isRTL ? 'شاهد الفيديو' : 'Watch Video'}</span>
                  </Badge>
                )}
              </div>
              {product.medical_followup_required && (
                <Badge variant="destructive" className="gap-1 shadow-lg backdrop-blur-sm">
                  <Stethoscope className="h-3 w-3" />
                </Badge>
              )}
            </div>

            {/* Floating Action Button */}
            <motion.div 
              className={`absolute ${isFeatured ? 'bottom-6 right-6' : 'bottom-3 right-3'}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.08 + 0.3, type: "spring", stiffness: 200 }}
            >
              <Button 
                size="icon"
                className={`${isFeatured ? 'h-14 w-14' : 'h-11 w-11'} rounded-full bg-primary shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:scale-110 transition-all duration-300`}
                onClick={(e) => onAddToCart(product, e)}
                disabled={isLoading}
              >
                <Plus className={`${isFeatured ? 'h-6 w-6' : 'h-5 w-5'}`} />
              </Button>
            </motion.div>
          </div>
          
          {/* Content */}
          <div className={`relative ${isFeatured ? 'p-5 sm:p-6' : 'p-4'}`}>
            {/* Category Tag */}
            {product.category && (
              <span className="inline-block text-[10px] sm:text-xs font-medium text-primary/80 uppercase tracking-wider mb-1.5">
                {product.category}
              </span>
            )}
            
            <h3 className={`font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-300 ${isFeatured ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
              {isRTL ? product.name_ar || product.name : product.name}
            </h3>
            
            {(isFeatured || size === 'medium') && (
              <p className={`text-muted-foreground line-clamp-2 mb-3 ${isFeatured ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                {isRTL ? product.description_ar || product.description : product.description}
              </p>
            )}
            
            {/* Price */}
            <div className="flex items-end gap-2">
              <span className={`font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${isFeatured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mb-1">
                {isRTL ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Dialog */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              {isRTL ? product.name_ar || product.name : product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {embedUrl && (
              <iframe
                src={embedUrl}
                title={product.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
