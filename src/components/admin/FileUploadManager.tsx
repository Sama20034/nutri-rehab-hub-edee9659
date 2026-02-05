import { useState } from 'react';
import { Upload, X, FileText, Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
}

interface FileUploadManagerProps {
  attachments: FileAttachment[];
  videoUrls: string[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  onVideoUrlsChange: (urls: string[]) => void;
  isRTL?: boolean;
  bucketName?: string;
}

export const FileUploadManager = ({
  attachments,
  videoUrls,
  onAttachmentsChange,
  onVideoUrlsChange,
  isRTL = true,
  bucketName = 'diet-plan-files'
}: FileUploadManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newAttachments: FileAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(isRTL ? `الملف ${file.name} كبير جداً (الحد الأقصى 50MB)` : `File ${file.name} is too large (max 50MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(isRTL ? `فشل رفع ${file.name}` : `Failed to upload ${file.name}`);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        newAttachments.push({
          name: file.name,
          url: publicUrl.publicUrl,
          type: file.type
        });
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast.success(isRTL ? `تم رفع ${newAttachments.length} ملف` : `Uploaded ${newAttachments.length} file(s)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(isRTL ? 'حدث خطأ أثناء الرفع' : 'Error during upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    
    // Try to delete from storage
    try {
      const urlParts = attachment.url.split('/');
      const filePath = `attachments/${urlParts[urlParts.length - 1]}`;
      await supabase.storage.from(bucketName).remove([filePath]);
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) return;
    
    // Basic URL validation
    if (!newVideoUrl.includes('youtube.com') && !newVideoUrl.includes('youtu.be') && !newVideoUrl.includes('vimeo.com')) {
      toast.error(isRTL ? 'يرجى إدخال رابط يوتيوب أو فيميو صحيح' : 'Please enter a valid YouTube or Vimeo URL');
      return;
    }

    onVideoUrlsChange([...videoUrls, newVideoUrl.trim()]);
    setNewVideoUrl('');
    toast.success(isRTL ? 'تم إضافة الفيديو' : 'Video added');
  };

  const removeVideoUrl = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    onVideoUrlsChange(newUrls);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* File Attachments */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {isRTL ? 'إرفاق ملفات (PDF, PowerPoint, Word, صور)' : 'Attach Files (PDF, PowerPoint, Word, Images)'}
        </Label>
        
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {isRTL ? 'اختر ملفات للرفع' : 'Choose files to upload'}
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div className="space-y-2 mt-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span>{getFileIcon(file.type)}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {file.name}
                  </a>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive shrink-0"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video URLs */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Film className="h-4 w-4" />
          {isRTL ? 'روابط فيديوهات (YouTube, Vimeo)' : 'Video Links (YouTube, Vimeo)'}
        </Label>
        
        <div className="flex items-center gap-2">
          <Input
            type="url"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder={isRTL ? 'الصق رابط الفيديو هنا...' : 'Paste video URL here...'}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addVideoUrl}
            disabled={!newVideoUrl.trim()}
          >
            {isRTL ? 'إضافة' : 'Add'}
          </Button>
        </div>

        {/* Video URLs List */}
        {videoUrls.length > 0 && (
          <div className="space-y-2 mt-2">
            {videoUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Film className="h-4 w-4 text-destructive shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {url}
                  </a>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive shrink-0"
                  onClick={() => removeVideoUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
