import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { motion } from 'framer-motion';
import { 
  Package, Plus, Edit, Trash2, Eye, Search, Filter,
  ShoppingCart, CheckCircle, XCircle, Clock, Truck, Play
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProductImagesManager from '@/components/admin/ProductImagesManager';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string | null;
  phone: string | null;
  grants_content_access: boolean;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  video_url: string | null;
  usage_instructions: string | null;
  suitable_for: string | null;
  medical_followup_required: boolean;
}

interface StoreSectionProps {
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<{ error: Error | null }>;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<{ error: Error | null }>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: Error | null }>;
  onDeleteProduct: (id: string) => Promise<{ error: Error | null }>;
}

export const StoreSection = ({
  orders,
  products,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: StoreSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; name_ar: string | null; parent_id: string | null }[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('store_categories')
      .select('id, name, name_ar, parent_id')
      .eq('is_active', true)
      .order('display_order');
    if (data) setCategories(data);
  };

  const getSubcategories = () => {
    return categories.filter(c => c.parent_id !== null);
  };

  const [newProduct, setNewProduct] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: 0,
    image_url: '',
    category: '',
    stock_quantity: 0,
    is_active: true,
    video_url: '',
    usage_instructions: '',
    suitable_for: '',
    medical_followup_required: false
  });
  const [newProductImages, setNewProductImages] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async () => {
    // First create the product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert(newProduct as any)
      .select()
      .single();
    
    if (productError) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: productError.message,
        variant: 'destructive'
      });
      return;
    }
    
    // Then add the additional images
    if (newProductImages.length > 0 && productData) {
      const imagesToInsert = newProductImages.map((url, index) => ({
        product_id: productData.id,
        image_url: url,
        display_order: index
      }));
      
      await supabase
        .from('product_images')
        .insert(imagesToInsert);
    }
    
    toast({
      title: isRTL ? 'تم بنجاح' : 'Success',
      description: isRTL ? 'تم إضافة المنتج' : 'Product added successfully'
    });
    setIsAddProductOpen(false);
    setNewProduct({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: 0,
      image_url: '',
      category: '',
      stock_quantity: 0,
      is_active: true,
      video_url: '',
      usage_instructions: '',
      suitable_for: '',
      medical_followup_required: false
    });
    setNewProductImages([]);
    
    // Refresh the page to show the new product
    window.location.reload();
  };

  const handleUpdateOrder = async (orderId: string, status: string) => {
    const { error } = await onUpdateOrderStatus(orderId, status);
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated'
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await onDeleteProduct(id);
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم حذف المنتج' : 'Product deleted'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold">{isRTL ? 'إدارة المتجر' : 'Store Management'}</h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إدارة المنتجات والطلبات' : 'Manage products and orders'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {isRTL ? 'الطلبات' : 'Orders'}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {isRTL ? 'المنتجات' : 'Products'}
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative flex-1">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={isRTL ? 'بحث في الطلبات...' : 'Search orders...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                    <SelectItem value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</SelectItem>
                    <SelectItem value="shipped">{isRTL ? 'تم الشحن' : 'Shipped'}</SelectItem>
                    <SelectItem value="delivered">{isRTL ? 'تم التوصيل' : 'Delivered'}</SelectItem>
                    <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'رقم الطلب' : 'Order ID'}</TableHead>
                      <TableHead>{isRTL ? 'العميل' : 'Customer'}</TableHead>
                      <TableHead>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                      <TableHead>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {isRTL ? 'لا توجد طلبات' : 'No orders found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.profile?.full_name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{order.phone || order.profile?.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{order.total_amount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">{isRTL ? 'ج.م' : 'EGP'}</span>
                            </div>
                            {order.grants_content_access && (
                              <Badge variant="outline" className="text-xs mt-1 bg-green-500/10 text-green-500 border-green-500/20">
                                {isRTL ? 'محتوى مجاني' : 'Free Content'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status || 'pending')} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(order.status || 'pending')}
                              {order.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status || 'pending'}
                              onValueChange={(value) => handleUpdateOrder(order.id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                                <SelectItem value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</SelectItem>
                                <SelectItem value="shipped">{isRTL ? 'تم الشحن' : 'Shipped'}</SelectItem>
                                <SelectItem value="delivered">{isRTL ? 'تم التوصيل' : 'Delivered'}</SelectItem>
                                <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative flex-1 max-w-md">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={isRTL ? 'بحث في المنتجات...' : 'Search products...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'إضافة منتج' : 'Add Product'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isRTL ? 'إضافة منتج جديد' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                          <Input
                            value={newProduct.name_ar}
                            onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                          <Textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                          <Textarea
                            value={newProduct.description_ar}
                            onChange={(e) => setNewProduct({ ...newProduct, description_ar: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>{isRTL ? 'السعر' : 'Price'}</Label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{isRTL ? 'الكمية' : 'Stock'}</Label>
                          <Input
                            type="number"
                            value={newProduct.stock_quantity}
                            onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
                          <Select
                            value={newProduct.category}
                            onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} />
                            </SelectTrigger>
                            <SelectContent>
                              {getSubcategories().map(cat => (
                                <SelectItem key={cat.id} value={isRTL ? cat.name_ar || cat.name : cat.name}>
                                  {isRTL ? cat.name_ar || cat.name : cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>{isRTL ? 'صورة المنتج الرئيسية' : 'Main Product Image'}</Label>
                        <ImageUpload
                          value={newProduct.image_url}
                          onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                          placeholder={isRTL ? 'اختر صورة المنتج الرئيسية' : 'Choose main product image'}
                          folder="products"
                        />
                      </div>
                      <ProductImagesManager
                        isRTL={isRTL}
                        onImagesChange={(imgs) => setNewProductImages(imgs)}
                      />
                      <div>
                        <Label>{isRTL ? 'رابط الفيديو' : 'Video URL'}</Label>
                        <Input
                          value={newProduct.video_url}
                          onChange={(e) => setNewProduct({ ...newProduct, video_url: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{isRTL ? 'طريقة الاستخدام' : 'Usage Instructions'}</Label>
                        <Textarea
                          value={newProduct.usage_instructions}
                          onChange={(e) => setNewProduct({ ...newProduct, usage_instructions: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{isRTL ? 'يناسب من؟' : 'Suitable For'}</Label>
                        <Textarea
                          value={newProduct.suitable_for}
                          onChange={(e) => setNewProduct({ ...newProduct, suitable_for: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newProduct.is_active}
                            onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_active: checked })}
                          />
                          <Label>{isRTL ? 'نشط' : 'Active'}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newProduct.medical_followup_required}
                            onCheckedChange={(checked) => setNewProduct({ ...newProduct, medical_followup_required: checked })}
                          />
                          <Label>{isRTL ? 'متابعة طبية مطلوبة' : 'Medical Follow-up Required'}</Label>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">
                      {isRTL ? 'إضافة المنتج' : 'Add Product'}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">{isRTL ? product.name_ar || product.name : product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {isRTL ? product.description_ar || product.description : product.description}
                            </p>
                          </div>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? 'المخزون:' : 'Stock:'} {product.stock_quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {product.medical_followup_required && (
                          <Badge variant="outline" className="mt-2 bg-orange-500/10 text-orange-500 border-orange-500/20">
                            {isRTL ? 'متابعة طبية مطلوبة' : 'Medical Follow-up Required'}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
