import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageSliderProps {
  images: string[];
  mainImage?: string | null;
  productName: string;
  size?: 'small' | 'medium' | 'large' | 'featured';
  className?: string;
}

const ProductImageSlider = ({
  images,
  mainImage,
  productName,
  size = 'medium',
  className
}: ProductImageSliderProps) => {
  // Combine main image with additional images
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...images.filter(img => img !== mainImage)
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const hasMultipleImages = allImages.length > 1;

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (allImages.length === 0) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-muted/80 to-muted/50", className)}>
        <Package className={`${size === 'featured' ? 'h-20 w-20' : 'h-12 w-12'} text-muted-foreground/20`} />
      </div>
    );
  }

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={allImages[currentIndex]}
          alt={`${productName} - ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Navigation Arrows - Only show on hover and if multiple images */}
      {hasMultipleImages && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            onClick={goToPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-background transition-colors z-10"
          >
            <ChevronLeft className="h-3 w-3 text-foreground" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-background transition-colors z-10"
          >
            <ChevronRight className="h-3 w-3 text-foreground" />
          </motion.button>
        </>
      )}

      {/* Dot Indicators - Always visible if multiple images */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                index === currentIndex
                  ? "bg-primary w-4"
                  : "bg-background/60 backdrop-blur-sm hover:bg-background/80"
              )}
            />
          ))}
        </div>
      )}

      {/* Image Counter Badge */}
      {hasMultipleImages && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground z-10">
          {currentIndex + 1}/{allImages.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
