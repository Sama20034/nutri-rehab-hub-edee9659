import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Save, Trash2 } from 'lucide-react';

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  // Already an embed
  if (url.includes('embed') || url.includes('/preview')) return url;
  return null;
};

export const HomepageVideoSection = () => {
  const { isRTL } = useLanguage();
  const [videoUrl, setVideoUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    const embedUrl = getEmbedUrl(videoUrl);
    if (!embedUrl && videoUrl.trim()) {
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
    await supabase.from('site_settings').upsert({ key: 'homepage_video_url', value: '', updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setVideoUrl('');
    setSavedUrl('');
    toast({ title: isRTL ? 'تم الحذف' : 'Deleted', description: isRTL ? 'تم حذف الفيديو' : 'Video removed' });
    setSaving(false);
  };

  const embedUrl = getEmbedUrl(savedUrl);

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
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
            {savedUrl && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {embedUrl && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'معاينة' : 'Preview'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
