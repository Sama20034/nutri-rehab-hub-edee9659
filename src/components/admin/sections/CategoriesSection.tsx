import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Plus, Edit, Trash2, ChevronRight, ChevronDown, 
  Search, FolderTree, Save, X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export const CategoriesSection = () => {
  const { isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    parent_id: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // First pass: create all nodes
    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const getMainCategories = () => {
    return categories.filter(c => !c.parent_id);
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      name_ar: '',
      parent_id: '',
      display_order: 0,
      is_active: true
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      name_ar: category.name_ar || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const saveCategory = async () => {
    const { error } = await supabase
      .from('store_categories')
      .insert({
        name: formData.name,
        name_ar: formData.name_ar || null,
        parent_id: formData.parent_id || null,
        display_order: formData.display_order,
        is_active: formData.is_active
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
        description: isRTL ? 'تم إضافة التصنيف' : 'Category added successfully'
      });
      setIsAddDialogOpen(false);
      fetchCategories();
    }
  };

  const updateCategory = async () => {
    if (!selectedCategory) return;

    const { error } = await supabase
      .from('store_categories')
      .update({
        name: formData.name,
        name_ar: formData.name_ar || null,
        parent_id: formData.parent_id || null,
        display_order: formData.display_order,
        is_active: formData.is_active
      })
      .eq('id', selectedCategory.id);

    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم تحديث التصنيف' : 'Category updated successfully'
      });
      setIsEditDialogOpen(false);
      fetchCategories();
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    const { error } = await supabase
      .from('store_categories')
      .delete()
      .eq('id', selectedCategory.id);

    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم حذف التصنيف' : 'Category deleted successfully'
      });
      setIsDeleteDialogOpen(false);
      fetchCategories();
    }
  };

  const categoryTree = buildCategoryTree(categories);

  const filteredTree = searchTerm
    ? categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const renderCategoryItem = (category: CategoryWithChildren, depth: number = 0) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <div
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group ${
            depth > 0 ? (isRTL ? 'mr-6' : 'ml-6') : ''
          }`}
        >
          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${!hasChildren ? 'invisible' : ''}`}
            onClick={() => toggleExpand(category.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Category Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-medium">{isRTL ? category.name_ar || category.name : category.name}</span>
              {!category.is_active && (
                <Badge variant="secondary" className="text-xs">
                  {isRTL ? 'غير نشط' : 'Inactive'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? category.name : category.name_ar}
            </p>
          </div>

          {/* Order Badge */}
          <Badge variant="outline" className="text-xs">
            {isRTL ? 'ترتيب' : 'Order'}: {category.display_order}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {category.children
                .sort((a, b) => a.display_order - b.display_order)
                .map(child => renderCategoryItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const CategoryForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Category name"
          />
        </div>
        <div>
          <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
          <Input
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            placeholder="اسم التصنيف"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{isRTL ? 'التصنيف الرئيسي' : 'Parent Category'}</Label>
          <Select
            value={formData.parent_id}
            onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? 'اختر (اختياري)' : 'Select (optional)'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{isRTL ? 'بدون (تصنيف رئيسي)' : 'None (Main Category)'}</SelectItem>
              {getMainCategories()
                .filter(c => c.id !== selectedCategory?.id)
                .map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {isRTL ? cat.name_ar || cat.name : cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{isRTL ? 'ترتيب العرض' : 'Display Order'}</Label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>{isRTL ? 'نشط' : 'Active'}</Label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            {isRTL ? 'إدارة التصنيفات' : 'Category Management'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إضافة وتعديل وحذف تصنيفات المتجر' : 'Add, edit, and delete store categories'}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة تصنيف' : 'Add Category'}
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={isRTL ? 'بحث في التصنيفات...' : 'Search categories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {isRTL ? 'شجرة التصنيفات' : 'Category Tree'}
            <Badge variant="secondary" className="ml-2">
              {categories.length} {isRTL ? 'تصنيف' : 'categories'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTree ? (
            <div className="space-y-1">
              {filteredTree.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="flex-1 font-medium">{isRTL ? cat.name_ar || cat.name : cat.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {cat.parent_id ? (isRTL ? 'فرعي' : 'Sub') : (isRTL ? 'رئيسي' : 'Main')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(cat)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد تصنيفات' : 'No categories found'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {categoryTree
                .sort((a, b) => a.display_order - b.display_order)
                .map(category => renderCategoryItem(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إضافة تصنيف جديد' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={saveCategory} className="gap-2">
              <Save className="h-4 w-4" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل التصنيف' : 'Edit Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={updateCategory} className="gap-2">
              <Save className="h-4 w-4" />
              {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? `هل أنت متأكد من حذف "${selectedCategory?.name_ar || selectedCategory?.name}"؟ سيتم نقل التصنيفات الفرعية إلى المستوى الأعلى.`
                : `Are you sure you want to delete "${selectedCategory?.name}"? Subcategories will be moved to parent level.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRTL ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
