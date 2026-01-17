import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { DietPlan } from '@/hooks/useDoctorData';
import { toast } from 'sonner';

interface DietPlansSectionProps {
  dietPlans: DietPlan[];
  doctorId: string;
  onAdd: (plan: Omit<DietPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, updates: Partial<DietPlan>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const goals = ['تخسيس', 'زيادة الوزن', 'بناء العضلات', 'صحة عامة'];
const statuses = ['مجاني', 'مدفوع'];

export const DietPlansSection = ({
  dietPlans,
  doctorId,
  onAdd,
  onUpdate,
  onDelete
}: DietPlansSectionProps) => {
  const { isRTL } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    goal: 'تخسيس',
    calories_min: '',
    calories_max: '',
    duration_days: '',
    status: 'مجاني',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      goal: 'تخسيس',
      calories_min: '',
      calories_max: '',
      duration_days: '',
      status: 'مجاني',
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
      doctor_id: doctorId,
      name: formData.name,
      goal: formData.goal,
      calories_min: formData.calories_min ? parseInt(formData.calories_min) : null,
      calories_max: formData.calories_max ? parseInt(formData.calories_max) : null,
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
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
      duration_days: plan.duration_days?.toString() || '',
      status: plan.status || 'مجاني',
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
    return status === 'مدفوع' 
      ? <Badge className="bg-purple-500">{status}</Badge>
      : <Badge className="bg-blue-500">{status || 'مجاني'}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة نظام جديد' : 'Add New Plan'}
            </Button>
          </DialogTrigger>
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
                <Label>{isRTL ? 'المدة (بالأيام)' : 'Duration (days)'}</Label>
                <Input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  placeholder="7"
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
                      <SelectItem key={s} value={s}>{s}</SelectItem>
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
              <Button onClick={handleSubmit} className="w-full">
                {editingPlan ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <h1 className="text-2xl font-bold">{isRTL ? 'الأنظمة الغذائية' : 'Diet Plans'}</h1>
      </div>

      {/* Plan count */}
      <div className="text-right text-muted-foreground">
        {isRTL ? `نظام غذائي ${dietPlans.length}` : `${dietPlans.length} Diet Plan(s)`}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm">
          <div className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</div>
          <div className="text-center">{isRTL ? 'المدة' : 'Duration'}</div>
          <div className="text-center">{isRTL ? 'الحالة' : 'Status'}</div>
          <div className="text-center">{isRTL ? 'السعرات' : 'Calories'}</div>
          <div className="text-center">{isRTL ? 'الهدف' : 'Goal'}</div>
          <div className="text-right">{isRTL ? 'الاسم' : 'Name'}</div>
        </div>

        {dietPlans.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {isRTL ? 'لا توجد أنظمة غذائية' : 'No diet plans found'}
          </div>
        ) : (
          dietPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-6 gap-4 p-4 border-t border-border items-center hover:bg-muted/30"
            >
              <div className="flex justify-center gap-2">
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-muted-foreground">
                {plan.duration_days ? `${plan.duration_days} ${isRTL ? 'يوم' : 'days'}` : '-'}
              </div>
              <div className="text-center">{getStatusBadge(plan.status)}</div>
              <div className="text-center text-muted-foreground">
                {plan.calories_min && plan.calories_max 
                  ? `${plan.calories_min}-${plan.calories_max}` 
                  : '-'}
              </div>
              <div className="text-center text-muted-foreground">{plan.goal || '-'}</div>
              <div className="text-right font-medium">{plan.name}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
