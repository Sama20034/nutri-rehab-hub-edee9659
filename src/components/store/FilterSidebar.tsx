import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Tag,
  DollarSign,
  CheckCircle,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterSidebarProps {
  isRTL: boolean;
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const FilterSidebar = ({
  isRTL,
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  maxPrice,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  onReset,
  activeFiltersCount
}: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    availability: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">
            {isRTL ? 'الفلاتر' : 'Filters'}
          </h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            {isRTL ? 'إعادة تعيين' : 'Reset'}
          </Button>
        )}
      </div>

      {/* Categories Section */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              {isRTL ? 'التصنيفات' : 'Categories'}
            </span>
          </div>
          {openSections.categories ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <AnimatePresence>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-foreground flex-1">{category}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {isRTL ? 'لا توجد تصنيفات' : 'No categories available'}
              </p>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range Section */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              {isRTL ? 'نطاق السعر' : 'Price Range'}
            </span>
          </div>
          {openSections.price ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              max={maxPrice}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">{isRTL ? 'من' : 'From'}: </span>
              <span className="font-semibold text-foreground">{priceRange[0].toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ms-1">{isRTL ? 'ج.م' : 'EGP'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">{isRTL ? 'إلى' : 'To'}: </span>
              <span className="font-semibold text-foreground">{priceRange[1].toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ms-1">{isRTL ? 'ج.م' : 'EGP'}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability Section */}
      <Collapsible open={openSections.availability} onOpenChange={() => toggleSection('availability')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              {isRTL ? 'التوفر' : 'Availability'}
            </span>
          </div>
          {openSections.availability ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onInStockChange(!inStockOnly)}
          >
            <Checkbox
              checked={inStockOnly}
              onCheckedChange={(checked) => onInStockChange(checked === true)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                {isRTL ? 'متوفر فقط' : 'In Stock Only'}
              </span>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <FilterContent />
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 h-11 px-4 rounded-xl border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <Filter className="h-4 w-4" />
              <span>{isRTL ? 'الفلاتر' : 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs ms-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side={isRTL ? "right" : "left"} 
            className="w-[85vw] sm:w-[350px] p-0 bg-card border-border/50"
          >
            <SheetHeader className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                {isRTL ? 'فلترة المنتجات' : 'Filter Products'}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] p-6">
              <FilterContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default FilterSidebar;
