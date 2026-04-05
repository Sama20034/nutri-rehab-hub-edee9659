import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  image_url: string | null;
  parent_id: string | null;
}

interface ShopByCategoriesProps {
  isRTL: boolean;
}

const ShopByCategories = ({ isRTL }: ShopByCategoriesProps) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setCategories(data);
      }
      setIsLoading(false);
    };

    fetchCategories();
  }, []);

  const handleShopNow = (category: Category) => {
    navigate(`/store/category/${category.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          <span className="text-foreground">
            {isRTL ? 'تسوق حسب ' : 'Shop By '}
          </span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isRTL ? 'التصنيفات' : 'Categories'}
          </span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          {isRTL 
            ? 'جميع احتياجاتك التدريبية متوفرة بجودة عالية لتحقيق أهدافك الرياضية'
            : 'All your training essentials are provided in high quality to achieve your athletic goals'}
        </p>
      </motion.div>

      {/* Categories Grid */}
      <div className="space-y-4 sm:space-y-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => handleShopNow(category)}
          >
            {/* Background Image */}
            <div className="relative h-80 sm:h-64 lg:h-72 overflow-hidden">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={isRTL ? category.name_ar || category.name : category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Tag className="h-16 w-16 text-primary/30" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {isRTL ? category.name_ar || category.name : category.name}
              </h3>
              
              <Button 
                className="px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 group-hover:scale-105 shadow-lg shadow-primary/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShopNow(category);
                }}
              >
                <span className="flex items-center gap-2">
                  {isRTL ? 'تسوق الآن' : 'Shop Now'}
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </span>
              </Button>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-colors duration-300" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShopByCategories;
