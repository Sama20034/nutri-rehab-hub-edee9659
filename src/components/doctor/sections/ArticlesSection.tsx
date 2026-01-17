import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Send, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ArticlesSectionProps {
  doctorId: string;
}

interface Article {
  id: string;
  author_id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'nutrition', labelAr: 'التغذية', labelEn: 'Nutrition' },
  { value: 'rehabilitation', labelAr: 'التأهيل', labelEn: 'Rehabilitation' },
  { value: 'exercises', labelAr: 'التمارين', labelEn: 'Exercises' },
  { value: 'health', labelAr: 'الصحة العامة', labelEn: 'General Health' },
  { value: 'tips', labelAr: 'نصائح', labelEn: 'Tips' },
];

export const ArticlesSection = ({ doctorId }: ArticlesSectionProps) => {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    category: '',
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ['doctor-articles', doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', doctorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!doctorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; excerpt: string; cover_image: string; category: string; status: string }) => {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          cover_image: data.cover_image,
          category: data.category,
          status: data.status,
          author_id: doctorId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-articles', doctorId] });
      toast({ title: isRTL ? 'تم إنشاء المقال بنجاح' : 'Article created successfully' });
      resetForm();
    },
    onError: () => {
      toast({ title: isRTL ? 'حدث خطأ' : 'Error occurred', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string; excerpt: string; cover_image: string; category: string; status: string }) => {
      const { error } = await supabase
        .from('articles')
        .update({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          cover_image: data.cover_image,
          category: data.category,
          status: data.status,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-articles', doctorId] });
      toast({ title: isRTL ? 'تم تحديث المقال بنجاح' : 'Article updated successfully' });
      resetForm();
    },
    onError: () => {
      toast({ title: isRTL ? 'حدث خطأ' : 'Error occurred', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-articles', doctorId] });
      toast({ title: isRTL ? 'تم حذف المقال' : 'Article deleted' });
    },
    onError: () => {
      toast({ title: isRTL ? 'حدث خطأ' : 'Error occurred', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', content: '', excerpt: '', cover_image: '', category: '' });
    setEditingArticle(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content) {
      toast({ title: isRTL ? 'يرجى ملء العنوان والمحتوى' : 'Please fill title and content', variant: 'destructive' });
      return;
    }

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, ...formData, status });
    } else {
      createMutation.mutate({ ...formData, status });
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content || '',
      excerpt: article.excerpt || '',
      cover_image: article.cover_image || '',
      category: article.category || '',
    });
    setIsDialogOpen(true);
  };

  const getCategoryLabel = (value: string) => {
    const cat = categories.find(c => c.value === value);
    return cat ? (isRTL ? cat.labelAr : cat.labelEn) : value;
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-2xl font-bold">{isRTL ? 'مقالاتي' : 'My Articles'}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'مقال جديد' : 'New Article'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle 
                  ? (isRTL ? 'تعديل المقال' : 'Edit Article')
                  : (isRTL ? 'مقال جديد' : 'New Article')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'العنوان' : 'Title'} *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRTL ? 'عنوان المقال' : 'Article title'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الملخص' : 'Excerpt'}
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder={isRTL ? 'ملخص قصير للمقال' : 'Short excerpt'}
                  rows={2}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'المحتوى' : 'Content'} *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={isRTL ? 'محتوى المقال' : 'Article content'}
                  rows={10}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'صورة الغلاف (URL)' : 'Cover Image (URL)'}
                  </label>
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'التصنيف' : 'Category'}
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {isRTL ? cat.labelAr : cat.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                </Button>
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isRTL ? 'نشر المقال' : 'Publish'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : articles?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? 'لا توجد مقالات بعد' : 'No articles yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles?.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {article.cover_image && (
                    <div className="w-48 h-32 shrink-0">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                            {article.status === 'published' 
                              ? (isRTL ? 'منشور' : 'Published')
                              : (isRTL ? 'مسودة' : 'Draft')
                            }
                          </Badge>
                          {article.category && (
                            <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(article.created_at), 'PPP', { locale: isRTL ? ar : undefined })}
                        </p>
                      </div>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteMutation.mutate(article.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};