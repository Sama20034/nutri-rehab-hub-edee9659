import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Image as ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductImagesManagerProps {
  productId?: string;
  isRTL: boolean;
  onImagesChange?: (images: string[]) => void;
  initialImages?: string[];
}

const ProductImagesManager = ({
  productId,
  isRTL,
  onImagesChange,
  initialImages = []
}: ProductImagesManagerProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tempImages, setTempImages] = useState<string[]>(initialImages);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  };

  const handleAddImage = async (url: string) => {
    if (productId) {
      const { data, error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: url,
          display_order: images.length
        })
        .select()
        .single();

      if (error) {
        toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
      } else {
        setImages([...images, data]);
        toast({ title: isRTL ? 'تم بنجاح' : 'Success', description: isRTL ? 'تم إضافة الصورة' : 'Image added' });
      }
    } else {
      const newTempImages = [...tempImages, url];
      setTempImages(newTempImages);
      onImagesChange?.(newTempImages);
    }
  };

  const handleRemoveImage = async (imageId: string, index: number) => {
    if (productId) {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
      } else {
        setImages(images.filter(img => img.id !== imageId));
        toast({ title: isRTL ? 'تم بنجاح' : 'Success', description: isRTL ? 'تم حذف الصورة' : 'Image removed' });
      }
    } else {
      const newTempImages = tempImages.filter((_, i) => i !== index);
      setTempImages(newTempImages);
      onImagesChange?.(newTempImages);
    }
  };

  const handleMoveImage = async (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (productId) {
      const newImages = [...images];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      const reordered = newImages.map((img, i) => ({ ...img, display_order: i }));
      setImages(reordered);

      for (const img of reordered) {
        await supabase
          .from('product_images')
          .update({ display_order: img.display_order })
          .eq('id', img.id);
      }
    } else {
      const newTempImages = [...tempImages];
      [newTempImages[index], newTempImages[newIndex]] = [newTempImages[newIndex], newTempImages[index]];
      setTempImages(newTempImages);
      onImagesChange?.(newTempImages);
    }
  };

  const displayImages = productId ? images : tempImages.map((url, i) => ({ 
    id: `temp-${i}`, 
    image_url: url, 
    display_order: i 
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          {isRTL ? 'صور إضافية للمنتج' : 'Additional Product Images'}
        </label>
        <span className="text-xs text-muted-foreground">
          {displayImages.length} {isRTL ? 'صور' : 'images'}
        </span>
      </div>

      {displayImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {displayImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors">
                <img
                  src={image.image_url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Move Buttons */}
                <div className="absolute top-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-5 w-5 rounded"
                      onClick={() => handleMoveImage(index, 'left')}
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                  )}
                  {index < displayImages.length - 1 && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-5 w-5 rounded"
                      onClick={() => handleMoveImage(index, 'right')}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Delete Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(image.id, index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                {/* Order Badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-medium">
                  {index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add New Image */}
      <div className="border-2 border-dashed border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
        <ImageUpload
          value=""
          onChange={handleAddImage}
          placeholder={isRTL ? 'اضغط لإضافة صورة جديدة' : 'Click to add a new image'}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {isRTL 
          ? 'استخدم الأسهم لإعادة ترتيب الصور. الصورة الأولى ستظهر كصورة رئيسية.'
          : 'Use arrows to reorder. The first image will be shown as the main image.'}
      </p>
    </div>
  );
};

export default ProductImagesManager;
