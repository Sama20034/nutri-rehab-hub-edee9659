import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  specialization: string | null;
  license_number: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  role: string;
}

interface DoctorsSectionProps {
  doctors: UserWithRole[];
  onApprove: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onEdit?: (doctor: UserWithRole) => void;
  onDelete?: (doctor: UserWithRole) => void;
}

export const DoctorsSection = ({
  doctors,
  onApprove,
  onSuspend,
  onEdit,
  onDelete
}: DoctorsSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.phone?.includes(searchQuery)
  );

  const handleToggleStatus = (doctor: UserWithRole) => {
    if (doctor.status === 'approved') {
      onSuspend(doctor.user_id);
    } else {
      onApprove(doctor.user_id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة الأطباء' : 'Manage Doctors'}</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {doctors.length} {isRTL ? 'طبيب' : 'doctor(s)'}
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={isRTL ? 'بحث...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'} bg-muted/50`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="space-y-3">
        {filteredDoctors.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد أطباء' : 'No doctors found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Doctor Info */}
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={doctor.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="font-semibold">{doctor.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge 
                            variant={doctor.status === 'approved' ? 'default' : 'secondary'}
                            className={doctor.status === 'approved' 
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {doctor.status === 'approved' 
                              ? (isRTL ? 'موافق عليه' : 'Approved') 
                              : (isRTL ? 'معلق' : 'Pending')
                            }
                          </Badge>
                          {doctor.specialization && (
                            <span className="text-xs text-muted-foreground">
                              {doctor.specialization}
                            </span>
                          )}
                        </div>
                        {doctor.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{doctor.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={doctor.status === 'approved'}
                        onCheckedChange={() => handleToggleStatus(doctor)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onEdit?.(doctor)}
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onDelete?.(doctor)}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
