
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Users, Crown, Phone, MapPin, Star, Zap } from 'lucide-react';
import { ContactAvatar } from '@/components/ContactAvatar';

interface MemberNode {
  id: string;
  name: string;
  leader: string;
  cell: string;
  status: string;
  referredBy: string | null;
  referrals: string[];
  whatsapp?: string | null;
  neighborhood?: string;
  baptized: boolean;
  encounterWithGod: boolean;
  level: number;
  totalDescendants: number;
  photo_url?: string | null;
}

interface CustomNodeData {
  member: MemberNode;
  isExpanded: boolean;
  onToggleExpansion: (nodeId: string) => void;
}

const getStatusColor = (status: string, level: number) => {
  const colors = {
    member: level === 0 ? '#8B5CF6' : '#3B82F6',
    pending: '#F59E0B',
    visitor: '#6B7280'
  };
  return colors[status as keyof typeof colors] || '#6B7280';
};

const getStatusLabel = (status: string, level: number) => {
  if (level === 0) return 'Pastor';
  const labels = {
    member: level === 1 ? 'Líder' : 'Discípulo',
    pending: 'Pendente',
    visitor: 'Visitante'
  };
  return labels[status as keyof typeof labels] || status;
};

const getLevelIcon = (level: number) => {
  if (level === 0) return Crown;
  return Users;
};

export const GenealogyNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const { member, isExpanded, onToggleExpansion } = data;
  const LevelIcon = getLevelIcon(member.level);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              relative px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[280px] max-w-[280px]
              cursor-pointer hover:shadow-xl transition-all duration-200
              ${member.level === 0 ? 'ring-2 ring-purple-200' : ''}
            `}
            style={{ 
              borderColor: getStatusColor(member.status, member.level),
              transform: `scale(${Math.max(0.85, 1 - member.level * 0.02)})` 
            }}
          >
            {/* Indicador de nível */}
            <div className="absolute -top-2 -left-2 flex items-center gap-1">
              <Badge 
                className="text-xs px-2 py-1"
                style={{ 
                  backgroundColor: getStatusColor(member.status, member.level),
                  color: 'white'
                }}
              >
                <LevelIcon className="w-3 h-3 mr-1" />
                N{member.level}
              </Badge>
            </div>

            {/* Botão de expansão */}
            {member.referrals.length > 0 && (
              <div className="absolute -top-2 -right-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-white border-2 rounded-full hover:bg-gray-50"
                  style={{ borderColor: getStatusColor(member.status, member.level) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(member.id);
                  }}
                >
                  {isExpanded ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                  }
                </Button>
              </div>
            )}

            {/* Indicadores de progresso espiritual */}
            <div className="absolute top-1 right-1 flex gap-1">
              {member.baptized && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Batizado" />
              )}
              {member.encounterWithGod && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Encontro com Deus" />
              )}
            </div>

            {/* Header com foto e nome */}
            <div className="flex items-center gap-3 mb-3">
              <ContactAvatar
                name={member.name}
                photoUrl={member.photo_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {member.name}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  <strong>Líder:</strong> {member.leader}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mb-2 truncate">
              <strong>Célula:</strong> {member.cell}
            </div>

            {/* Informações de contato */}
            {member.whatsapp && (
              <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="truncate">{member.whatsapp}</span>
              </div>
            )}

            {member.neighborhood && (
              <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{member.neighborhood}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Badge 
                className="text-xs flex items-center gap-1"
                style={{ 
                  backgroundColor: getStatusColor(member.status, member.level),
                  color: 'white'
                }}
              >
                {member.baptized && <Star className="w-3 h-3" />}
                {member.encounterWithGod && <Zap className="w-3 h-3" />}
                {getStatusLabel(member.status, member.level)}
              </Badge>
              
              {member.totalDescendants > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {member.totalDescendants}
                </Badge>
              )}
            </div>

            {/* Barra de progresso da rede */}
            {member.totalDescendants > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="h-1 rounded-full transition-all"
                  style={{ 
                    backgroundColor: getStatusColor(member.status, member.level),
                    width: `${Math.min((member.totalDescendants / 10) * 100, 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{member.name}</p>
            <div className="text-sm space-y-1">
              <p><strong>Nível:</strong> {member.level}</p>
              <p><strong>Status:</strong> {getStatusLabel(member.status, member.level)}</p>
              <p><strong>Referências diretas:</strong> {member.referrals.length}</p>
              <p><strong>Total da rede:</strong> {member.totalDescendants}</p>
              <p><strong>Célula:</strong> {member.cell}</p>
              <p><strong>Líder:</strong> {member.leader}</p>
              {member.baptized && <p><strong>✓</strong> Batizado</p>}
              {member.encounterWithGod && <p><strong>✓</strong> Encontro com Deus</p>}
              {member.whatsapp && <p><strong>WhatsApp:</strong> {member.whatsapp}</p>}
              {member.neighborhood && <p><strong>Bairro:</strong> {member.neighborhood}</p>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
