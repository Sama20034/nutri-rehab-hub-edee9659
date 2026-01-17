import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientVideo {
  id: string;
  video_id: string;
  watched: boolean;
  watched_at: string | null;
  video: {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    category: string | null;
    thumbnail_url: string | null;
  };
}

interface VideosSectionProps {
  isRTL: boolean;
  clientId: string;
}

export const VideosSection = ({ isRTL, clientId }: VideosSectionProps) => {
  const [videos, setVideos] = useState<ClientVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<ClientVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('client_videos')
        .select(`
          id,
          video_id,
          watched,
          watched_at,
          video:videos(id, title, description, youtube_url, category, thumbnail_url)
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      
      const validVideos = (data || []).filter(v => v.video !== null) as ClientVideo[];
      setVideos(validVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [clientId]);

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleWatchVideo = async (video: ClientVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
    
    // Mark as watched if not already
    if (!video.watched) {
      try {
        await supabase
          .from('client_videos')
          .update({ 
            watched: true, 
            watched_at: new Date().toISOString() 
          })
          .eq('id', video.id);
        
        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { ...v, watched: true, watched_at: new Date().toISOString() }
            : v
        ));
      } catch (error) {
        console.error('Error updating watch status:', error);
      }
    }
  };

  const toggleWatched = async (video: ClientVideo) => {
    try {
      const newWatched = !video.watched;
      await supabase
        .from('client_videos')
        .update({ 
          watched: newWatched, 
          watched_at: newWatched ? new Date().toISOString() : null 
        })
        .eq('id', video.id);
      
      setVideos(prev => prev.map(v => 
        v.id === video.id 
          ? { ...v, watched: newWatched, watched_at: newWatched ? new Date().toISOString() : null }
          : v
      ));
      
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
    } catch (error) {
      console.error('Error updating watch status:', error);
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  // Calculate progress
  const totalVideos = videos.length;
  const watchedVideos = videos.filter(v => v.watched).length;
  const progressPercentage = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  // Group by category
  const videosByCategory = videos.reduce((acc, video) => {
    const category = video.video?.category || (isRTL ? 'عام' : 'General');
    if (!acc[category]) acc[category] = [];
    acc[category].push(video);
    return acc;
  }, {} as Record<string, ClientVideo[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Video className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isRTL ? 'الفيديوهات' : 'Videos'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {isRTL ? 'سيتم عرض الفيديوهات المخصصة لك هنا' : 'Your assigned videos will be displayed here'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold mb-2">
          {isRTL ? 'الفيديوهات' : 'Videos'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'شاهد الفيديوهات التعليمية المخصصة لك' : 'Watch educational videos assigned to you'}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Video className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">
              {isRTL ? 'تقدم المشاهدة' : 'Watch Progress'}
            </h2>
          </div>
          <span className="text-primary font-bold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-3" />
        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL 
            ? `شاهدت ${watchedVideos} من ${totalVideos} فيديو`
            : `Watched ${watchedVideos} of ${totalVideos} videos`
          }
        </p>
      </div>

      {/* Videos Grid */}
      {Object.entries(videosByCategory).map(([category, categoryVideos]) => (
        <div key={category} className="space-y-4">
          <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryVideos.map((video) => {
              const thumbnail = video.video?.thumbnail_url || getYouTubeThumbnail(video.video?.youtube_url || '');
              
              return (
                <div
                  key={video.id}
                  className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {thumbnail ? (
                      <img 
                        src={thumbnail} 
                        alt={video.video?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleWatchVideo(video)}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                    {/* Watched badge */}
                    {video.watched && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          {isRTL ? 'تمت المشاهدة' : 'Watched'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h4 className={`font-semibold mb-2 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {video.video?.title}
                    </h4>
                    {video.video?.description && (
                      <p className={`text-sm text-muted-foreground mb-3 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {video.video.description}
                      </p>
                    )}
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button
                        size="sm"
                        onClick={() => handleWatchVideo(video)}
                        className="flex-1 gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {isRTL ? 'شاهد' : 'Watch'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWatched(video)}
                        className="gap-1"
                      >
                        {video.watched ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedVideo && (
            <div className="aspect-video">
              {isYouTubeUrl(selectedVideo.video?.youtube_url || '') ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.video?.youtube_url || '') || ''}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideo.video?.youtube_url}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
