import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Save, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface MissionImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export const MissionImagesSection = () => {
  const { isRTL } = useLanguage();
  const [images, setImages] = useState<MissionImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('mission_images')
      .select('*')
      .order('display_order');
    if (!error && data) setImages(data);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newImageUrl) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يجب اختيار صورة' : 'Image is required', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('mission_images').insert({
      image_url: newImageUrl,
      display_order: images.length,
      is_active: true,
    });
    if (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: isRTL ? 'تم بنجاح' : 'Success', description: isRTL ? 'تمت إضافة الصورة' : 'Image added' });
      fetchImages();
      setShowAddDialog(false);
      setNewImageUrl('');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('mission_images').delete().eq('id', id);
    if (!error) {
      toast({ title: isRTL ? 'تم بنجاح' : 'Success', description: isRTL ? 'تم حذف الصورة' : 'Image deleted' });
      fetchImages();
    }
  };

  const handleToggleActive = async (img: MissionImage) => {
    await supabase.from('mission_images').update({ is_active: !img.is_active }).eq('id', img.id);
    fetchImages();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updates = [
      { id: images[index].id, display_order: newIndex },
      { id: images[newIndex].id, display_order: index },
    ];
    for (const u of updates) {
      await supabase.from('mission_images').update({ display_order: u.display_order }).eq('id', u.id);
    }
    fetchImages();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {isRTL ? 'صور سكشن رسالتنا' : 'Mission Section Images'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRTL ? 'إدارة الصور في كاروسيل سكشن رسالتنا بالصفحة الرئيسية' : 'Manage carousel images in the mission section'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة صورة' : 'Add Image'}
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{isRTL ? 'لا توجد صور بعد' : 'No images yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative group rounded-xl overflow-hidden border ${img.is_active ? 'border-primary/30' : 'border-border/50 opacity-60'}`}
              >
                <img src={img.image_url} alt="" className="w-full aspect-[3/4] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleMove(index, 'up')} disabled={index === 0}>↑</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleMove(index, 'down')} disabled={index === images.length - 1}>↓</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(img.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Switch checked={img.is_active} onCheckedChange={() => handleToggleActive(img)} />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                  {index + 1}
                </div>
                {!img.is_active && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-xs font-medium">
                    {isRTL ? 'غير نشط' : 'Inactive'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إضافة صورة جديدة' : 'Add New Image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الصورة' : 'Image'}</Label>
              <ImageUpload value={newImageUrl} onChange={setNewImageUrl} placeholder={isRTL ? 'اختر صورة' : 'Select image'} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAdd} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'إضافة' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); setNewImageUrl(''); }}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
