import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, ArrowRightLeft, Trash2, User, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  specialization: string | null;
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

interface Props {
  clients: UserWithRole[];
  doctors: UserWithRole[];
  assignments: ClientAssignment[];
  onAssign: (clientId: string, doctorId: string, notes?: string) => Promise<{ error: Error | null }>;
  onTransfer: (clientId: string, fromDoctorId: string, toDoctorId: string) => Promise<{ error: Error | null }>;
  onDelete: (assignmentId: string) => Promise<{ error: Error | null }>;
}

export const ClientAssignmentSection = ({ 
  clients, 
  doctors, 
  assignments, 
  onAssign, 
  onTransfer, 
  onDelete 
}: Props) => {
  const { language } = useLanguage();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedNewDoctor, setSelectedNewDoctor] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentAssignment, setCurrentAssignment] = useState<ClientAssignment | null>(null);

  const approvedClients = clients.filter(c => c.status === 'approved');
  const approvedDoctors = doctors.filter(d => d.status === 'approved');
  
  const unassignedClients = approvedClients.filter(
    c => !assignments.some(a => a.client_id === c.user_id && a.status === 'active')
  );

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.user_id === clientId);
    return client?.full_name || 'غير معروف';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.user_id === doctorId);
    return doctor?.full_name || 'غير معروف';
  };

  const handleAssign = async () => {
    if (!selectedClient || !selectedDoctor) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'اختر العميل والطبيب' : 'Select client and doctor',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await onAssign(selectedClient, selectedDoctor, notes);
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم الإسناد' : 'Assigned',
        description: language === 'ar' ? 'تم إسناد العميل للطبيب بنجاح' : 'Client assigned successfully'
      });
      setAssignDialogOpen(false);
      setSelectedClient('');
      setSelectedDoctor('');
      setNotes('');
    }
  };

  const handleTransfer = async () => {
    if (!currentAssignment || !selectedNewDoctor) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'اختر الطبيب الجديد' : 'Select new doctor',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await onTransfer(currentAssignment.client_id, currentAssignment.doctor_id, selectedNewDoctor);
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم النقل' : 'Transferred',
        description: language === 'ar' ? 'تم نقل العميل بنجاح' : 'Client transferred successfully'
      });
      setTransferDialogOpen(false);
      setCurrentAssignment(null);
      setSelectedNewDoctor('');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    const { error } = await onDelete(assignmentId);
    if (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الإسناد بنجاح' : 'Assignment deleted successfully'
      });
    }
  };

  const openTransferDialog = (assignment: ClientAssignment) => {
    setCurrentAssignment(assignment);
    setTransferDialogOpen(true);
  };

  const activeAssignments = assignments.filter(a => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Unassigned Clients Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'ar' ? 'عملاء بدون إسناد' : 'Unassigned Clients'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? `${unassignedClients.length} عميل بانتظار الإسناد`
                  : `${unassignedClients.length} clients waiting for assignment`}
              </CardDescription>
            </div>
            <Button onClick={() => setAssignDialogOpen(true)} disabled={unassignedClients.length === 0 || approvedDoctors.length === 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إسناد عميل' : 'Assign Client'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedClients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {language === 'ar' ? 'لا يوجد عملاء بدون إسناد' : 'No unassigned clients'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassignedClients.map(client => (
                <Badge key={client.id} variant="secondary" className="py-2 px-3">
                  <User className="h-3 w-3 mr-1" />
                  {client.full_name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {language === 'ar' ? 'الإسنادات الحالية' : 'Current Assignments'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'إدارة إسنادات العملاء للأطباء'
              : 'Manage client-doctor assignments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {language === 'ar' ? 'لا توجد إسنادات حالية' : 'No current assignments'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'العميل' : 'Client'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الطبيب' : 'Doctor'}</TableHead>
                  <TableHead>{language === 'ar' ? 'تاريخ الإسناد' : 'Assigned Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'ملاحظات' : 'Notes'}</TableHead>
                  <TableHead>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAssignments.map(assignment => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{getClientName(assignment.client_id)}</TableCell>
                    <TableCell>{getDoctorName(assignment.doctor_id)}</TableCell>
                    <TableCell>{new Date(assignment.assigned_at).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{assignment.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openTransferDialog(assignment)}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'إسناد عميل لطبيب' : 'Assign Client to Doctor'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'اختر العميل والطبيب للإسناد' : 'Select client and doctor for assignment'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{language === 'ar' ? 'العميل' : 'Client'}</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select client'} />
                </SelectTrigger>
                <SelectContent>
                  {unassignedClients.map(client => (
                    <SelectItem key={client.user_id} value={client.user_id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{language === 'ar' ? 'الطبيب' : 'Doctor'}</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الطبيب' : 'Select doctor'} />
                </SelectTrigger>
                <SelectContent>
                  {approvedDoctors.map(doctor => (
                    <SelectItem key={doctor.user_id} value={doctor.user_id}>
                      {doctor.full_name} {doctor.specialization && `(${doctor.specialization})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{language === 'ar' ? 'ملاحظات' : 'Notes'}</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'ar' ? 'ملاحظات اختيارية...' : 'Optional notes...'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAssign}>
              {language === 'ar' ? 'إسناد' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'نقل عميل' : 'Transfer Client'}</DialogTitle>
            <DialogDescription>
              {currentAssignment && (
                <>
                  {language === 'ar' 
                    ? `نقل ${getClientName(currentAssignment.client_id)} من ${getDoctorName(currentAssignment.doctor_id)}`
                    : `Transfer ${getClientName(currentAssignment.client_id)} from ${getDoctorName(currentAssignment.doctor_id)}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium">{language === 'ar' ? 'الطبيب الجديد' : 'New Doctor'}</label>
            <Select value={selectedNewDoctor} onValueChange={setSelectedNewDoctor}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'اختر الطبيب الجديد' : 'Select new doctor'} />
              </SelectTrigger>
              <SelectContent>
                {approvedDoctors
                  .filter(d => d.user_id !== currentAssignment?.doctor_id)
                  .map(doctor => (
                    <SelectItem key={doctor.user_id} value={doctor.user_id}>
                      {doctor.full_name} {doctor.specialization && `(${doctor.specialization})`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleTransfer}>
              {language === 'ar' ? 'نقل' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
