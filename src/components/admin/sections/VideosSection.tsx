import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Search, Edit, Trash2, Video, Users, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  created_by: string | null;
  created_at: string;
}

interface Client {
  id: string;
  user_id: string;
  full_name: string;
}

const categories = ['تغذية', 'تمارين', 'صحة عامة', 'وصفات', 'نصائح'];

export const VideosSection = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // Video dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    duration_seconds: '',
    thumbnail_url: ''
  });

  // Fetch videos and clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (videosData) setVideos(videosData);

      // Fetch clients
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
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const clientOptions = clients.map(c => ({
    value: c.user_id,
    label: c.full_name || 'بدون اسم'
  }));

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: '',
      duration_seconds: '',
      thumbnail_url: ''
    });
    setEditingVideo(null);
    setSelectedClients([]);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.url) {
      toast.error(isRTL ? 'يرجى إدخال عنوان الفيديو والرابط' : 'Please enter video title and URL');
      return;
    }

    const videoData = {
      title: formData.title,
      url: formData.url,
      description: formData.description || null,
      category: formData.category || null,
      duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null,
      thumbnail_url: formData.thumbnail_url || null,
      created_by: user?.id || null
    };

    let videoId: string | null = null;

    if (editingVideo) {
      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', editingVideo.id);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      videoId = editingVideo.id;
      toast.success(isRTL ? 'تم تحديث الفيديو' : 'Video updated');
    } else {
      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      videoId = data?.id || null;
      toast.success(isRTL ? 'تم إضافة الفيديو' : 'Video added');
    }

    // Assign to clients if any selected
    if (videoId && selectedClients.length > 0 && user) {
      const assignments = selectedClients.map(clientId => ({
        client_id: clientId,
        video_id: videoId!,
        assigned_by: user.id
      }));

      const { error: assignError } = await supabase
        .from('client_videos')
        .insert(assignments);

      if (assignError) {
        toast.error(isRTL ? 'تم حفظ الفيديو لكن فشل التعيين للعملاء' : 'Video saved but failed to assign to clients');
      } else {
        toast.success(isRTL ? `تم تعيين الفيديو لـ ${selectedClients.length} عميل` : `Assigned to ${selectedClients.length} clients`);
      }
    }

    // Refresh videos
    const { data: updatedVideos } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (updatedVideos) setVideos(updatedVideos);
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      category: video.category || '',
      duration_seconds: video.duration_seconds?.toString() || '',
      thumbnail_url: video.thumbnail_url || ''
    });
    setEditingVideo(video);
    setSelectedClients([]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(error.message);
    } else {
      setVideos(videos.filter(v => v.id !== id));
      toast.success(isRTL ? 'تم حذف الفيديو' : 'Video deleted');
    }
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة الفيديوهات' : 'Video Management'}</h1>
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'إضافة وتعديل الفيديوهات التعليمية' : 'Add and manage educational videos'}
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            className={`${isRTL ? 'pr-10' : 'pl-10'}`}
          />
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة فيديو' : 'Add Video'}
        </Button>
      </div>

      {/* Video count */}
      <Badge variant="secondary" className="text-sm">
        {videos.length} {isRTL ? 'فيديو' : 'Video(s)'}
      </Badge>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'العنوان' : 'Title'}</TableHead>
              <TableHead>{isRTL ? 'التصنيف' : 'Category'}</TableHead>
              <TableHead>{isRTL ? 'المدة' : 'Duration'}</TableHead>
              <TableHead>{isRTL ? 'الرابط' : 'Link'}</TableHead>
              <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد فيديوهات' : 'No videos found'}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2">
                      {video.thumbnail_url && (
                        <img src={video.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      {video.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {video.category ? (
                      <Badge variant="outline">{video.category}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{formatDuration(video.duration_seconds)}</TableCell>
                  <TableCell>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      {isRTL ? 'مشاهدة' : 'Watch'}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(video.id)}>
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

      {/* Add/Edit Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? (isRTL ? 'تعديل الفيديو' : 'Edit Video') : (isRTL ? 'إضافة فيديو جديد' : 'Add New Video')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{isRTL ? 'عنوان الفيديو' : 'Video Title'}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isRTL ? 'مثال: نصائح للتغذية السليمة' : 'e.g., Healthy Eating Tips'}
              />
            </div>
            <div>
              <Label>{isRTL ? 'رابط الفيديو' : 'Video URL'}</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر التصنيف' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isRTL ? 'المدة (بالثواني)' : 'Duration (seconds)'}</Label>
              <Input
                type="number"
                value={formData.duration_seconds}
                onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
                placeholder="300"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الصورة المصغرة' : 'Thumbnail'}</Label>
              <ImageUpload
                value={formData.thumbnail_url}
                onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                placeholder={isRTL ? 'اختر صورة مصغرة' : 'Choose thumbnail'}
                folder="thumbnails"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'وصف الفيديو...' : 'Video description...'}
              />
            </div>

            {/* Client Assignment */}
            <div className="border-t pt-4 mt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                {isRTL ? 'تعيين الفيديو للعملاء' : 'Assign to Clients'}
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
                  {isRTL ? `سيتم تعيين الفيديو لـ ${selectedClients.length} عميل` : `Will assign to ${selectedClients.length} client(s)`}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit}>
              {editingVideo ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
