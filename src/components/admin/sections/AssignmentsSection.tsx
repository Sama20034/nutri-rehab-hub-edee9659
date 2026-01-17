import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Stethoscope, UserPlus, ArrowLeftRight, Trash2 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ClientAssignment {
  id: string;
  client_id: string;
  doctor_id: string;
  assigned_at: string;
  status: string;
  notes: string | null;
}

interface AssignmentsSectionProps {
  clients: UserWithRole[];
  doctors: UserWithRole[];
  assignments: ClientAssignment[];
  onAssign: (clientId: string, doctorId: string) => Promise<{ error: Error | null }>;
  onTransfer: (clientId: string, fromDoctorId: string, toDoctorId: string) => Promise<{ error: Error | null }>;
  onDelete: (assignmentId: string) => Promise<{ error: Error | null }>;
}

export const AssignmentsSection = ({
  clients,
  doctors,
  assignments,
  onAssign,
  onTransfer,
  onDelete
}: AssignmentsSectionProps) => {
  const { isRTL } = useLanguage();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  const approvedClients = clients.filter(c => c.status === 'approved');
  const approvedDoctors = doctors.filter(d => d.status === 'approved');
  
  const unassignedClients = approvedClients.filter(
    c => !assignments.find(a => a.client_id === c.user_id && a.status === 'active')
  );

  const getDoctorClients = (doctorId: string) => {
    const doctorAssignments = assignments.filter(
      a => a.doctor_id === doctorId && a.status === 'active'
    );
    return doctorAssignments.map(a => {
      const client = clients.find(c => c.user_id === a.client_id);
      return { ...a, client };
    });
  };

  const handleAssign = async () => {
    if (!selectedClient || !selectedDoctor) return;
    const { error } = await onAssign(selectedClient, selectedDoctor);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ أثناء التعيين' : 'Error assigning client');
    } else {
      toast.success(isRTL ? 'تم التعيين بنجاح' : 'Client assigned successfully');
      setAssignDialogOpen(false);
      setSelectedClient('');
      setSelectedDoctor('');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    const { error } = await onDelete(assignmentId);
    if (error) {
      toast.error(isRTL ? 'حدث خطأ' : 'Error');
    } else {
      toast.success(isRTL ? 'تم حذف التعيين' : 'Assignment deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'تعيين العملاء للأطباء' : 'Client Assignments'}</h1>
        <Button variant="hero" onClick={() => setAssignDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          {isRTL ? 'تعيين عميل' : 'Assign Client'}
        </Button>
      </div>

      {/* Unassigned Clients */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {isRTL ? 'عملاء غير معينين' : 'Unassigned Clients'}
            </h2>
            <Badge variant="secondary">{unassignedClients.length}</Badge>
          </div>
          
          {unassignedClients.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isRTL ? 'جميع العملاء معينين لأطباء' : 'All clients are assigned to doctors'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassignedClients.map(client => (
                <Badge 
                  key={client.id} 
                  variant="outline" 
                  className="py-2 px-3 cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setSelectedClient(client.user_id);
                    setAssignDialogOpen(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {client.full_name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctors with their clients */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Stethoscope className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{isRTL ? 'الأطباء وعملائهم' : 'Doctors and their Clients'}</h2>
          </div>

          <div className="space-y-4">
            {approvedDoctors.map((doctor, index) => {
              const doctorClients = getDoctorClients(doctor.user_id);
              
              return (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-xl p-4"
                >
                  {/* Doctor Header */}
                  <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={doctor.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-semibold">{doctor.full_name}</h3>
                      {doctor.specialization && (
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {doctorClients.length} {isRTL ? 'عميل' : 'client(s)'}
                    </Badge>
                  </div>

                  {/* Client Assignments */}
                  {doctorClients.length > 0 ? (
                    <div className="space-y-2">
                      {doctorClients.map(({ id, client }) => (
                        <div 
                          key={id} 
                          className={`flex items-center justify-between p-2 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-accent/20">
                                <Users className="h-4 w-4 text-accent" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{client?.full_name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Select
                              onValueChange={(newDoctorId) => {
                                if (client && newDoctorId !== doctor.user_id) {
                                  onTransfer(client.user_id, doctor.user_id, newDoctorId);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder={doctor.full_name} />
                              </SelectTrigger>
                              <SelectContent>
                                {approvedDoctors.map((d) => (
                                  <SelectItem key={d.user_id} value={d.user_id}>
                                    {d.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      {isRTL ? 'لا يوجد عملاء' : 'No clients assigned'}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعيين عميل لطبيب' : 'Assign Client to Doctor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'اختر العميل' : 'Select Client'}</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر عميل...' : 'Select client...'} />
                </SelectTrigger>
                <SelectContent>
                  {unassignedClients.map((client) => (
                    <SelectItem key={client.user_id} value={client.user_id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{isRTL ? 'اختر الطبيب' : 'Select Doctor'}</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر طبيب...' : 'Select doctor...'} />
                </SelectTrigger>
                <SelectContent>
                  {approvedDoctors.map((doctor) => (
                    <SelectItem key={doctor.user_id} value={doctor.user_id}>
                      {doctor.full_name} {doctor.specialization && `- ${doctor.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="hero" onClick={handleAssign} disabled={!selectedClient || !selectedDoctor}>
              {isRTL ? 'تعيين' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
