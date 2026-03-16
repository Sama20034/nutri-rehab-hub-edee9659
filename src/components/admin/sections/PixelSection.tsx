import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, RefreshCw, Facebook } from 'lucide-react';

export const PixelSection = () => {
  const { isRTL } = useLanguage();
  const [pixelId, setPixelId] = useState('');
  const [savedPixelId, setSavedPixelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPixelId();
  }, []);

  const fetchPixelId = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'facebook_pixel_id')
      .maybeSingle();

    if (!error && data?.value) {
      setPixelId(data.value);
      setSavedPixelId(data.value);
    } else {
      setPixelId('');
      setSavedPixelId(null);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!pixelId.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'facebook_pixel_id', value: pixelId.trim(), updated_at: new Date().toISOString() });

    setSaving(false);
    if (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSavedPixelId(pixelId.trim());
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ Pixel ID. أعد تحميل الصفحة لتفعيله.' : 'Pixel ID saved. Reload the page to activate it.',
      });
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('key', 'facebook_pixel_id');

    setSaving(false);
    if (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPixelId('');
      setSavedPixelId(null);
      toast({
        title: isRTL ? 'تم الحذف' : 'Deleted',
        description: isRTL ? 'تم إزالة البكسل. أعد تحميل الصفحة لتعطيله.' : 'Pixel removed. Reload to deactivate.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const isActive = !!savedPixelId;
  const hasChanges = pixelId.trim() !== (savedPixelId || '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{isRTL ? 'Facebook Pixel' : 'Facebook Pixel'}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isRTL ? 'إدارة كود التتبع الخاص بـ Meta Pixel' : 'Manage Meta Pixel tracking code'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Facebook className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Meta Pixel ID</CardTitle>
                <CardDescription>
                  {isRTL ? 'أدخل Pixel ID الخاص بحسابك على Meta' : 'Enter your Meta account Pixel ID'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive
                ? (isRTL ? '✅ مفعّل' : '✅ Active')
                : (isRTL ? '⛔ معطّل' : '⛔ Inactive')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder={isRTL ? 'مثال: 891541746797169' : 'e.g. 891541746797169'}
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="font-mono"
              dir="ltr"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSave} disabled={saving || !pixelId.trim() || !hasChanges}>
              <Save className="h-4 w-4 me-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>

            {isActive && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                <Trash2 className="h-4 w-4 me-2" />
                {isRTL ? 'إزالة البكسل' : 'Remove Pixel'}
              </Button>
            )}

            <Button variant="outline" onClick={fetchPixelId} disabled={saving}>
              <RefreshCw className="h-4 w-4 me-2" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>

          {isActive && (
            <p className="text-xs text-muted-foreground border-t pt-3 mt-2">
              {isRTL
                ? `البكسل الحالي: ${savedPixelId} — يتم تحميله تلقائياً عند فتح الموقع. بعد أي تغيير، أعد تحميل الصفحة.`
                : `Current Pixel: ${savedPixelId} — Loaded automatically on page load. Reload after changes.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
