import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, AlertCircle, Pill, Apple, ThumbsUp, ThumbsDown, 
  Edit2, User, Search, Eye, Save, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface HealthProfile {
  id: string;
  client_id: string;
  allergies: string[];
  diseases: string[];
  medications: string[];
  supplements: string[];
  favorite_foods: string[];
  disliked_foods: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientWithProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  selected_package: string | null;
  status: string | null;
  healthProfile?: HealthProfile | null;
}

export const HealthProfilesSection = () => {
  const { isRTL } = useLanguage();
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    allergies: '',
    diseases: '',
    medications: '',
    supplements: '',
    favorite_foods: '',
    disliked_foods: '',
    notes: ''
  });

  useEffect(() => {
    fetchClientsWithProfiles();
  }, []);

  const fetchClientsWithProfiles = async () => {
    try {
      setLoading(true);
      
      // Fetch approved clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, selected_package, status')
        .eq('status', 'approved');

      if (clientsError) throw clientsError;

      // Fetch health profiles
      const { data: healthProfiles, error: profilesError } = await supabase
        .from('health_profiles')
        .select('*');

      // Merge data
      const clientsWithProfiles: ClientWithProfile[] = (clientsData || []).map(client => {
        const hp = healthProfiles?.find(hp => hp.client_id === client.user_id);
        return {
          ...client,
          healthProfile: hp ? {
            id: hp.id,
            client_id: hp.client_id,
            allergies: hp.allergies || [],
            diseases: hp.diseases || [],
            medications: hp.medications || [],
            supplements: hp.supplements || [],
            favorite_foods: hp.favorite_foods || [],
            disliked_foods: hp.disliked_foods || [],
            notes: hp.notes,
            created_at: hp.created_at,
            updated_at: hp.updated_at
          } : null
        };
      });

      setClients(clientsWithProfiles);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل البيانات' : 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (client: ClientWithProfile) => {
    setSelectedClient(client);
    if (client.healthProfile) {
      setEditForm({
        allergies: client.healthProfile.allergies?.join(', ') || '',
        diseases: client.healthProfile.diseases?.join(', ') || '',
        medications: client.healthProfile.medications?.join(', ') || '',
        supplements: client.healthProfile.supplements?.join(', ') || '',
        favorite_foods: client.healthProfile.favorite_foods?.join(', ') || '',
        disliked_foods: client.healthProfile.disliked_foods?.join(', ') || '',
        notes: client.healthProfile.notes || ''
      });
    } else {
      setEditForm({
        allergies: '',
        diseases: '',
        medications: '',
        supplements: '',
        favorite_foods: '',
        disliked_foods: '',
        notes: ''
      });
    }
  };

  const handleSave = async () => {
    if (!selectedClient) return;

    try {
      const profileData = {
        client_id: selectedClient.user_id,
        allergies: editForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
        diseases: editForm.diseases.split(',').map(s => s.trim()).filter(Boolean),
        medications: editForm.medications.split(',').map(s => s.trim()).filter(Boolean),
        supplements: editForm.supplements.split(',').map(s => s.trim()).filter(Boolean),
        favorite_foods: editForm.favorite_foods.split(',').map(s => s.trim()).filter(Boolean),
        disliked_foods: editForm.disliked_foods.split(',').map(s => s.trim()).filter(Boolean),
        notes: editForm.notes || null,
        updated_at: new Date().toISOString()
      };

      if (selectedClient.healthProfile) {
        // Update existing
        const { error } = await supabase
          .from('health_profiles')
          .update(profileData)
          .eq('id', selectedClient.healthProfile.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('health_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ الملف الصحي بنجاح' : 'Health profile saved successfully'
      });

      setIsEditing(false);
      setSelectedClient(null);
      fetchClientsWithProfiles();
    } catch (error) {
      console.error('Error saving health profile:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حفظ الملف الصحي' : 'Failed to save health profile',
        variant: 'destructive'
      });
    }
  };

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'الملفات الصحية' : 'Health Profiles'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'عرض وإدارة الملفات الصحية للعملاء' : 'View and manage client health profiles'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isRTL ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-primary">{clients.length}</p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي العملاء' : 'Total Clients'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-green-500">
            {clients.filter(c => c.healthProfile).length}
          </p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'لديهم ملف صحي' : 'Have Profile'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-orange-500">
            {clients.filter(c => !c.healthProfile).length}
          </p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'بدون ملف صحي' : 'No Profile'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-blue-500">
            {clients.filter(c => c.healthProfile?.allergies?.length || c.healthProfile?.diseases?.length).length}
          </p>
          <p className="text-sm text-muted-foreground">{isRTL ? 'حالات خاصة' : 'Special Cases'}</p>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <motion.div
            key={client.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{client.full_name || 'Unknown'}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{client.phone || 'No phone'}</span>
                    {client.selected_package && (
                      <Badge variant="outline" className="text-xs">
                        {client.selected_package}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {client.healthProfile ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    {isRTL ? 'لديه ملف' : 'Has Profile'}
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    {isRTL ? 'بدون ملف' : 'No Profile'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedClient(expandedClient === client.user_id ? null : client.user_id)}
                >
                  {expandedClient === client.user_id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleViewProfile(client);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Health Profile View */}
            {expandedClient === client.user_id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                {client.healthProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InfoCard
                      title={isRTL ? 'الحساسيات' : 'Allergies'}
                      icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
                      items={client.healthProfile.allergies || []}
                      colorClass="bg-orange-500/20"
                    />
                    <InfoCard
                      title={isRTL ? 'الأمراض' : 'Diseases'}
                      icon={<Heart className="h-4 w-4 text-red-500" />}
                      items={client.healthProfile.diseases || []}
                      colorClass="bg-red-500/20"
                    />
                    <InfoCard
                      title={isRTL ? 'الأدوية' : 'Medications'}
                      icon={<Pill className="h-4 w-4 text-blue-500" />}
                      items={client.healthProfile.medications || []}
                      colorClass="bg-blue-500/20"
                    />
                    <InfoCard
                      title={isRTL ? 'المكملات' : 'Supplements'}
                      icon={<Apple className="h-4 w-4 text-green-500" />}
                      items={client.healthProfile.supplements || []}
                      colorClass="bg-green-500/20"
                    />
                    <InfoCard
                      title={isRTL ? 'الأطعمة المفضلة' : 'Favorite Foods'}
                      icon={<ThumbsUp className="h-4 w-4 text-primary" />}
                      items={client.healthProfile.favorite_foods || []}
                      colorClass="bg-primary/20"
                    />
                    <InfoCard
                      title={isRTL ? 'الأطعمة غير المحببة' : 'Disliked Foods'}
                      icon={<ThumbsDown className="h-4 w-4 text-destructive" />}
                      items={client.healthProfile.disliked_foods || []}
                      colorClass="bg-destructive/20"
                    />
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {isRTL ? 'لا يوجد ملف صحي لهذا العميل' : 'No health profile for this client'}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {isRTL ? 'لا يوجد عملاء مطابقين للبحث' : 'No clients match your search'}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {isRTL ? 'تعديل الملف الصحي' : 'Edit Health Profile'}
              {selectedClient && (
                <span className="text-muted-foreground font-normal">
                  - {selectedClient.full_name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'الحساسيات (مفصولة بفاصلة)' : 'Allergies (comma separated)'}
              </label>
              <Input
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                placeholder={isRTL ? 'مثال: لاكتوز, جلوتين, مكسرات' : 'e.g., lactose, gluten, nuts'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'الأمراض (مفصولة بفاصلة)' : 'Diseases (comma separated)'}
              </label>
              <Input
                value={editForm.diseases}
                onChange={(e) => setEditForm({ ...editForm, diseases: e.target.value })}
                placeholder={isRTL ? 'مثال: سكري, ضغط, قلب' : 'e.g., diabetes, hypertension, heart'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'الأدوية (مفصولة بفاصلة)' : 'Medications (comma separated)'}
              </label>
              <Input
                value={editForm.medications}
                onChange={(e) => setEditForm({ ...editForm, medications: e.target.value })}
                placeholder={isRTL ? 'مثال: ميتفورمين, أسبرين' : 'e.g., metformin, aspirin'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'المكملات (مفصولة بفاصلة)' : 'Supplements (comma separated)'}
              </label>
              <Input
                value={editForm.supplements}
                onChange={(e) => setEditForm({ ...editForm, supplements: e.target.value })}
                placeholder={isRTL ? 'مثال: فيتامين د, أوميجا 3' : 'e.g., Vitamin D, Omega 3'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'الأطعمة المفضلة (مفصولة بفاصلة)' : 'Favorite Foods (comma separated)'}
              </label>
              <Input
                value={editForm.favorite_foods}
                onChange={(e) => setEditForm({ ...editForm, favorite_foods: e.target.value })}
                placeholder={isRTL ? 'مثال: دجاج, سمك, خضار' : 'e.g., chicken, fish, vegetables'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'الأطعمة غير المحببة (مفصولة بفاصلة)' : 'Disliked Foods (comma separated)'}
              </label>
              <Input
                value={editForm.disliked_foods}
                onChange={(e) => setEditForm({ ...editForm, disliked_foods: e.target.value })}
                placeholder={isRTL ? 'مثال: كبدة, بيض' : 'e.g., liver, eggs'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                <X className="h-4 w-4" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
