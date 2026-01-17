import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Trash2, Eye, User, Phone, Calendar, Dumbbell, Utensils, FileText, Activity, Heart, Package, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserWithRole } from '@/hooks/useAdminData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ClientsSectionProps {
  clients: UserWithRole[];
  onApprove: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onEdit?: (client: UserWithRole) => void;
  onDelete?: (client: UserWithRole) => void;
}

interface ClientDetails {
  exercises: Array<{ id: string; name: string; completed: boolean; created_at: string }>;
  dietPlans: Array<{ id: string; name: string; status: string; start_date: string }>;
  notes: Array<{ id: string; title: string; type: string; created_at: string }>;
  measurements: Array<{ id: string; measurement_type: string; value: number; unit: string; recorded_at: string }>;
  appointments: Array<{ id: string; scheduled_at: string; status: string; doctor_name?: string }>;
}

export const ClientsSection = ({
  clients,
  onApprove,
  onSuspend,
  onEdit,
  onDelete
}: ClientsSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<UserWithRole | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  const handleToggleStatus = (client: UserWithRole) => {
    if (client.status === 'approved') {
      onSuspend(client.user_id);
    } else {
      onApprove(client.user_id);
    }
  };

  const handleViewClient = async (client: UserWithRole) => {
    setSelectedClient(client);
    setDetailsLoading(true);
    
    try {
      // Fetch client exercises
      const { data: clientExercises } = await supabase
        .from('client_exercises')
        .select('id, completed, created_at, exercise_id')
        .eq('client_id', client.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get exercise names
      const exerciseIds = clientExercises?.map(e => e.exercise_id) || [];
      const { data: exercises } = await supabase
        .from('exercises')
        .select('id, name')
        .in('id', exerciseIds);

      // Fetch client diet plans
      const { data: clientDietPlans } = await supabase
        .from('client_diet_plans')
        .select('id, status, start_date, diet_plan_id')
        .eq('client_id', client.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get diet plan names
      const dietPlanIds = clientDietPlans?.map(d => d.diet_plan_id) || [];
      const { data: dietPlans } = await supabase
        .from('diet_plans')
        .select('id, name')
        .in('id', dietPlanIds);

      // Fetch medical notes
      const { data: notes } = await supabase
        .from('medical_notes')
        .select('id, title, type, created_at')
        .eq('client_id', client.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch health measurements
      const { data: measurements } = await supabase
        .from('health_measurements')
        .select('id, measurement_type, value, unit, recorded_at')
        .eq('client_id', client.user_id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, scheduled_at, status, doctor_id')
        .eq('client_id', client.user_id)
        .order('scheduled_at', { ascending: false })
        .limit(10);

      // Get doctor names
      const doctorIds = appointments?.map(a => a.doctor_id) || [];
      const { data: doctors } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', doctorIds);

      setClientDetails({
        exercises: clientExercises?.map(e => ({
          id: e.id,
          name: exercises?.find(ex => ex.id === e.exercise_id)?.name || 'Unknown',
          completed: e.completed || false,
          created_at: e.created_at
        })) || [],
        dietPlans: clientDietPlans?.map(d => ({
          id: d.id,
          name: dietPlans?.find(dp => dp.id === d.diet_plan_id)?.name || 'Unknown',
          status: d.status || 'active',
          start_date: d.start_date || ''
        })) || [],
        notes: notes || [],
        measurements: measurements || [],
        appointments: appointments?.map(a => ({
          id: a.id,
          scheduled_at: a.scheduled_at,
          status: a.status || 'pending',
          doctor_name: doctors?.find(d => d.user_id === a.doctor_id)?.full_name || undefined
        })) || []
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة العملاء' : 'Manage Clients'}</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {clients.length} {isRTL ? 'عميل' : 'client(s)'}
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={isRTL ? 'بحث...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'} bg-muted/50`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد عملاء' : 'No clients found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Client Info */}
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-12 w-12 border-2 border-accent/30">
                        <AvatarImage src={client.avatar_url || undefined} />
                        <AvatarFallback className="bg-accent/20">
                          <Users className="h-6 w-6 text-accent" />
                        </AvatarFallback>
                      </Avatar>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="font-semibold">{client.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={client.status === 'approved' ? 'default' : 'secondary'}
                            className={client.status === 'approved' 
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {client.status === 'approved' 
                              ? (isRTL ? 'موافق عليه' : 'Approved') 
                              : (isRTL ? 'معلق' : 'Pending')
                            }
                          </Badge>
                        </div>
                        {client.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{client.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewClient(client)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {isRTL ? 'عرض الملف' : 'View Profile'}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={client.status === 'approved'}
                        onCheckedChange={() => handleToggleStatus(client)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onEdit?.(client)}
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onDelete?.(client)}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedClient?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{selectedClient?.full_name}</h3>
                <p className="text-sm text-muted-foreground font-normal">{selectedClient?.phone}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : clientDetails && (
            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="profile" className="gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'الملف الصحي' : 'Profile'}</span>
                </TabsTrigger>
                <TabsTrigger value="appointments" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'المواعيد' : 'Appointments'}</span>
                </TabsTrigger>
                <TabsTrigger value="exercises" className="gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'التمارين' : 'Exercises'}</span>
                </TabsTrigger>
                <TabsTrigger value="diet" className="gap-1">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'الأنظمة' : 'Diet'}</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'الملاحظات' : 'Notes'}</span>
                </TabsTrigger>
                <TabsTrigger value="measurements" className="gap-1">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? 'القياسات' : 'Measures'}</span>
                </TabsTrigger>
              </TabsList>

              {/* Health Profile Tab */}
              <TabsContent value="profile" className="mt-4 space-y-4">
                <div className="grid gap-4">
                  {/* Basic Info Card */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {isRTL ? 'البيانات الأساسية' : 'Basic Information'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'الاسم الكامل' : 'Full Name'}</p>
                            <p className="font-medium">{selectedClient?.full_name || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'رقم الهاتف' : 'Phone'}</p>
                            <p className="font-medium" dir="ltr">{selectedClient?.phone || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'الباقة المختارة' : 'Selected Package'}</p>
                            <p className="font-medium">{selectedClient?.selected_package || (isRTL ? 'لم يتم الاختيار' : 'Not selected')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</p>
                            <p className="font-medium">{selectedClient?.payment_method || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {isRTL ? 'حالة الحساب' : 'Account Status'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <div className={`w-3 h-3 rounded-full ${selectedClient?.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'حالة الحساب' : 'Status'}</p>
                            <p className="font-medium">
                              {selectedClient?.status === 'approved' 
                                ? (isRTL ? 'موافق عليه' : 'Approved') 
                                : (isRTL ? 'معلق' : 'Pending')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <Heart className={`h-5 w-5 ${selectedClient?.medical_followup ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'المتابعة الطبية' : 'Medical Followup'}</p>
                            <p className="font-medium">
                              {selectedClient?.medical_followup 
                                ? (isRTL ? 'مفعّل' : 'Enabled') 
                                : (isRTL ? 'غير مفعّل' : 'Disabled')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'تاريخ التسجيل' : 'Registration Date'}</p>
                            <p className="font-medium">
                              {selectedClient?.created_at 
                                ? format(new Date(selectedClient.created_at), 'PPP', { locale: isRTL ? ar : undefined })
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'الدور' : 'Role'}</p>
                            <p className="font-medium">{selectedClient?.role || 'client'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <Card className="bg-blue-500/10 border-blue-500/20">
                      <CardContent className="p-3 text-center">
                        <Dumbbell className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{clientDetails?.exercises.length || 0}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'تمارين' : 'Exercises'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                      <CardContent className="p-3 text-center">
                        <Utensils className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{clientDetails?.dietPlans.length || 0}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'أنظمة' : 'Diets'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-500/20">
                      <CardContent className="p-3 text-center">
                        <FileText className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{clientDetails?.notes.length || 0}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'ملاحظات' : 'Notes'}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-3 text-center">
                        <Calendar className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-lg font-bold">{clientDetails?.appointments.length || 0}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'مواعيد' : 'Appointments'}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-4 space-y-3">
                {clientDetails.appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا توجد مواعيد' : 'No appointments'}</p>
                ) : (
                  clientDetails.appointments.map(apt => (
                    <Card key={apt.id} className="bg-muted/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {format(new Date(apt.scheduled_at), 'PPP p', { locale: isRTL ? ar : undefined })}
                          </p>
                          {apt.doctor_name && (
                            <p className="text-sm text-muted-foreground">{apt.doctor_name}</p>
                          )}
                        </div>
                        <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                          {apt.status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') : 
                           apt.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : 
                           (isRTL ? 'معلق' : 'Pending')}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="exercises" className="mt-4 space-y-3">
                {clientDetails.exercises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا توجد تمارين' : 'No exercises assigned'}</p>
                ) : (
                  clientDetails.exercises.map(ex => (
                    <Card key={ex.id} className="bg-muted/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Dumbbell className="h-5 w-5 text-primary" />
                          <span>{ex.name}</span>
                        </div>
                        <Badge variant={ex.completed ? 'default' : 'secondary'}>
                          {ex.completed ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'قيد التنفيذ' : 'In Progress')}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="diet" className="mt-4 space-y-3">
                {clientDetails.dietPlans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا توجد أنظمة غذائية' : 'No diet plans assigned'}</p>
                ) : (
                  clientDetails.dietPlans.map(plan => (
                    <Card key={plan.id} className="bg-muted/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Utensils className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            {plan.start_date && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(plan.start_date), 'PPP', { locale: isRTL ? ar : undefined })}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'منتهي' : 'Ended')}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-4 space-y-3">
                {clientDetails.notes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا توجد ملاحظات' : 'No notes'}</p>
                ) : (
                  clientDetails.notes.map(note => (
                    <Card key={note.id} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-500" />
                            <span className="font-medium">{note.title}</span>
                          </div>
                          <Badge variant="outline">{note.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.created_at), 'PPP', { locale: isRTL ? ar : undefined })}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="measurements" className="mt-4 space-y-3">
                {clientDetails.measurements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{isRTL ? 'لا توجد قياسات' : 'No measurements'}</p>
                ) : (
                  clientDetails.measurements.map(m => (
                    <Card key={m.id} className="bg-muted/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-orange-500" />
                          <span className="capitalize">{m.measurement_type}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{m.value} {m.unit}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(m.recorded_at), 'PPP', { locale: isRTL ? ar : undefined })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
