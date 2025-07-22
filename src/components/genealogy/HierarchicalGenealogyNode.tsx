
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, Users, Crown, Star, Zap, Plus, Minus } from 'lucide-react';
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

interface HierarchicalNodeProps {
  member: MemberNode;
  children: MemberNode[];
  isExpanded: boolean;
  onToggleExpansion: (nodeId: string) => void;
  level: number;
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

export const HierarchicalGenealogyNode: React.FC<HierarchicalNodeProps> = ({
  member,
  children,
  isExpanded,
  onToggleExpansion,
  level
}) => {
  const hasChildren = children.length > 0;
  const indentLevel = level * 24;
  
  return (
    <div className="w-full">
      {/* Nó principal */}
      <div 
        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
        style={{ marginLeft: `${indentLevel}px` }}
      >
        {/* Botão de expansão */}
        <div className="w-6 flex justify-center">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={() => onToggleExpansion(member.id)}
            >
              {isExpanded ? 
                <Minus className="w-3 h-3" /> : 
                <Plus className="w-3 h-3" />
              }
            </Button>
          )}
        </div>

        {/* Linha conectora vertical para níveis filhos */}
        {level > 0 && (
          <div className="absolute left-0 w-px bg-gray-300 h-6" 
               style={{ marginLeft: `${(level - 1) * 24 + 12}px` }} />
        )}

        {/* Avatar */}
        <ContactAvatar
          name={member.name}
          photoUrl={member.photo_url}
          size="sm"
        />

        {/* Informações do membro */}
        <div className="flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {member.name}
                  </span>
                  
                  {/* Badge de nível */}
                  <Badge 
                    className="text-xs px-1.5 py-0.5 h-5"
                    style={{ 
                      backgroundColor: getStatusColor(member.status, member.level),
                      color: 'white'
                    }}
                  >
                    {member.level === 0 ? <Crown className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                    N{member.level}
                  </Badge>

                  {/* Indicadores */}
                  <div className="flex items-center gap-1">
                    {member.baptized && (
                      <Star className="w-3 h-3 text-yellow-500" />
                    )}
                    {member.encounterWithGod && (
                      <Zap className="w-3 h-3 text-blue-500" />
                    )}
                  </div>

                  {/* Contador de descendentes */}
                  {member.totalDescendants > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                      {member.totalDescendants}
                    </Badge>
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
        </div>

        {/* Célula */}
        <div className="text-xs text-gray-500 truncate max-w-24">
          {member.cell}
        </div>

        {/* Status */}
        <Badge 
          className="text-xs px-2 py-0.5 h-5"
          variant="outline"
          style={{ 
            borderColor: getStatusColor(member.status, member.level),
            color: getStatusColor(member.status, member.level)
          }}
        >
          {getStatusLabel(member.status, member.level)}
        </Badge>
      </div>

      {/* Filhos expandidos */}
      {isExpanded && hasChildren && (
        <div className="relative">
          {children.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Linha conectora horizontal */}
              <div 
                className="absolute w-6 h-px bg-gray-300 top-4"
                style={{ left: `${level * 24 + 12}px` }}
              />
              
              <HierarchicalGenealogyNode
                member={child}
                children={[]} // Os filhos serão passados recursivamente
                isExpanded={false} // Controle de expansão será gerenciado pelo componente pai
                onToggleExpansion={onToggleExpansion}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
