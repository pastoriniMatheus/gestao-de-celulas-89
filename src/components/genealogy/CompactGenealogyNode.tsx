
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Users, Crown, Star, Zap } from 'lucide-react';
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

interface CompactNodeData {
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

export const CompactGenealogyNode: React.FC<{ data: CompactNodeData }> = ({ data }) => {
  const { member, isExpanded, onToggleExpansion } = data;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              relative px-3 py-2 shadow-md rounded-lg border-2 bg-white min-w-[180px] max-w-[180px]
              cursor-pointer hover:shadow-lg transition-all duration-200
              ${member.level === 0 ? 'ring-1 ring-purple-300' : ''}
            `}
            style={{ 
              borderColor: getStatusColor(member.status, member.level),
              fontSize: '11px'
            }}
          >
            {/* Nível e expansão */}
            <div className="flex items-center justify-between mb-1">
              <Badge 
                className="text-[10px] px-1 py-0 h-4"
                style={{ 
                  backgroundColor: getStatusColor(member.status, member.level),
                  color: 'white'
                }}
              >
                {member.level === 0 ? <Crown className="w-2 h-2 mr-1" /> : <Users className="w-2 h-2 mr-1" />}
                N{member.level}
              </Badge>
              
              {member.referrals.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(member.id);
                  }}
                >
                  {isExpanded ? 
                    <ChevronDown className="w-2 h-2" /> : 
                    <ChevronRight className="w-2 h-2" />
                  }
                </Button>
              )}
            </div>

            {/* Foto e nome */}
            <div className="flex items-center gap-2 mb-1">
              <ContactAvatar
                name={member.name}
                photoUrl={member.photo_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate text-[11px]">
                  {member.name}
                </div>
                <div className="text-[9px] text-gray-500 truncate">
                  {member.cell}
                </div>
              </div>
            </div>

            {/* Status e indicadores */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Badge 
                  className="text-[9px] px-1 py-0 h-3 flex items-center gap-1"
                  style={{ 
                    backgroundColor: getStatusColor(member.status, member.level),
                    color: 'white'
                  }}
                >
                  {member.baptized && <Star className="w-2 h-2" />}
                  {member.encounterWithGod && <Zap className="w-2 h-2" />}
                  {getStatusLabel(member.status, member.level)}
                </Badge>
              </div>
              
              {member.totalDescendants > 0 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3">
                  {member.totalDescendants}
                </Badge>
              )}
            </div>

            {/* Barra de progresso */}
            {member.totalDescendants > 0 && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-0.5">
                <div 
                  className="h-0.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: getStatusColor(member.status, member.level),
                    width: `${Math.min((member.totalDescendants / 5) * 100, 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-medium">{member.name}</p>
            <p><strong>Nível:</strong> {member.level}</p>
            <p><strong>Status:</strong> {getStatusLabel(member.status, member.level)}</p>
            <p><strong>Célula:</strong> {member.cell}</p>
            <p><strong>Líder:</strong> {member.leader}</p>
            <p><strong>Rede:</strong> {member.totalDescendants}</p>
            {member.baptized && <p><strong>✓</strong> Batizado</p>}
            {member.encounterWithGod && <p><strong>✓</strong> Encontro com Deus</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
