import { useState, useEffect } from "react";
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Slider Container */}
        <div className="relative aspect-[2.5/1] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50 border border-border/30 shadow-xl shadow-black/5">
          {/* Images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={banners[currentIndex]?.image_url}
              alt={isRTL ? banners[currentIndex]?.title_ar || '' : banners[currentIndex]?.title || ''}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
