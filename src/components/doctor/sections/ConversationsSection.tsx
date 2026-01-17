import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const ConversationsSection = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRTL ? 'المحادثات' : 'Conversations'}</h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'تواصل مع عملائك' : 'Communicate with your clients'}
        </p>
      </div>

      <div className="text-center py-12 bg-card rounded-2xl border border-border">
        <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">
          {isRTL ? 'نظام المحادثات قيد التطوير' : 'Conversations system coming soon'}
        </p>
      </div>
    </div>
  );
};
