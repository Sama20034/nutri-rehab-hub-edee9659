import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoBannerSliderProps {
  isRTL: boolean;
}

// Placeholder promo images - these can be managed from admin later
const promoImages = [
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&q=80"
];

const PromoBannerSlider = ({ isRTL }: PromoBannerSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promoImages.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promoImages.length) % promoImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div 
        className="relative w-full max-w-4xl mx-auto"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Slider Container */}
        <div className="relative aspect-[2.5/1] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50 border border-border/30 shadow-xl shadow-black/5">
          {/* Images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={promoImages[currentIndex]}
              alt={`Promo ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Navigation Arrows */}
          <motion.button
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : (isRTL ? 10 : -10) }}
            transition={{ duration: 0.2 }}
            onClick={goToPrev}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background transition-colors z-10",
              isRTL ? "right-3 sm:right-4" : "left-3 sm:left-4"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4 sm:h-5 sm:w-5 text-foreground", isRTL && "rotate-180")} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
            animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : (isRTL ? -10 : 10) }}
            transition={{ duration: 0.2 }}
            onClick={goToNext}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background transition-colors z-10",
              isRTL ? "left-3 sm:left-4" : "right-3 sm:right-4"
            )}
          >
            <ChevronRight className={cn("h-4 w-4 sm:h-5 sm:w-5 text-foreground", isRTL && "rotate-180")} />
          </motion.button>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {promoImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 shadow-sm",
                  index === currentIndex
                    ? "bg-primary w-5 sm:w-6"
                    : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
                )}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground z-10">
            {currentIndex + 1}/{promoImages.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
