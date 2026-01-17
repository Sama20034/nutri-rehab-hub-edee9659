import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderSectionProps {
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const PlaceholderSection = ({
  icon: Icon,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn
}: PlaceholderSectionProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isRTL ? titleAr : titleEn}</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isRTL ? 'قريباً...' : 'Coming Soon...'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isRTL ? descriptionAr : descriptionEn}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
