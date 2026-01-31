import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, Reorder } from "framer-motion";
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

  // For existing products, fetch images from database
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
      // Save to database for existing product
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
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setImages([...images, data]);
        toast({
          title: isRTL ? 'تم بنجاح' : 'Success',
          description: isRTL ? 'تم إضافة الصورة' : 'Image added'
        });
      }
    } else {
      // For new products, just store URLs temporarily
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
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setImages(images.filter(img => img.id !== imageId));
        toast({
          title: isRTL ? 'تم بنجاح' : 'Success',
          description: isRTL ? 'تم حذف الصورة' : 'Image removed'
        });
      }
    } else {
      const newTempImages = tempImages.filter((_, i) => i !== index);
      setTempImages(newTempImages);
      onImagesChange?.(newTempImages);
    }
  };

  const handleReorder = async (newOrder: ProductImage[]) => {
    setImages(newOrder);
    
    if (productId) {
      // Update order in database
      const updates = newOrder.map((img, index) => ({
        id: img.id,
        product_id: productId,
        image_url: img.image_url,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('product_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
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

      {/* Image Grid */}
      {displayImages.length > 0 && (
        <Reorder.Group
          axis="x"
          values={images}
          onReorder={handleReorder}
          className="flex flex-wrap gap-3"
        >
          {displayImages.map((image, index) => (
            <Reorder.Item
              key={image.id}
              value={image as ProductImage}
              className="relative group"
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing"
              >
                <img
                  src={image.image_url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Drag Handle */}
                <div className="absolute top-1 left-1 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
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
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
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
          ? 'يمكنك سحب الصور لإعادة ترتيبها. الصورة الأولى ستظهر كصورة رئيسية.'
          : 'Drag images to reorder. The first image will be shown as the main image.'}
      </p>
    </div>
  );
};

export default ProductImagesManager;
