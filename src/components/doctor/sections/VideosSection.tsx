import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Play, Video as VideoIcon, Link, FileVideo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video } from '@/hooks/useDoctorData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VideosSectionProps {
  videos: Video[];
  doctorId: string;
  onAdd: (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const categories = ['عضلات', 'دهون', 'تمارين', 'تغذية', 'نصائح'];

const getYouTubeThumbnail = (url: string): string => {
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const VideosSection = ({
  videos,
  doctorId,
  onAdd,
  onDelete
}: VideosSectionProps) => {
  const { isRTL } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    category: '',
    description: ''
  });

  const [uploadTab, setUploadTab] = useState<'youtube' | 'upload'>('youtube');

  const resetForm = () => {
    setFormData({
      title: '',
      youtube_url: '',
      category: '',
      description: ''
    });
    setUploadTab('youtube');
  };

  const handleSubmitYouTube = async () => {
    if (!formData.title || !formData.youtube_url) {
      toast.error(isRTL ? 'يرجى إدخال العنوان والرابط' : 'Please enter title and URL');
      return;
    }

    const videoData = {
      doctor_id: doctorId,
      title: formData.title,
      youtube_url: formData.youtube_url,
      category: formData.category || null,
      description: formData.description || null,
      thumbnail_url: getYouTubeThumbnail(formData.youtube_url)
    };

    const result = await onAdd(videoData);

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? 'تم إضافة الفيديو' : 'Video added');
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!formData.title) {
      toast.error(isRTL ? 'يرجى إدخال العنوان أولاً' : 'Please enter title first');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${doctorId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const videoData = {
        doctor_id: doctorId,
        title: formData.title,
        youtube_url: publicUrl, // Store the video URL here
        category: formData.category || null,
        description: formData.description || null,
        thumbnail_url: null // No thumbnail for uploaded videos
      };

      const result = await onAdd(videoData);

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(isRTL ? 'تم رفع الفيديو بنجاح' : 'Video uploaded successfully');
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'فشل رفع الفيديو' : 'Failed to upload video'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isRTL ? 'تم حذف الفيديو' : 'Video deleted');
    }
  };

  const openVideoPlayer = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              {isRTL ? 'رفع فيديو' : 'Upload Video'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة فيديو جديد' : 'Add New Video'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{isRTL ? 'عنوان الفيديو' : 'Video Title'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRTL ? 'عنوان الفيديو' : 'Video title'}
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

              <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as 'youtube' | 'upload')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="youtube" className="gap-2">
                    <Link className="h-4 w-4" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <FileVideo className="h-4 w-4" />
                    {isRTL ? 'رفع ملف' : 'Upload'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-4">
                  <div>
                    <Label>{isRTL ? 'رابط يوتيوب' : 'YouTube URL'}</Label>
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <Button onClick={handleSubmitYouTube} className="w-full">
                    {isRTL ? 'إضافة' : 'Add'}
                  </Button>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {isRTL ? 'اختر ملف فيديو (MP4, WebM, MOV)' : 'Choose a video file (MP4, WebM, MOV)'}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || !formData.title}
                      variant="outline"
                    >
                      {uploading 
                        ? (isRTL ? 'جاري الرفع...' : 'Uploading...') 
                        : (isRTL ? 'اختر ملف' : 'Choose File')}
                    </Button>
                    {!formData.title && (
                      <p className="text-xs text-destructive mt-2">
                        {isRTL ? 'أدخل العنوان أولاً' : 'Enter title first'}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-right">
          <h1 className="text-2xl font-bold">{isRTL ? 'الفيديوهات العلاجية' : 'Therapy Videos'}</h1>
          <p className="text-muted-foreground">{isRTL ? 'رفع وإدارة الفيديوهات للعملاء' : 'Upload and manage videos for clients'}</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <VideoIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">
            {isRTL ? 'لا توجد فيديوهات' : 'No videos yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const isYouTube = isYouTubeUrl(video.youtube_url);
            const thumbnail = video.thumbnail_url || (isYouTube ? getYouTubeThumbnail(video.youtube_url) : null);
            
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden group"
              >
                <div 
                  className="relative aspect-video cursor-pointer"
                  onClick={() => openVideoPlayer(video)}
                >
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <VideoIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                  <span className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded ${isYouTube ? 'bg-red-600' : 'bg-primary'}`}>
                    {isYouTube ? 'YouTube' : (isRTL ? 'فيديو مرفوع' : 'Uploaded')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-right mb-1">{video.category || ''}</h3>
                  <p className="text-sm text-muted-foreground text-right">{video.title}</p>
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setIsPlayerOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {selectedVideo && (
              <div className="aspect-video w-full">
                {isYouTubeUrl(selectedVideo.youtube_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.youtube_url) || ''}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.youtube_url}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-card">
            <h3 className="font-bold text-lg">{selectedVideo?.title}</h3>
            {selectedVideo?.category && (
              <span className="text-sm text-muted-foreground">{selectedVideo.category}</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
