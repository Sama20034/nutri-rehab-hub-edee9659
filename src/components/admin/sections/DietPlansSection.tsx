import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { DietPlan } from '@/hooks/useAdminExercisesData';
import { toast } from 'sonner';

interface DietPlansSectionProps {
  dietPlans: DietPlan[];
  onAdd: (plan: Omit<DietPlan, 'id' | 'created_at'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<DietPlan>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const goals = ['تخسيس', 'زيادة الوزن', 'بناء العضلات', 'صحة عامة'];
const statuses = ['active', 'inactive'];

export const DietPlansSection = ({
  dietPlans,
  onAdd,
  onUpdate,
  onDelete
}: DietPlansSectionProps) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    goal: 'تخسيس',
    calories_min: '',
    calories_max: '',
    duration_weeks: '',
    status: 'active',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      goal: 'تخسيس',
      calories_min: '',
      calories_max: '',
      duration_weeks: '',
      status: 'active',
      description: ''
    });
    setEditingPlan(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم النظام' : 'Please enter plan name');
      return;
    }

    const planData = {
      created_by: user?.id || null,
      name: formData.name,
      goal: formData.goal,
      calories_min: formData.calories_min ? parseInt(formData.calories_min) : null,
      calories_max: formData.calories_max ? parseInt(formData.calories_max) : null,
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
      status: formData.status,
      description: formData.description || null
    };

    let result;
    if (editingPlan) {
      result = await onUpdate(editingPlan.id, planData);
    } else {
      result = await onAdd(planData);
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? (editingPlan ? 'تم تحديث النظام' : 'تم إضافة النظام') : (editingPlan ? 'Plan updated' : 'Plan added'));
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (plan: DietPlan) => {
    setFormData({
      name: plan.name,
      goal: plan.goal || 'تخسيس',
      calories_min: plan.calories_min?.toString() || '',
      calories_max: plan.calories_max?.toString() || '',
      duration_weeks: plan.duration_weeks?.toString() || '',
      status: plan.status || 'active',
      description: plan.description || ''
    });
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? 'تم حذف النظام' : 'Plan deleted');
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === 'active'
      ? <Badge className="bg-green-500">{isRTL ? 'نشط' : 'Active'}</Badge>
      : <Badge className="bg-gray-500">{isRTL ? 'غير نشط' : 'Inactive'}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'الأنظمة الغذائية' : 'Diet Plans'}</h1>
        <Button variant="default" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة نظام جديد' : 'Add New Plan'}
        </Button>
      </div>

      {/* Plan count */}
      <Badge variant="secondary" className="text-sm">
        {dietPlans.length} {isRTL ? 'نظام غذائي' : 'Diet Plan(s)'}
      </Badge>

      {/* Table */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'الهدف' : 'Goal'}</TableHead>
              <TableHead>{isRTL ? 'السعرات' : 'Calories'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead>{isRTL ? 'المدة' : 'Duration'}</TableHead>
              <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dietPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد أنظمة غذائية' : 'No diet plans found'}</p>
                </TableCell>
              </TableRow>
            ) : (
              dietPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>{plan.name}</TableCell>
                  <TableCell>{plan.goal || '-'}</TableCell>
                  <TableCell>
                    {plan.calories_min && plan.calories_max
                      ? `${plan.calories_min}-${plan.calories_max}`
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>
                    {plan.duration_weeks ? `${plan.duration_weeks} ${isRTL ? 'أسبوع' : 'weeks'}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(plan.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? (isRTL ? 'تعديل النظام الغذائي' : 'Edit Diet Plan') : (isRTL ? 'إضافة نظام غذائي جديد' : 'Add New Diet Plan')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'اسم النظام' : 'Plan Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isRTL ? 'مثال: نظام كيتو متقدم' : 'e.g., Advanced Keto'}
              />
            </div>
            <div>
              <Label>{isRTL ? 'الهدف' : 'Goal'}</Label>
              <Select value={formData.goal} onValueChange={(v) => setFormData({ ...formData, goal: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goals.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'السعرات (من)' : 'Calories (from)'}</Label>
                <Input
                  type="number"
                  value={formData.calories_min}
                  onChange={(e) => setFormData({ ...formData, calories_min: e.target.value })}
                  placeholder="1200"
                />
              </div>
              <div>
                <Label>{isRTL ? 'السعرات (إلى)' : 'Calories (to)'}</Label>
                <Input
                  type="number"
                  value={formData.calories_max}
                  onChange={(e) => setFormData({ ...formData, calories_max: e.target.value })}
                  placeholder="1500"
                />
              </div>
            </div>
            <div>
              <Label>{isRTL ? 'المدة (بالأسابيع)' : 'Duration (weeks)'}</Label>
              <Input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                placeholder="4"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>{s === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'وصف النظام...' : 'Plan description...'}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit}>
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
