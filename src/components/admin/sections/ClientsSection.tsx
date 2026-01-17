import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Trash2 } from 'lucide-react';
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

interface ClientsSectionProps {
  clients: UserWithRole[];
  onApprove: (userId: string) => void;
  onSuspend: (userId: string) => void;
  onEdit?: (client: UserWithRole) => void;
  onDelete?: (client: UserWithRole) => void;
}

export const ClientsSection = ({
  clients,
  onApprove,
  onSuspend,
  onEdit,
  onDelete
}: ClientsSectionProps) => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  const handleToggleStatus = (client: UserWithRole) => {
    if (client.status === 'approved') {
      onSuspend(client.user_id);
    } else {
      onApprove(client.user_id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isRTL ? 'إدارة العملاء' : 'Manage Clients'}</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {clients.length} {isRTL ? 'عميل' : 'client(s)'}
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

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد عملاء' : 'No clients found'}</p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Client Info */}
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-12 w-12 border-2 border-accent/30">
                        <AvatarImage src={client.avatar_url || undefined} />
                        <AvatarFallback className="bg-accent/20">
                          <Users className="h-6 w-6 text-accent" />
                        </AvatarFallback>
                      </Avatar>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="font-semibold">{client.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={client.status === 'approved' ? 'default' : 'secondary'}
                            className={client.status === 'approved' 
                              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {client.status === 'approved' 
                              ? (isRTL ? 'موافق عليه' : 'Approved') 
                              : (isRTL ? 'معلق' : 'Pending')
                            }
                          </Badge>
                        </div>
                        {client.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{client.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={client.status === 'approved'}
                        onCheckedChange={() => handleToggleStatus(client)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onEdit?.(client)}
                        className="h-9 w-9"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => onDelete?.(client)}
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
