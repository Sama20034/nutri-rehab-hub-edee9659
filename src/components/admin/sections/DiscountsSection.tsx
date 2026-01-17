import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, Plus, Edit, Trash2, Calendar, Percent, 
  DollarSign, Users, Clock, CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { toast } from '@/hooks/use-toast';

interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTo: 'all' | 'subscriptions' | 'products';
}

export const DiscountsSection = () => {
  const { isRTL } = useLanguage();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Demo discounts - in real app, these would come from database
  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: '1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      minPurchase: 500,
      maxUses: 100,
      currentUses: 45,
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      isActive: true,
      applicableTo: 'all'
    },
    {
      id: '2',
      code: 'SUPPLEMENTS500',
      type: 'fixed',
      value: 500,
      minPurchase: 5000,
      maxUses: 50,
      currentUses: 12,
      startDate: '2026-01-15',
      endDate: '2026-01-31',
      isActive: true,
      applicableTo: 'products'
    },
    {
      id: '3',
      code: 'SUBSCRIBE15',
      type: 'percentage',
      value: 15,
      minPurchase: 0,
      maxUses: 200,
      currentUses: 78,
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      isActive: true,
      applicableTo: 'subscriptions'
    }
  ]);

  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxUses: 100,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableTo: 'all' as 'all' | 'subscriptions' | 'products'
  });

  const handleAddDiscount = () => {
    const discount: Discount = {
      id: Date.now().toString(),
      ...newDiscount,
      currentUses: 0
    };
    setDiscounts([...discounts, discount]);
    setIsAddOpen(false);
    setNewDiscount({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      maxUses: 100,
      startDate: '',
      endDate: '',
      isActive: true,
      applicableTo: 'all'
    });
    toast({
      title: isRTL ? 'تم بنجاح' : 'Success',
      description: isRTL ? 'تم إضافة الخصم' : 'Discount added successfully'
    });
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
    toast({
      title: isRTL ? 'تم بنجاح' : 'Success',
      description: isRTL ? 'تم حذف الخصم' : 'Discount deleted'
    });
  };

  const toggleDiscount = (id: string) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
  };

  const getApplicableLabel = (type: string) => {
    switch (type) {
      case 'all': return isRTL ? 'الكل' : 'All';
      case 'subscriptions': return isRTL ? 'الاشتراكات' : 'Subscriptions';
      case 'products': return isRTL ? 'المنتجات' : 'Products';
      default: return type;
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold">{isRTL ? 'إدارة الخصومات' : 'Discounts Management'}</h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إنشاء وإدارة أكواد الخصم' : 'Create and manage discount codes'}
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة خصم' : 'Add Discount'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'إضافة كود خصم جديد' : 'Add New Discount Code'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>{isRTL ? 'كود الخصم' : 'Discount Code'}</Label>
                <Input
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'نوع الخصم' : 'Discount Type'}</Label>
                  <Select
                    value={newDiscount.type}
                    onValueChange={(value: 'percentage' | 'fixed') => setNewDiscount({ ...newDiscount, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{isRTL ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                      <SelectItem value="fixed">{isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'القيمة' : 'Value'}</Label>
                  <Input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'الحد الأدنى للشراء' : 'Min Purchase'}</Label>
                  <Input
                    type="number"
                    value={newDiscount.minPurchase}
                    onChange={(e) => setNewDiscount({ ...newDiscount, minPurchase: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'الحد الأقصى للاستخدام' : 'Max Uses'}</Label>
                  <Input
                    type="number"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount({ ...newDiscount, maxUses: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>{isRTL ? 'يطبق على' : 'Applies To'}</Label>
                <Select
                  value={newDiscount.applicableTo}
                  onValueChange={(value: 'all' | 'subscriptions' | 'products') => setNewDiscount({ ...newDiscount, applicableTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="subscriptions">{isRTL ? 'الاشتراكات فقط' : 'Subscriptions Only'}</SelectItem>
                    <SelectItem value="products">{isRTL ? 'المنتجات فقط' : 'Products Only'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={newDiscount.startDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={newDiscount.endDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newDiscount.isActive}
                  onCheckedChange={(checked) => setNewDiscount({ ...newDiscount, isActive: checked })}
                />
                <Label>{isRTL ? 'نشط' : 'Active'}</Label>
              </div>
            </div>
            <Button onClick={handleAddDiscount} className="w-full">
              {isRTL ? 'إضافة الخصم' : 'Add Discount'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{discounts.length}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الخصومات' : 'Total Discounts'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{discounts.filter(d => d.isActive && !isExpired(d.endDate)).length}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{discounts.reduce((sum, d) => sum + d.currentUses, 0)}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الاستخدام' : 'Total Uses'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{discounts.filter(d => isExpired(d.endDate)).length}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'منتهي الصلاحية' : 'Expired'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((discount, index) => (
          <motion.div
            key={discount.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`bg-card border-border ${isExpired(discount.endDate) ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${discount.isActive && !isExpired(discount.endDate) ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Tag className={`h-5 w-5 ${discount.isActive && !isExpired(discount.endDate) ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{discount.code}</p>
                      <Badge variant="outline" className="text-xs">
                        {getApplicableLabel(discount.applicableTo)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={() => toggleDiscount(discount.id)}
                      disabled={isExpired(discount.endDate)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDiscount(discount.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Discount Value */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5">
                    <span className="text-sm text-muted-foreground">
                      {isRTL ? 'قيمة الخصم' : 'Discount Value'}
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      {discount.type === 'percentage' ? (
                        <>
                          <Percent className="h-4 w-4" />
                          {discount.value}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4" />
                          {discount.value} {isRTL ? 'ج.م' : 'EGP'}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{isRTL ? 'الاستخدام' : 'Usage'}</span>
                    <span>{discount.currentUses} / {discount.maxUses}</span>
                  </div>

                  {/* Min Purchase */}
                  {discount.minPurchase > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isRTL ? 'الحد الأدنى' : 'Min Purchase'}</span>
                      <span>{discount.minPurchase} {isRTL ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {isRTL ? 'الفترة' : 'Period'}
                    </span>
                    <span className="text-xs">
                      {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isExpired(discount.endDate) && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      {isRTL ? 'منتهي الصلاحية' : 'Expired'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {discounts.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{isRTL ? 'لا توجد خصومات' : 'No discounts available'}</p>
            <p className="text-sm">{isRTL ? 'أضف خصم جديد للبدء' : 'Add a new discount to get started'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
