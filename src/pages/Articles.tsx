import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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

const Articles = () => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (value: string) => {
    const cat = categories.find(c => c.value === value);
    return cat ? (isRTL ? cat.labelAr : cat.labelEn) : value;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">{isRTL ? 'المقالات والنصائح' : 'Articles & Tips'}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {isRTL 
                ? 'اكتشف مقالاتنا التعليمية حول التغذية والعلاج الطبيعي والصحة العامة'
                : 'Discover our educational articles about nutrition, physical therapy, and general health'
              }
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث في المقالات...' : 'Search articles...'}
                className={`${isRTL ? 'pr-12 text-right' : 'pl-12'} py-6`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className={`flex flex-wrap gap-2 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Badge
              variant={!selectedCategory ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(null)}
            >
              {isRTL ? 'الكل' : 'All'}
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : filteredArticles?.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {isRTL ? 'لا توجد مقالات متاحة حالياً' : 'No articles available'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles?.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="overflow-hidden h-full cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 group"
                    onClick={() => setSelectedArticle(article)}
                  >
                    {article.cover_image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(article.category)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(article.created_at), 'PP', { locale: isRTL ? ar : undefined })}
                        </span>
                      </div>
                      <h3 className={`text-xl font-semibold mb-3 group-hover:text-primary transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className={`text-muted-foreground text-sm line-clamp-3 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {article.excerpt}
                        </p>
                      )}
                      <div className={`flex items-center text-primary text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {isRTL ? 'اقرأ المزيد' : 'Read more'}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${isRTL ? 'text-right' : 'text-left'}`}>
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {selectedArticle.cover_image && (
                  <img
                    src={selectedArticle.cover_image}
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div className={`flex items-center gap-4 mb-6 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {selectedArticle.category && (
                    <Badge variant="secondary">
                      {getCategoryLabel(selectedArticle.category)}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedArticle.created_at), 'PPP', { locale: isRTL ? ar : undefined })}
                  </span>
                </div>
                <div 
                  className={`prose prose-lg max-w-none ${isRTL ? 'text-right' : 'text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {(selectedArticle.content || '').split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Articles;
