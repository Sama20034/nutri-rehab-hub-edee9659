import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Save, Trash2, Upload } from 'lucide-react';

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  if (url.includes('embed') || url.includes('/preview')) return url;
  return null;
};

const isDirectVideo = (url: string): boolean => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)(\?|$)/i) !== null || url.includes('supabase.co/storage');
};

export const HomepageVideoSection = () => {
  const { isRTL } = useLanguage();
  const [videoUrl, setVideoUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_video_url')
        .single();
      if (data?.value) {
        setVideoUrl(data.value);
        setSavedUrl(data.value);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: isRTL ? 'نوع غير مدعوم' : 'Unsupported type', description: isRTL ? 'يرجى رفع فيديو MP4 أو WebM أو OGG' : 'Please upload MP4, WebM, or OGG video', variant: 'destructive' });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({ title: isRTL ? 'الملف كبير جداً' : 'File too large', description: isRTL ? 'الحد الأقصى 100 ميجابايت' : 'Maximum size is 100MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `homepage-video/video.${ext}`;

    // Remove old file if exists
    await supabase.storage.from('uploads').remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: isRTL ? 'خطأ في الرفع' : 'Upload error', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    const url = publicData.publicUrl;

    // Save to site_settings
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'homepage_video_url', value: url, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setVideoUrl(url);
      setSavedUrl(url);
      toast({ title: isRTL ? 'تم الرفع' : 'Uploaded', description: isRTL ? 'تم رفع وحفظ الفيديو بنجاح' : 'Video uploaded and saved successfully' });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    const embedUrl = getEmbedUrl(videoUrl);
    if (!embedUrl && videoUrl.trim() && !isDirectVideo(videoUrl)) {
      toast({ title: isRTL ? 'رابط غير صالح' : 'Invalid URL', description: isRTL ? 'يرجى إدخال رابط يوتيوب أو جوجل درايف' : 'Please enter a YouTube or Google Drive link', variant: 'destructive' });
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'homepage_video_url', value: videoUrl.trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSavedUrl(videoUrl.trim());
      toast({ title: isRTL ? 'تم الحفظ' : 'Saved', description: isRTL ? 'تم حفظ رابط الفيديو بنجاح' : 'Video URL saved successfully' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    // Try to remove uploaded file
    if (savedUrl.includes('supabase.co/storage')) {
      const path = savedUrl.split('/uploads/')[1];
      if (path) await supabase.storage.from('uploads').remove([path]);
    }
    await supabase.from('site_settings').upsert({ key: 'homepage_video_url', value: '', updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setVideoUrl('');
    setSavedUrl('');
    toast({ title: isRTL ? 'تم الحذف' : 'Deleted', description: isRTL ? 'تم حذف الفيديو' : 'Video removed' });
    setSaving(false);
  };

  const embedUrl = getEmbedUrl(savedUrl);
  const isDirect = isDirectVideo(savedUrl);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{isRTL ? 'فيديو الصفحة الرئيسية' : 'Homepage Video'}</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {isRTL ? 'رابط الفيديو' : 'Video URL'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={isRTL ? 'أدخل رابط يوتيوب أو جوجل درايف' : 'Enter YouTube or Google Drive URL'}
            dir="ltr"
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSave} disabled={saving || uploading}>
              <Save className="h-4 w-4 mr-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={saving || uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع فيديو من الجهاز' : 'Upload from device')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              className="hidden"
              onChange={handleFileUpload}
            />
            {savedUrl && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving || uploading}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(embedUrl || isDirect) && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'معاينة' : 'Preview'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden">
              {isDirect ? (
                <video src={savedUrl} className="w-full h-full" controls />
              ) : (
                <iframe src={embedUrl!} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
