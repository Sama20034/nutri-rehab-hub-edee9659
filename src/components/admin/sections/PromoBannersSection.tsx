import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  GripVertical,
  Save,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromoBanner {
  id: string;
  image_url: string;
  title: string | null;
  title_ar: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  position: string | null;
}

interface PromoBannersSectionProps {
  isRTL: boolean;
}

const PromoBannersSection = ({ isRTL }: PromoBannersSectionProps) => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    title_ar: '',
    link_url: '',
    is_active: true,
    position: 'top' as 'top' | 'bottom'
  });

  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .order('display_order');
    
    if (!error && data) {
      setBanners(data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      title_ar: '',
      link_url: '',
      is_active: true,
      position: activeTab
    });
    setEditingBanner(null);
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يجب اختيار صورة' : 'Image is required',
        variant: 'destructive'
      });
      return;
    }

    if (editingBanner) {
      // Update existing
      const { error } = await supabase
        .from('promo_banners')
        .update({
          image_url: formData.image_url,
          title: formData.title || null,
          title_ar: formData.title_ar || null,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          position: formData.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBanner.id);

      if (error) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: isRTL ? 'تم بنجاح' : 'Success',
          description: isRTL ? 'تم تحديث البانر' : 'Banner updated'
        });
        fetchBanners();
        setShowAddDialog(false);
        resetForm();
      }
    } else {
      // Create new - filter by active tab for display_order
      const samePositionBanners = banners.filter(b => b.position === formData.position);
      const { error } = await supabase
        .from('promo_banners')
        .insert({
          image_url: formData.image_url,
          title: formData.title || null,
          title_ar: formData.title_ar || null,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          position: formData.position,
          display_order: samePositionBanners.length
        });

      if (error) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: isRTL ? 'تم بنجاح' : 'Success',
          description: isRTL ? 'تم إضافة البانر' : 'Banner added'
        });
        fetchBanners();
        setShowAddDialog(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('promo_banners')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم حذف البانر' : 'Banner deleted'
      });
      fetchBanners();
    }
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      title: banner.title || '',
      title_ar: banner.title_ar || '',
      link_url: banner.link_url || '',
      is_active: banner.is_active,
      position: (banner.position as 'top' | 'bottom') || 'top'
    });
    setShowAddDialog(true);
  };

  const handleToggleActive = async (banner: PromoBanner) => {
    const { error } = await supabase
      .from('promo_banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id);

    if (!error) {
      fetchBanners();
    }
  };

  // Filter banners by active tab
  const filteredBanners = banners.filter(b => b.position === activeTab || (!b.position && activeTab === 'top'));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex-shrink-0">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {isRTL ? 'بانرات المتجر' : 'Store Banners'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {isRTL ? 'إدارة الصور الترويجية في المتجر' : 'Manage promotional banners in the store'}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => {
            setFormData(prev => ({ ...prev, position: activeTab }));
            resetForm();
            setShowAddDialog(true);
          }}
          className="gap-2 flex-shrink-0"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة بانر' : 'Add Banner'}
        </Button>
      </div>

      {/* Position Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeTab === 'top' ? 'default' : 'outline'}
          onClick={() => setActiveTab('top')}
          size="sm"
          className="flex-shrink-0"
        >
          {isRTL ? 'السلايدر العلوي' : 'Top Slider'}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-background/20">
            {banners.filter(b => b.position === 'top' || !b.position).length}
          </span>
        </Button>
        <Button
          variant={activeTab === 'bottom' ? 'default' : 'outline'}
          onClick={() => setActiveTab('bottom')}
          size="sm"
          className="flex-shrink-0"
        >
          {isRTL ? 'السلايدر السفلي' : 'Bottom Slider'}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-background/20">
            {banners.filter(b => b.position === 'bottom').length}
          </span>
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[2/1] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              {isRTL ? 'لا توجد بانرات في هذا السلايدر' : 'No banners in this slider'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative group rounded-xl overflow-hidden border ${
                  banner.is_active ? 'border-primary/30' : 'border-border/50 opacity-60'
                }`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || ''}
                  className="w-full aspect-[2/1] object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(banner)}
                      >
                        {isRTL ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => handleToggleActive(banner)}
                    />
                  </div>
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                  {index + 1}
                </div>

                {/* Status Badge */}
                {!banner.is_active && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-xs font-medium">
                    {isRTL ? 'غير نشط' : 'Inactive'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner 
                ? (isRTL ? 'تعديل البانر' : 'Edit Banner')
                : (isRTL ? 'إضافة بانر جديد' : 'Add New Banner')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{isRTL ? 'صورة البانر' : 'Banner Image'}</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                placeholder={isRTL ? 'اختر صورة البانر' : 'Select banner image'}
              />
            </div>

            {/* Title */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner title"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="عنوان البانر"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label>{isRTL ? 'رابط (اختياري)' : 'Link URL (optional)'}</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'نشط' : 'Active'}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {editingBanner 
                  ? (isRTL ? 'تحديث' : 'Update')
                  : (isRTL ? 'إضافة' : 'Add')
                }
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromoBannersSection;
