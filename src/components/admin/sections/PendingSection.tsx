import { motion } from 'framer-motion';
import { Clock, Users, Stethoscope, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  specialization: string | null;
  avatar_url: string | null;
  status: string;
  role: string;
}

interface PendingSectionProps {
  pendingUsers: UserWithRole[];
  onApprove: (userId: string) => Promise<{ error: Error | null }>;
  onReject: (userId: string) => Promise<{ error: Error | null }>;
}

export const PendingSection = ({
  pendingUsers,
  onApprove,
  onReject
}: PendingSectionProps) => {
  const { isRTL } = useLanguage();

  const handleApprove = async (userId: string) => {
    const { error } = await onApprove(userId);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ أثناء الموافقة' : 'Error approving user');
    } else {
      toast.success(isRTL ? 'تمت الموافقة بنجاح' : 'User approved successfully');
    }
  };

  const handleReject = async (userId: string) => {
    const { error } = await onReject(userId);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ أثناء الرفض' : 'Error rejecting user');
    } else {
      toast.success(isRTL ? 'تم الرفض' : 'User rejected');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      doctor: 'bg-primary/20 text-primary',
      client: 'bg-accent/20 text-accent'
    };
    const labels: Record<string, string> = {
      doctor: isRTL ? 'طبيب' : 'Doctor',
      client: isRTL ? 'عميل' : 'Client'
    };
    return (
      <Badge className={styles[role] || ''}>
        {labels[role] || role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'طلبات الموافقة' : 'Pending Approvals'}</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {pendingUsers.length} {isRTL ? 'طلب' : 'request(s)'}
        </Badge>
      </div>

      {/* Pending Users List */}
      <div className="space-y-3">
        {pendingUsers.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>{isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
            </CardContent>
          </Card>
        ) : (
          pendingUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-12 w-12 border-2 border-yellow-500/30">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-yellow-500/20">
                          {user.role === 'doctor' ? (
                            <Stethoscope className="h-6 w-6 text-yellow-500" />
                          ) : (
                            <Users className="h-6 w-6 text-yellow-500" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {getRoleBadge(user.role)}
                          {user.specialization && (
                            <span className="text-xs text-muted-foreground">
                              {user.specialization}
                            </span>
                          )}
                        </div>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button 
                        size="sm" 
                        className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30"
                        onClick={() => handleApprove(user.user_id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isRTL ? 'موافقة' : 'Approve'}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30"
                        onClick={() => handleReject(user.user_id)}
                      >
                        <XCircle className="h-4 w-4" />
                        {isRTL ? 'رفض' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
