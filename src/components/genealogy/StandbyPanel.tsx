
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Phone, MapPin, Star, Zap } from 'lucide-react';
import { ContactAvatar } from '@/components/ContactAvatar';

interface MemberNode {
  id: string;
  name: string;
  leader: string;
  cell: string;
  status: string;
  whatsapp?: string | null;
  neighborhood?: string;
  baptized: boolean;
  encounterWithGod: boolean;
  photo_url?: string | null;
}

interface StandbyPanelProps {
  members: MemberNode[];
}

const getStatusColor = (status: string) => {
  const colors = {
    member: '#3B82F6',
    pending: '#F59E0B',
    visitor: '#6B7280'
  };
  return colors[status as keyof typeof colors] || '#6B7280';
};

const getStatusLabel = (status: string) => {
  const labels = {
    member: 'Membro',
    pending: 'Pendente',
    visitor: 'Visitante'
  };
  return labels[status as keyof typeof labels] || status;
};

export const StandbyPanel: React.FC<StandbyPanelProps> = ({ members }) => {
  if (members.length === 0) {
    return (
      <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Membros em Standby
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center">
            Todos os membros estão conectados na rede!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Membros em Standby ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="p-4 space-y-3">
            {members.map(member => (
              <div
                key={member.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <ContactAvatar
                    name={member.name}
                    photoUrl={member.photo_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {member.cell} • {member.leader}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {member.baptized && (
                      <div className="relative group">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Batizado
                        </div>
                      </div>
                    )}
                    {member.encounterWithGod && (
                      <div className="relative group">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Encontro com Deus
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(member.whatsapp || member.neighborhood) && (
                  <div className="space-y-1 mb-2">
                    {member.whatsapp && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{member.whatsapp}</span>
                      </div>
                    )}
                    {member.neighborhood && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{member.neighborhood}</span>
                      </div>
                    )}
                  </div>
                )}

                <Badge 
                  className="text-xs"
                  style={{ 
                    backgroundColor: getStatusColor(member.status),
                    color: 'white'
                  }}
                >
                  {getStatusLabel(member.status)}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
