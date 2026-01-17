import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, Pill, Apple, ThumbsUp, ThumbsDown, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HealthProfileSectionProps {
  isRTL: boolean;
}

export const HealthProfileSection = ({ isRTL }: HealthProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [healthData, setHealthData] = useState({
    allergies: ['حساسيه'],
    diseases: ['انيميا'],
    medications: ['انيميا'],
    supplements: ['مكملات'],
    favoriteFoods: ['سمك'],
    dislikedFoods: ['كشري']
  });

  const [editForm, setEditForm] = useState({ ...healthData });

  const handleSave = () => {
    setHealthData({ ...editForm });
    setIsEditing(false);
  };

  const InfoCard = ({ 
    title, 
    icon, 
    items, 
    colorClass 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    items: string[]; 
    colorClass: string;
  }) => (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="px-4 py-2 rounded-lg bg-muted/50 border border-border">
              <span className="text-sm">{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'لا توجد بيانات' : 'No data'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'ملفي الصحي' : 'Health Profile'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'أدخل معلوماتك الصحية ليتمكن الطبيب من تخصيص برنامجك' 
                : 'Enter your health information so your doctor can customize your program'}
            </p>
          </div>
        </div>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تعديل الملف الصحي' : 'Edit Health Profile'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الحساسيات (مفصولة بفاصلة)' : 'Allergies (comma separated)'}
                </label>
                <Input
                  value={editForm.allergies.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الأمراض (مفصولة بفاصلة)' : 'Diseases (comma separated)'}
                </label>
                <Input
                  value={editForm.diseases.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, diseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الأدوية (مفصولة بفاصلة)' : 'Medications (comma separated)'}
                </label>
                <Input
                  value={editForm.medications.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'المكملات (مفصولة بفاصلة)' : 'Supplements (comma separated)'}
                </label>
                <Input
                  value={editForm.supplements.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, supplements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الأطعمة المفضلة (مفصولة بفاصلة)' : 'Favorite Foods (comma separated)'}
                </label>
                <Input
                  value={editForm.favoriteFoods.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, favoriteFoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'الأطعمة غير المحببة (مفصولة بفاصلة)' : 'Disliked Foods (comma separated)'}
                </label>
                <Input
                  value={editForm.dislikedFoods.join(', ')}
                  onChange={(e) => setEditForm({ ...editForm, dislikedFoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InfoCard
            title={isRTL ? 'الحساسيات' : 'Allergies'}
            icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
            items={healthData.allergies}
            colorClass="bg-orange-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InfoCard
            title={isRTL ? 'الأمراض' : 'Diseases'}
            icon={<Heart className="h-5 w-5 text-red-500" />}
            items={healthData.diseases}
            colorClass="bg-red-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InfoCard
            title={isRTL ? 'الأدوية' : 'Medications'}
            icon={<Pill className="h-5 w-5 text-blue-500" />}
            items={healthData.medications}
            colorClass="bg-blue-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InfoCard
            title={isRTL ? 'المكملات' : 'Supplements'}
            icon={<Apple className="h-5 w-5 text-green-500" />}
            items={healthData.supplements}
            colorClass="bg-green-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InfoCard
            title={isRTL ? 'الأطعمة المفضلة' : 'Favorite Foods'}
            icon={<ThumbsUp className="h-5 w-5 text-primary" />}
            items={healthData.favoriteFoods}
            colorClass="bg-primary/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InfoCard
            title={isRTL ? 'الأطعمة غير المحببة' : 'Disliked Foods'}
            icon={<ThumbsDown className="h-5 w-5 text-destructive" />}
            items={healthData.dislikedFoods}
            colorClass="bg-destructive/20"
          />
        </motion.div>
      </div>
    </div>
  );
};
