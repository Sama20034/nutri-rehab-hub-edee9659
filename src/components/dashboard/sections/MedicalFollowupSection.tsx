import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  AlertTriangle, 
  Heart, 
  Activity,
  Scale,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  Info,
  ShieldAlert,
  HeartPulse,
  Thermometer,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicalNote {
  id: string;
  type: string;
  title: string;
  content: string | null;
  severity: string;
  is_read: boolean;
  created_at: string;
  doctor_id: string;
}

interface HealthMeasurement {
  id: string;
  measurement_type: string;
  value: number;
  unit: string;
  notes: string | null;
  recorded_at: string;
}

interface MedicalFollowupSectionProps {
  isRTL: boolean;
  clientId: string;
  hasMedicalFollowup: boolean;
}

const noteTypes = [
  { id: 'all', label: 'الكل', labelEn: 'All', icon: Stethoscope },
  { id: 'advice', label: 'نصائح', labelEn: 'Advice', icon: Info },
  { id: 'warning', label: 'تحذيرات', labelEn: 'Warnings', icon: AlertTriangle },
  { id: 'follow_up', label: 'متابعة', labelEn: 'Follow-up', icon: HeartPulse },
];

const measurementIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  weight: Scale,
  blood_pressure: Activity,
  blood_sugar: Droplets,
  heart_rate: Heart,
  bmi: Thermometer,
};

