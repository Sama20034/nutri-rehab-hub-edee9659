import { motion } from "framer-motion";
import { ArrowUpDown, Package, Grid3X3, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface SortBarProps {
  isRTL: boolean;
  productCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SortBar = ({
  isRTL,
  productCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}: SortBarProps) => {
  const sortOptions: { value: SortOption; label: { ar: string; en: string } }[] = [
    { value: 'newest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'oldest', label: { ar: 'الأقدم', en: 'Oldest' } },
    { value: 'price-asc', label: { ar: 'السعر: من الأقل للأعلى', en: 'Price: Low to High' } },
    { value: 'price-desc', label: { ar: 'السعر: من الأعلى للأقل', en: 'Price: High to Low' } },
    { value: 'name-asc', label: { ar: 'الاسم: أ - ي', en: 'Name: A - Z' } },
    { value: 'name-desc', label: { ar: 'الاسم: ي - أ', en: 'Name: Z - A' } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/40"
    >
      {/* Product Count */}
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {productCount} {isRTL ? 'منتج' : productCount === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px] sm:w-[220px] h-10 rounded-lg bg-background border-border/50 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={isRTL ? 'ترتيب حسب' : 'Sort by'} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {sortOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-muted/50"
              >
                {isRTL ? option.label.ar : option.label.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle - Desktop Only */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/30">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SortBar;
