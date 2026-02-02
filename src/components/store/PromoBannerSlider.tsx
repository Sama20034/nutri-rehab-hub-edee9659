import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PromoBanner {
  id: string;
  image_url: string;
  title: string | null;
  title_ar: string | null;
  link_url: string | null;
  display_order: number;
}

interface PromoBannerSliderProps {
  isRTL: boolean;
}

const PromoBannerSlider = ({ isRTL }: PromoBannerSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setBanners(data);
      }
      setIsLoading(false);
    };

    fetchBanners();
  }, []);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerClick = () => {
    const currentBanner = banners[currentIndex];
    if (!currentBanner?.link_url) return;

    const linkUrl = currentBanner.link_url;

    // Check if it's an external link
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Internal link - use navigate
      navigate(linkUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="w-full max-w-4xl mx-auto aspect-[2.5/1] sm:aspect-[3/1] rounded-2xl" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const hasLink = !!currentBanner?.link_url;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Slider Container */}
        <div 
          className={cn(
            "relative aspect-[2.5/1] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50 border border-border/30 shadow-xl shadow-black/5",
            hasLink && "cursor-pointer group"
          )}
          onClick={handleBannerClick}
        >
          {/* Images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentBanner?.image_url}
              alt={isRTL ? currentBanner?.title_ar || '' : currentBanner?.title || ''}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-transform duration-300",
                hasLink && "group-hover:scale-105"
              )}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Hover Overlay for clickable banners */}
          {hasLink && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          )}
        </div>

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "w-6 bg-primary" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoBannerSlider;