export const MedicalFollowupSection = ({ isRTL, clientId, hasMedicalFollowup }: MedicalFollowupSectionProps) => {
  const [notes, setNotes] = useState<MedicalNote[]>([]);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNote, setSelectedNote] = useState<MedicalNote | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [notesRes, measurementsRes] = await Promise.all([
        supabase
          .from('medical_notes')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('health_measurements')
          .select('*')
          .eq('client_id', clientId)
          .order('recorded_at', { ascending: false })
          .limit(20)
      ]);

      if (notesRes.error) throw notesRes.error;
      if (measurementsRes.error) throw measurementsRes.error;

      setNotes(notesRes.data || []);
      setMeasurements(measurementsRes.data || []);
    } catch (error) {
      console.error('Error fetching medical data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMedicalFollowup) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [clientId, hasMedicalFollowup]);

  const handleMarkAsRead = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('medical_notes')
        .update({ is_read: true })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking note as read:', error);
    }
  };

  const handleViewNote = (note: MedicalNote) => {
    setSelectedNote(note);
    setIsDetailsOpen(true);
    if (!note.is_read) {
      handleMarkAsRead(note.id);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{isRTL ? 'حرج' : 'Critical'}</Badge>;
      case 'important':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{isRTL ? 'مهم' : 'Important'}</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{isRTL ? 'عادي' : 'Normal'}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'follow_up':
        return <HeartPulse className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warning':
        return isRTL ? 'تحذير' : 'Warning';
      case 'follow_up':
        return isRTL ? 'متابعة' : 'Follow-up';
      default:
        return isRTL ? 'نصيحة' : 'Advice';
    }
  };

  const getMeasurementLabel = (type: string) => {
    switch (type) {
      case 'weight':
        return isRTL ? 'الوزن' : 'Weight';
      case 'blood_pressure':
        return isRTL ? 'ضغط الدم' : 'Blood Pressure';
      case 'blood_sugar':
        return isRTL ? 'سكر الدم' : 'Blood Sugar';
      case 'heart_rate':
        return isRTL ? 'نبض القلب' : 'Heart Rate';
      case 'bmi':
        return isRTL ? 'مؤشر كتلة الجسم' : 'BMI';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredNotes = activeTab === 'all' 
    ? notes 
    : notes.filter(n => n.type === activeTab);

  const unreadCount = notes.filter(n => !n.is_read).length;

  // Not subscribed to medical follow-up
  if (!hasMedicalFollowup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6 border-2 border-dashed border-muted-foreground/30">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-3">
          {isRTL ? 'المتابعة الطبية' : 'Medical Follow-up'}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {isRTL 
            ? 'هذه الخدمة متاحة فقط للمشتركين في باقة المتابعة الطبية. قم بترقية اشتراكك للوصول إلى النصائح الطبية والمتابعة المستمرة.'
            : 'This service is only available for medical follow-up subscribers. Upgrade your subscription to access medical advice and continuous monitoring.'
          }
        </p>
        <Button className="gap-2">
          <Stethoscope className="h-4 w-4" />
          {isRTL ? 'ترقية الاشتراك' : 'Upgrade Subscription'}
        </Button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
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
        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-2xl font-bold">
            {isRTL ? 'المتابعة الطبية' : 'Medical Follow-up'}
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount} {isRTL ? 'جديد' : 'new'}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {isRTL ? 'تابع نصائح الطبيب والتحذيرات الصحية الخاصة بك' : 'Follow your doctor\'s advice and health warnings'}
        </p>
      </div>

      {/* Health Measurements Overview */}
      {measurements.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['weight', 'blood_pressure', 'blood_sugar', 'heart_rate'].map((type) => {
            const latestMeasurement = measurements.find(m => m.measurement_type === type);
            const IconComponent = measurementIcons[type] || Activity;
            
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getMeasurementLabel(type)}
                  </span>
                </div>
                {latestMeasurement ? (
                  <>
                    <p className="text-xl font-bold">
                      {latestMeasurement.value} <span className="text-sm font-normal text-muted-foreground">{latestMeasurement.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(latestMeasurement.recorded_at)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'لا توجد بيانات' : 'No data'}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Critical Warnings */}
      {notes.filter(n => n.severity === 'critical' && !n.is_read).length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-400">
              {isRTL ? 'تحذيرات هامة' : 'Important Warnings'}
            </h3>
          </div>
          <div className="space-y-2">
            {notes.filter(n => n.severity === 'critical' && !n.is_read).map((note) => (
              <div
                key={note.id}
                onClick={() => handleViewNote(note)}
                className={`p-3 rounded-lg bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <p className="font-medium text-red-300">{note.title}</p>
                {note.content && (
                  <p className="text-sm text-red-300/70 line-clamp-1 mt-1">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes Tabs */}
      <div className="bg-card border border-border rounded-xl p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`w-full flex-wrap h-auto gap-2 bg-transparent ${isRTL ? 'flex-row-reverse' : ''}`}>
            {noteTypes.map((type) => {
              const IconComponent = type.icon;
              const count = type.id === 'all' ? notes.length : notes.filter(n => n.type === type.id).length;
              
              return (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex-1 min-w-[80px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{isRTL ? type.label : type.labelEn}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد ملاحظات طبية حالياً' : 'No medical notes at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleViewNote(note)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 ${
                      note.is_read 
                        ? 'bg-muted/30 border-border' 
                        : 'bg-card border-primary/30'
                    }`}
                  >
                    {!note.is_read && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                    )}
                    
                    <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-3 rounded-xl ${
                        note.type === 'warning' 
                          ? 'bg-yellow-500/10' 
                          : note.type === 'follow_up' 
                            ? 'bg-blue-500/10' 
                            : 'bg-green-500/10'
                      }`}>
                        {getTypeIcon(note.type)}
                      </div>
                      
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center gap-2 mb-1 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(note.type)}
                          </Badge>
                          {getSeverityBadge(note.severity)}
                        </div>
                        
                        <h4 className="font-semibold mb-1">{note.title}</h4>
                        
                        {note.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {note.content}
                          </p>
                        )}
                        
                        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(note.created_at)}</span>
                          {note.is_read && (
                            <>
                              <span>•</span>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">{isRTL ? 'تمت القراءة' : 'Read'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Note Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          {selectedNote && (
            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <DialogHeader>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-3 rounded-xl ${
                    selectedNote.type === 'warning' 
                      ? 'bg-yellow-500/10' 
                      : selectedNote.type === 'follow_up' 
                        ? 'bg-blue-500/10' 
                        : 'bg-green-500/10'
                  }`}>
                    {getTypeIcon(selectedNote.type)}
                  </div>
                  <div>
                    <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(selectedNote.type)}
                      </Badge>
                      {getSeverityBadge(selectedNote.severity)}
                    </div>
                    <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                      {selectedNote.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              {selectedNote.content && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                </div>
              )}

              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Clock className="h-4 w-4" />
                <span>{formatDate(selectedNote.created_at)}</span>
              </div>

              <Button
                onClick={() => setIsDetailsOpen(false)}
                className="w-full"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
