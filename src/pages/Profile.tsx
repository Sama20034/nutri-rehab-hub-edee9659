import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, ArrowRight, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

const Profile = () => {
  const { isRTL } = useLanguage();
  const { user, profile, role, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت' : 'Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Delete old avatar if exists
      await supabase.storage.from('avatars').remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      await refreshProfile();
      toast.success(isRTL ? 'تم تحديث الصورة الشخصية بنجاح' : 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء رفع الصورة' : 'Error uploading image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/dashboard';
  };

  const getRoleLabel = () => {
    if (role === 'admin') return isRTL ? 'مدير' : 'Admin';
    if (role === 'doctor') return isRTL ? 'طبيب' : 'Doctor';
    return isRTL ? 'عميل' : 'Client';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen pt-24 pb-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">
                {isRTL ? 'الملف الشخصي' : 'My Profile'}
              </h1>
              <Button 
                variant="outline" 
                onClick={() => navigate(getDashboardPath())}
                className="gap-2"
              >
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Profile Card */}
            <Card className="bg-card border-border">
              <CardHeader className="text-center pb-2">
                {/* Avatar with upload */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar 
                      className="h-24 w-24 cursor-pointer ring-4 ring-primary/20 hover:ring-primary/40 transition-all"
                      onClick={handleAvatarClick}
                    >
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload overlay */}
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {isRTL ? 'انقر لتغيير الصورة' : 'Click to change photo'}
                </p>
                
                <CardTitle className="text-xl">{fullName || (isRTL ? 'مستخدم' : 'User')}</CardTitle>
                <p className="text-muted-foreground text-sm">{getRoleLabel()}</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isRTL ? 'الاسم الكامل' : 'Full Name'}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className={`bg-muted ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                    className={isRTL ? 'text-right' : 'text-left'}
                    dir="ltr"
                  />
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving 
                    ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                    : (isRTL ? 'حفظ التغييرات' : 'Save Changes')
                  }
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;