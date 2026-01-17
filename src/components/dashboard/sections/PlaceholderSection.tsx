import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderSectionProps {
  isRTL: boolean;
  title: string;
  description: string;
}

export const PlaceholderSection = ({ isRTL, title, description }: PlaceholderSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Construction className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </motion.div>
  );
};
