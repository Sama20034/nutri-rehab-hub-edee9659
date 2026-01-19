import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Transformation {
  id: string;
  title: string;
  description: string | null;
  before_image_url: string;
  after_image_url: string | null;
  is_combined_image: boolean;
  category: string | null;
  display_order: number;
  is_active: boolean;
  use_emoji_mask: boolean;
  client_name: string | null;
  weight_before: number | null;
  weight_after: number | null;
  duration_text: string | null;
  rating: number | null;
  created_at: string;
}

const categories = [
  { value: 'weight_loss', labelAr: 'تخسيس', labelEn: 'Weight Loss' },
  { value: 'muscle_building', labelAr: 'بناء العضلات', labelEn: 'Muscle Building' },
  { value: 'health', labelAr: 'صحة عامة', labelEn: 'General Health' },
];

export const TransformationsSection = () => {
  const { isRTL } = useLanguage();
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transformation | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    before_image_url: '',
    after_image_url: '',
    is_combined_image: false,
    category: 'weight_loss',
    display_order: 0,
    is_active: true,
    use_emoji_mask: false,
    client_name: '',
    weight_before: '',
    weight_after: '',
    duration_text: '',
    rating: 5
  });

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transformations')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      toast.error(error.message);
    } else {
      setTransformations(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      before_image_url: '',
      after_image_url: '',
      is_combined_image: false,
      category: 'weight_loss',
      display_order: transformations.length,
      is_active: true,
      use_emoji_mask: false,
      client_name: '',
      weight_before: '',
      weight_after: '',
      duration_text: '',
      rating: 5
    });
    setEditingItem(null);
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${type}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('transformations')
      .upload(fileName, file);
    
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('transformations')
      .getPublicUrl(fileName);
    
    if (type === 'before') {
      setFormData({ ...formData, before_image_url: publicUrl });
    } else {
      setFormData({ ...formData, after_image_url: publicUrl });
    }
    
    setUploading(false);
    toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
  };

  const handleSubmit = async () => {
    if (!formData.client_name || !formData.before_image_url) {
      toast.error(isRTL ? 'يرجى إدخال اسم العميل وصورة' : 'Please enter client name and image');
      return;
    }

    const dataToSave = {
      title: formData.title || formData.client_name,
      description: formData.description || null,
      before_image_url: formData.before_image_url,
      after_image_url: formData.after_image_url || null,
      is_combined_image: formData.is_combined_image,
      category: formData.category,
      display_order: formData.display_order,
      is_active: formData.is_active,
      use_emoji_mask: formData.use_emoji_mask,
      client_name: formData.client_name,
      weight_before: formData.weight_before ? parseFloat(formData.weight_before) : null,
      weight_after: formData.weight_after ? parseFloat(formData.weight_after) : null,
      duration_text: formData.duration_text || null,
      rating: formData.rating
    };

    if (editingItem) {
      const { error } = await supabase
        .from('transformations')
        .update(dataToSave)
        .eq('id', editingItem.id);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(isRTL ? 'تم التحديث' : 'Updated successfully');
    } else {
      const { error } = await supabase
        .from('transformations')
        .insert(dataToSave);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(isRTL ? 'تمت الإضافة' : 'Added successfully');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchTransformations();
  };

  const handleEdit = (item: Transformation) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      before_image_url: item.before_image_url,
      after_image_url: item.after_image_url || '',
      is_combined_image: item.is_combined_image,
      category: item.category || 'weight_loss',
      display_order: item.display_order,
      is_active: item.is_active,
      use_emoji_mask: item.use_emoji_mask,
      client_name: item.client_name || '',
      weight_before: item.weight_before?.toString() || '',
      weight_after: item.weight_after?.toString() || '',
      duration_text: item.duration_text || '',
      rating: item.rating || 5
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('transformations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(error.message);
    } else {
      setTransformations(transformations.filter(t => t.id !== id));
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('transformations')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      toast.error(error.message);
    } else {
      setTransformations(transformations.map(t => 
        t.id === id ? { ...t, is_active: !currentStatus } : t
      ));
      toast.success(isRTL ? 'تم التحديث' : 'Updated');
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const cat = categories.find(c => c.value === category);
    return cat ? (isRTL ? cat.labelAr : cat.labelEn) : '-';
  };

  const renderStars = (rating: number | null) => {
    const stars = rating || 5;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isRTL ? 'قصص النجاح' : 'Success Stories'}</h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إدارة قصص النجاح المعروضة على الموقع' : 'Manage success stories displayed on the website'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة قصة نجاح' : 'Add Story'}
        </Button>
      </div>

      {/* Count */}
      <Badge variant="secondary" className="text-sm">
        {transformations.length} {isRTL ? 'قصة نجاح' : 'Success Story(ies)'}
      </Badge>

      {/* Table */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{isRTL ? 'الصورة' : 'Image'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'اسم العميل' : 'Client Name'}</TableHead>
              <TableHead>{isRTL ? 'الوزن' : 'Weight'}</TableHead>
              <TableHead>{isRTL ? 'المدة' : 'Duration'}</TableHead>
              <TableHead>{isRTL ? 'التقييم' : 'Rating'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد قصص نجاح' : 'No success stories found'}</p>
                </TableCell>
              </TableRow>
            ) : (
              transformations.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img 
                      src={item.before_image_url} 
                      alt="Transformation" 
                      className="w-12 h-12 rounded object-cover border"
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>
                    <div>
                      <p>{item.client_name || item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(item.category)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.weight_before && item.weight_after ? (
                      <div className="text-sm">
                        <span className="text-red-400">{item.weight_before} kg</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-400">{item.weight_after} kg</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{item.duration_text || '-'}</TableCell>
                  <TableCell>{renderStars(item.rating)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(item.id, item.is_active)}
                    >
                      {item.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? (isRTL ? 'تعديل قصة النجاح' : 'Edit Story') : (isRTL ? 'إضافة قصة نجاح جديدة' : 'Add New Story')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Client Name */}
            <div>
              <Label>{isRTL ? 'اسم العميل' : 'Client Name'} *</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder={isRTL ? 'مثال: محمد خالد' : 'e.g., Mohamed Khaled'}
              />
            </div>

            {/* Weight Before/After */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الوزن قبل (kg)' : 'Weight Before (kg)'}</Label>
                <Input
                  type="number"
                  value={formData.weight_before}
                  onChange={(e) => setFormData({ ...formData, weight_before: e.target.value })}
                  placeholder="110"
                />
              </div>
              <div>
                <Label>{isRTL ? 'الوزن بعد (kg)' : 'Weight After (kg)'}</Label>
                <Input
                  type="number"
                  value={formData.weight_after}
                  onChange={(e) => setFormData({ ...formData, weight_after: e.target.value })}
                  placeholder="82"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label>{isRTL ? 'المدة' : 'Duration'}</Label>
              <Input
                value={formData.duration_text}
                onChange={(e) => setFormData({ ...formData, duration_text: e.target.value })}
                placeholder={isRTL ? 'مثال: 6 أشهر' : 'e.g., 6 months'}
              />
            </div>

            {/* Rating */}
            <div>
              <Label>{isRTL ? 'التقييم (1-5 نجوم)' : 'Rating (1-5 stars)'}</Label>
              <Select 
                value={formData.rating.toString()} 
                onValueChange={(v) => setFormData({ ...formData, rating: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(r => (
                    <SelectItem key={r} value={r.toString()}>
                      {'⭐'.repeat(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {isRTL ? c.labelAr : c.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'وصف إضافي عن قصة النجاح...' : 'Additional description...'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'صورة مدمجة (قبل وبعد في صورة واحدة)' : 'Combined image'}</Label>
              <Switch
                checked={formData.is_combined_image}
                onCheckedChange={(checked) => setFormData({ ...formData, is_combined_image: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'استخدام قناع الإيموجي للخصوصية' : 'Use emoji mask'}</Label>
              <Switch
                checked={formData.use_emoji_mask}
                onCheckedChange={(checked) => setFormData({ ...formData, use_emoji_mask: checked })}
              />
            </div>

            {/* Before Image */}
            <div>
              <Label>{formData.is_combined_image ? (isRTL ? 'الصورة' : 'Image') : (isRTL ? 'صورة قبل' : 'Before Image')} *</Label>
              <div className="space-y-2">
                <Input
                  value={formData.before_image_url}
                  onChange={(e) => setFormData({ ...formData, before_image_url: e.target.value })}
                  placeholder={isRTL ? 'رابط الصورة أو ارفع صورة' : 'Image URL or upload'}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'before')}
                  disabled={uploading}
                />
                {formData.before_image_url && (
                  <img src={formData.before_image_url} alt="Before preview" className="w-24 h-24 rounded object-cover" />
                )}
              </div>
            </div>

            {/* After Image */}
            {!formData.is_combined_image && (
              <div>
                <Label>{isRTL ? 'صورة بعد' : 'After Image'}</Label>
                <div className="space-y-2">
                  <Input
                    value={formData.after_image_url}
                    onChange={(e) => setFormData({ ...formData, after_image_url: e.target.value })}
                    placeholder={isRTL ? 'رابط الصورة أو ارفع صورة' : 'Image URL or upload'}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'after')}
                    disabled={uploading}
                  />
                  {formData.after_image_url && (
                    <img src={formData.after_image_url} alt="After preview" className="w-24 h-24 rounded object-cover" />
                  )}
                </div>
              </div>
            )}

            {/* Display Order */}
            <div>
              <Label>{isRTL ? 'ترتيب العرض' : 'Display Order'}</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{isRTL ? 'نشط (معروض على الموقع)' : 'Active (displayed on website)'}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (editingItem ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
