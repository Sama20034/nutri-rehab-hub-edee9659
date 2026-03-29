import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ProductImageSlider from "@/components/store/ProductImageSlider";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/hooks/useCart";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Package, 
  Play, 
  Users, 
  Stethoscope,
  Plus,
  Minus,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Heart,
  Share2,
  Truck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  video_url: string | null;
  usage_instructions: string | null;
  usage_instructions_ar: string | null;
  suitable_for: string | null;
  suitable_for_ar: string | null;
  medical_followup_required: boolean | null;
  medical_followup_notes: string | null;
  medical_followup_notes_ar: string | null;
  category: string | null;
  stock_quantity: number | null;
}

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { addToCart, isLoading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Fetch additional product images
  useEffect(() => {
    if (!productId) return;
    const fetchImages = async () => {
      const { data } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('display_order');
      if (data) {
        setAdditionalImages(data.map(img => img.image_url));
      }
    };
    fetchImages();
  }, [productId]);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category, productId],
    queryFn: async () => {
      if (!product?.category) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', product.category)
        .neq('id', productId)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product?.category
  });

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      toast({
        title: isRTL ? "تمت الإضافة للسلة" : "Added to Cart",
        description: isRTL 
          ? `تمت إضافة ${quantity} × ${product.name_ar || product.name} للسلة`
          : `Added ${quantity} × ${product.name} to your cart`,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || '',
        text: product?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: isRTL ? "تم نسخ الرابط" : "Link Copied",
        description: isRTL ? "تم نسخ رابط المنتج" : "Product link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="aspect-square rounded-3xl" />
              <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">
              {isRTL ? 'المنتج غير موجود' : 'Product Not Found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRTL ? 'عذراً، لم نتمكن من العثور على هذا المنتج' : 'Sorry, we couldn\'t find this product'}
            </p>
            <Button onClick={() => navigate('/store')}>
              {isRTL ? 'العودة للمتجر' : 'Back to Store'}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const productName = isRTL ? product.name_ar || product.name : product.name;
  const productDescription = isRTL ? product.description_ar || product.description : product.description;
  const usageInstructions = isRTL ? product.usage_instructions_ar || product.usage_instructions : product.usage_instructions;
  const suitableFor = isRTL ? product.suitable_for_ar || product.suitable_for : product.suitable_for;
  const medicalNotes = isRTL ? product.medical_followup_notes_ar || product.medical_followup_notes : product.medical_followup_notes;

  // Convert YouTube URL to embed format
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let videoId: string | null = null;
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      } else if (urlObj.hostname.includes('youtube.com')) {
        const shortsMatch = urlObj.pathname.match(/\/shorts\/([^/?]+)/);
        if (shortsMatch) {
          videoId = shortsMatch[1];
        } else {
          videoId = urlObj.searchParams.get('v');
        }
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch (_) {}
    return url; // fallback to original
  };

  return (
    <Layout>
      <div className={`min-h-screen pt-24 pb-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link to="/store" className="hover:text-primary transition-colors flex items-center gap-1">
              {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {isRTL ? 'المتجر' : 'Store'}
            </Link>
            <span>/</span>
            <span className="text-foreground">{productName}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Media Section */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Image with Slider */}
              <div className="relative rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl">
                <div className="aspect-square">
                  <ProductImageSlider
                    images={additionalImages}
                    mainImage={product.image_url}
                    productName={productName}
                    size="featured"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                  <div className="flex gap-2">
                    {product.video_url && (
                      <Badge className="gap-1.5 bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-lg">
                        <Play className="h-3.5 w-3.5" />
                        {isRTL ? 'فيديو شرح' : 'Video'}
                      </Badge>
                    )}
                    {product.category && (
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  {product.medical_followup_required && (
                    <Badge variant="destructive" className="gap-1 shadow-lg backdrop-blur-sm">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {isRTL ? 'متابعة طبية' : 'Medical'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Video Section (below image) */}
              {product.video_url && (
                <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-lg">
                  <div className="aspect-video">
                    <iframe
                      src={getYoutubeEmbedUrl(product.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={productName}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Product Info Section */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title & Price */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                  {productName}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xl text-muted-foreground">
                    {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                  <Truck className="h-4 w-4" />
                  {isRTL ? 'شحن لجميع المحافظات' : 'Ships Nationwide'}
                </Badge>
              </div>

              {/* Description */}
              {productDescription && (
                <div className="p-5 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {isRTL ? 'الوصف' : 'Description'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {productDescription}
                  </p>
                </div>
              )}

              {/* Usage Instructions */}
              {usageInstructions && (
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {isRTL ? 'طريقة الاستخدام' : 'Usage Instructions'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {usageInstructions}
                  </p>
                </div>
              )}

              {/* Suitable For */}
              {suitableFor && (
                <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    {isRTL ? 'يناسب' : 'Suitable For'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {suitableFor}
                  </p>
                </div>
              )}

              {/* Medical Warning */}
              {product.medical_followup_required && (
                <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {isRTL ? 'تنبيه طبي هام' : 'Important Medical Notice'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {medicalNotes || (isRTL 
                      ? 'هذا المنتج يتطلب متابعة طبية. يرجى استشارة الطبيب قبل الاستخدام.'
                      : 'This product requires medical supervision. Please consult a doctor before use.'
                    )}
                  </p>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="sticky bottom-4 p-5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center gap-3 bg-muted rounded-xl p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || cartLoading}
                    className="flex-1 h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isAddingToCart 
                      ? (isRTL ? 'جاري الإضافة...' : 'Adding...') 
                      : (isRTL ? 'أضف للسلة' : 'Add to Cart')}
                    <span className="mx-2">•</span>
                    <span>{(product.price * quantity).toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-20"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  {isRTL ? 'منتجات مشابهة' : 'Related Products'}
                </h2>
                <Link to="/store">
                  <Button variant="ghost" className="gap-2">
                    {isRTL ? 'عرض الكل' : 'View All'}
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        {relatedProduct.image_url ? (
                          <img 
                            src={relatedProduct.image_url} 
                            alt={isRTL ? relatedProduct.name_ar || relatedProduct.name : relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {isRTL ? relatedProduct.name_ar || relatedProduct.name : relatedProduct.name}
                        </h3>
                        <span className="text-lg font-bold text-primary">
                          {relatedProduct.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
