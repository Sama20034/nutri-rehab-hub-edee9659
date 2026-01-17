import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Search, Filter, CheckCircle, XCircle, Clock,
  Eye, DollarSign, Calendar, User
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  created_at: string;
  sender_name: string | null;
  sender_phone: string | null;
  package_id: string | null;
  receipt_url: string | null;
  profile?: {
    full_name: string | null;
  };
}

interface PaymentsSectionProps {
  payments: Payment[];
  onUpdateStatus: (paymentId: string, status: string) => Promise<{ error: Error | null }>;
}

export const PaymentsSection = ({ payments, onUpdateStatus }: PaymentsSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'approved': 
      case 'verified': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subscription': return 'bg-primary/10 text-primary border-primary/20';
      case 'product': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.payment_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    const { error } = await onUpdateStatus(paymentId, status);
    if (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم تحديث حالة الدفع' : 'Payment status updated'
      });
    }
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved' || p.status === 'verified').length,
    totalAmount: payments
      .filter(p => p.status === 'approved' || p.status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة المدفوعات' : 'Payments Management'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'مراجعة واعتماد المدفوعات والاشتراكات' : 'Review and approve payments and subscriptions'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المدفوعات' : 'Total Payments'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'في الانتظار' : 'Pending'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'معتمد' : 'Approved'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المبلغ' : 'Total Amount'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className={`flex flex-wrap items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                <SelectItem value="approved">{isRTL ? 'معتمد' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="subscription">{isRTL ? 'اشتراك' : 'Subscription'}</SelectItem>
                <SelectItem value="product">{isRTL ? 'منتج' : 'Product'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'المرسل' : 'Sender'}</TableHead>
                  <TableHead>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead>{isRTL ? 'طريقة الدفع' : 'Method'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد مدفوعات' : 'No payments found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.sender_name || payment.profile?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{payment.sender_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">{payment.amount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(payment.payment_type)}>
                          {payment.payment_type === 'subscription' ? (isRTL ? 'اشتراك' : 'Subscription') : (isRTL ? 'منتج' : 'Product')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{payment.payment_method}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.receipt_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleUpdateStatus(payment.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleUpdateStatus(payment.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إيصال الدفع' : 'Payment Receipt'}</DialogTitle>
          </DialogHeader>
          {selectedPayment?.receipt_url && (
            <div className="space-y-4">
              <img
                src={selectedPayment.receipt_url}
                alt="Receipt"
                className="w-full rounded-lg border border-border"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{isRTL ? 'المبلغ' : 'Amount'}</p>
                  <p className="font-bold">{selectedPayment.amount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isRTL ? 'التاريخ' : 'Date'}</p>
                  <p className="font-medium">{new Date(selectedPayment.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
