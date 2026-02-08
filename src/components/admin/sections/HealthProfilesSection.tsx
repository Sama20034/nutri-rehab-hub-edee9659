import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Heart, Users, Paperclip, Film, Eye, AlertCircle, Pill, Apple, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { FileUploadManager } from '@/components/admin/FileUploadManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
}

interface HealthProfileTemplate {
  id: string;
  name: string;
  description: string | null;
  allergies: string[];
  diseases: string[];
  medications: string[];
  supplements: string[];
  favorite_foods: string[];
  disliked_foods: string[];
  notes: string | null;
  attachments: FileAttachment[];
  video_urls: string[];
  status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  user_id: string;
  full_name: string;
}

const statuses = ['active', 'inactive'];

export const HealthProfilesSection = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<HealthProfileTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<HealthProfileTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<HealthProfileTemplate | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allergies: '',
    diseases: '',
    medications: '',
    supplements: '',
    favorite_foods: '',
    disliked_foods: '',
    notes: '',
    status: 'active'
  });

  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
    fetchClients();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_profile_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(template => ({
        ...template,
        allergies: template.allergies || [],
        diseases: template.diseases || [],
        medications: template.medications || [],
        supplements: template.supplements || [],
        favorite_foods: template.favorite_foods || [],
        disliked_foods: template.disliked_foods || [],
        attachments: (template.attachments as unknown as FileAttachment[]) || [],
        video_urls: template.video_urls || []
      }));

      setTemplates(transformedData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(isRTL ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_id, full_name')
      .eq('status', 'approved');
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'client');
    
    if (profiles && roles) {
      const clientUserIds = roles.map(r => r.user_id);
      const clientProfiles = profiles.filter(p => clientUserIds.includes(p.user_id));
      setClients(clientProfiles as Client[]);
    }
  };

  const clientOptions = clients.map(c => ({
    value: c.user_id,
    label: c.full_name || 'بدون اسم'
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      allergies: '',
      diseases: '',
      medications: '',
      supplements: '',
      favorite_foods: '',
      disliked_foods: '',
      notes: '',
      status: 'active'
    });
    setEditingTemplate(null);
    setSelectedClients([]);
    setAttachments([]);
    setVideoUrls([]);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم الملف الصحي' : 'Please enter template name');
      return;
    }

    const templateData = {
      name: formData.name,
      description: formData.description || null,
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      diseases: formData.diseases.split(',').map(s => s.trim()).filter(Boolean),
      medications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
      supplements: formData.supplements.split(',').map(s => s.trim()).filter(Boolean),
      favorite_foods: formData.favorite_foods.split(',').map(s => s.trim()).filter(Boolean),
      disliked_foods: formData.disliked_foods.split(',').map(s => s.trim()).filter(Boolean),
      notes: formData.notes || null,
      attachments: JSON.parse(JSON.stringify(attachments)),
      video_urls: videoUrls,
      status: formData.status,
      created_by: user?.id || null,
      updated_at: new Date().toISOString()
    };

    try {
      let newTemplateId: string | null = null;

      if (editingTemplate) {
        const { error } = await supabase
          .from('health_profile_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        newTemplateId = editingTemplate.id;
      } else {
        const { data, error } = await supabase
          .from('health_profile_templates')
          .insert(templateData)
          .select('id')
          .single();

        if (error) throw error;
        newTemplateId = data?.id || null;
      }

      // Assign to clients if any selected
      if (selectedClients.length > 0 && newTemplateId && user) {
        const assignments = selectedClients.map(clientId => ({
          template_id: newTemplateId!,
          client_id: clientId,
          assigned_by: user.id,
          status: 'active'
        }));

        const { error: assignError } = await supabase
          .from('client_health_profile_assignments')
          .insert(assignments);

        if (assignError) {
          toast.error(isRTL ? 'تم الحفظ لكن فشل التعيين للعملاء' : 'Saved but failed to assign to clients');
        } else {
          toast.success(isRTL ? `تم تعيين الملف لـ ${selectedClients.length} عميل` : `Assigned to ${selectedClients.length} clients`);
        }
      }

      toast.success(isRTL ? (editingTemplate ? 'تم تحديث الملف الصحي' : 'تم إضافة الملف الصحي') : (editingTemplate ? 'Template updated' : 'Template added'));
      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(isRTL ? 'فشل في حفظ الملف الصحي' : 'Failed to save template');
    }
  };

  const handleEdit = (template: HealthProfileTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      allergies: template.allergies?.join(', ') || '',
      diseases: template.diseases?.join(', ') || '',
      medications: template.medications?.join(', ') || '',
      supplements: template.supplements?.join(', ') || '',
      favorite_foods: template.favorite_foods?.join(', ') || '',
      disliked_foods: template.disliked_foods?.join(', ') || '',
      notes: template.notes || '',
      status: template.status || 'active'
    });
    setAttachments(template.attachments || []);
    setVideoUrls(template.video_urls || []);
    setEditingTemplate(template);
    setSelectedClients([]);
    setIsDialogOpen(true);
  };

  const handleView = (template: HealthProfileTemplate) => {
    setViewingTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_profile_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(isRTL ? 'تم حذف الملف الصحي' : 'Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(isRTL ? 'فشل في حذف الملف الصحي' : 'Failed to delete template');
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === 'active'
      ? <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">{isRTL ? 'نشط' : 'Active'}</Badge>
      : <Badge variant="secondary">{isRTL ? 'غير نشط' : 'Inactive'}</Badge>;
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
    <div className="p-4 rounded-xl bg-muted/30 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
          {icon}
        </div>
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            {isRTL ? 'لا توجد بيانات' : 'No data'}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? 'الملفات الصحية' : 'Health Profiles'}</h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إنشاء وإدارة قوالب الملفات الصحية وتعيينها للعملاء' : 'Create and manage health profile templates'}
            </p>
          </div>
        </div>
        <Button variant="default" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة ملف صحي جديد' : 'Add New Template'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-primary">{templates.length}</p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي القوالب' : 'Total Templates'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-green-500">
            {templates.filter(t => t.status === 'active').length}
          </p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'قوالب نشطة' : 'Active'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-blue-500">{clients.length}</p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</p>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'الوصف' : 'Description'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead>{isRTL ? 'المرفقات' : 'Attachments'}</TableHead>
              <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد ملفات صحية' : 'No health profiles found'}</p>
                  <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isRTL ? 'إضافة أول ملف صحي' : 'Add First Template'}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>{template.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{template.description || '-'}</TableCell>
                  <TableCell>{getStatusBadge(template.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(template.attachments?.length || 0) > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {template.attachments?.length}
                        </Badge>
                      )}
                      {(template.video_urls?.length || 0) > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Film className="h-3 w-3" />
                          {template.video_urls?.length}
                        </Badge>
                      )}
                      {!(template.attachments?.length || 0) && !(template.video_urls?.length || 0) && '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {viewingTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingTemplate && (
            <div className="space-y-4 py-4">
              {viewingTemplate.description && (
                <p className="text-muted-foreground">{viewingTemplate.description}</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  title={isRTL ? 'الحساسيات' : 'Allergies'}
                  icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
                  items={viewingTemplate.allergies || []}
                  colorClass="bg-orange-500/20"
                />
                <InfoCard
                  title={isRTL ? 'الأمراض' : 'Diseases'}
                  icon={<Heart className="h-4 w-4 text-red-500" />}
                  items={viewingTemplate.diseases || []}
                  colorClass="bg-red-500/20"
                />
                <InfoCard
                  title={isRTL ? 'الأدوية' : 'Medications'}
                  icon={<Pill className="h-4 w-4 text-blue-500" />}
                  items={viewingTemplate.medications || []}
                  colorClass="bg-blue-500/20"
                />
                <InfoCard
                  title={isRTL ? 'المكملات' : 'Supplements'}
                  icon={<Apple className="h-4 w-4 text-green-500" />}
                  items={viewingTemplate.supplements || []}
                  colorClass="bg-green-500/20"
                />
                <InfoCard
                  title={isRTL ? 'الأطعمة المفضلة' : 'Favorite Foods'}
                  icon={<ThumbsUp className="h-4 w-4 text-primary" />}
                  items={viewingTemplate.favorite_foods || []}
                  colorClass="bg-primary/20"
                />
                <InfoCard
                  title={isRTL ? 'الأطعمة غير المحببة' : 'Disliked Foods'}
                  icon={<ThumbsDown className="h-4 w-4 text-destructive" />}
                  items={viewingTemplate.disliked_foods || []}
                  colorClass="bg-destructive/20"
                />
              </div>

              {viewingTemplate.notes && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="font-semibold text-sm mb-2">{isRTL ? 'ملاحظات' : 'Notes'}</h4>
                  <p className="text-sm text-muted-foreground">{viewingTemplate.notes}</p>
                </div>
              )}

              {/* Attachments */}
              {viewingTemplate.attachments?.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    {isRTL ? 'المرفقات' : 'Attachments'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTemplate.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-background rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                      >
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {viewingTemplate.video_urls?.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    {isRTL ? 'الفيديوهات' : 'Videos'}
                  </h4>
                  <div className="space-y-2">
                    {viewingTemplate.video_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 bg-background rounded-lg border border-border hover:bg-muted transition-colors text-sm truncate"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
            <Button onClick={() => {
              if (viewingTemplate) {
                handleEdit(viewingTemplate);
                setIsViewDialogOpen(false);
              }
            }}>
              <Edit className="h-4 w-4 mr-2" />
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? (isRTL ? 'تعديل الملف الصحي' : 'Edit Health Profile') : (isRTL ? 'إضافة ملف صحي جديد' : 'Add New Health Profile')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'اسم الملف الصحي' : 'Template Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isRTL ? 'مثال: ملف مريض سكري' : 'e.g., Diabetic Patient Profile'}
              />
            </div>

            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'وصف الملف الصحي...' : 'Template description...'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الحساسيات (مفصولة بفاصلة)' : 'Allergies (comma separated)'}</Label>
                <Input
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder={isRTL ? 'لاكتوز, جلوتين, مكسرات' : 'lactose, gluten, nuts'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'الأمراض (مفصولة بفاصلة)' : 'Diseases (comma separated)'}</Label>
                <Input
                  value={formData.diseases}
                  onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                  placeholder={isRTL ? 'سكري, ضغط, قلب' : 'diabetes, hypertension'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الأدوية (مفصولة بفاصلة)' : 'Medications (comma separated)'}</Label>
                <Input
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder={isRTL ? 'ميتفورمين, أنسولين' : 'metformin, insulin'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'المكملات (مفصولة بفاصلة)' : 'Supplements (comma separated)'}</Label>
                <Input
                  value={formData.supplements}
                  onChange={(e) => setFormData({ ...formData, supplements: e.target.value })}
                  placeholder={isRTL ? 'فيتامين د, أوميجا 3' : 'vitamin D, omega 3'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? 'الأطعمة المفضلة (مفصولة بفاصلة)' : 'Favorite Foods (comma separated)'}</Label>
                <Input
                  value={formData.favorite_foods}
                  onChange={(e) => setFormData({ ...formData, favorite_foods: e.target.value })}
                  placeholder={isRTL ? 'سمك, دجاج, خضروات' : 'fish, chicken, vegetables'}
                />
              </div>
              <div>
                <Label>{isRTL ? 'الأطعمة غير المحببة (مفصولة بفاصلة)' : 'Disliked Foods (comma separated)'}</Label>
                <Input
                  value={formData.disliked_foods}
                  onChange={(e) => setFormData({ ...formData, disliked_foods: e.target.value })}
                  placeholder={isRTL ? 'كشري, فول' : 'beans, lentils'}
                />
              </div>
            </div>

            <div>
              <Label>{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={isRTL ? 'ملاحظات عامة عن الحالة الصحية...' : 'General health notes...'}
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
                    <SelectItem key={s} value={s}>{s === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Attachments & Videos */}
            <div className="border-t pt-4 mt-4">
              <FileUploadManager
                attachments={attachments}
                videoUrls={videoUrls}
                onAttachmentsChange={setAttachments}
                onVideoUrlsChange={setVideoUrls}
                isRTL={isRTL}
              />
            </div>

            {/* Client Assignment */}
            <div className="border-t pt-4 mt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                {isRTL ? 'تعيين الملف للعملاء' : 'Assign to Clients'}
              </Label>
              <MultiSelect
                options={clientOptions}
                selected={selectedClients}
                onChange={setSelectedClients}
                placeholder={isRTL ? 'اختر العملاء...' : 'Select clients...'}
                searchPlaceholder={isRTL ? 'بحث عن عميل...' : 'Search clients...'}
                emptyText={isRTL ? 'لا يوجد عملاء' : 'No clients found'}
              />
              {selectedClients.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL ? `سيتم تعيين الملف لـ ${selectedClients.length} عميل` : `Will assign to ${selectedClients.length} client(s)`}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
