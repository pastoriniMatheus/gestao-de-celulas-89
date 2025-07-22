
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Users, TreePine, List, Triangle, UserCheck, Crown } from 'lucide-react';
import { HierarchicalGenealogyNode } from './genealogy/HierarchicalGenealogyNode';
import { PyramidGenealogyView } from './genealogy/PyramidGenealogyView';
import { StandbyPanel } from './genealogy/StandbyPanel';
import { NetworkMetrics } from './genealogy/NetworkMetrics';
import { useContacts } from '@/hooks/useContacts';
import { useCells } from '@/hooks/useCells';

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
  photo_url: string | null;
  founder: boolean;
  leader_id: string | null;
}

type GenealogyMode = 'evangelism' | 'discipleship';

export const GenealogyNetwork = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showStandby, setShowStandby] = useState(false);
  const [viewMode, setViewMode] = useState<'pyramid' | 'list'>('pyramid');
  const [genealogyMode, setGenealogyMode] = useState<GenealogyMode>('evangelism');
  
  const { contacts, loading: contactsLoading } = useContacts();
  const { cells, loading: cellsLoading } = useCells();

  // Processar dados dos contatos em estrutura hierárquica
  const { connectedMembers, standbyMembers, hierarchicalData } = useMemo(() => {
    if (contactsLoading || cellsLoading || !contacts.length) {
      return { connectedMembers: [], standbyMembers: [], hierarchicalData: [] };
    }

    const cellsMap = new Map(cells.map(cell => [cell.id, cell]));

    // Transformar contatos em membros
    const allMembers: MemberNode[] = contacts.map(contact => {
      const cell = contact.cell_id ? cellsMap.get(contact.cell_id) : null;
      
      return {
        id: contact.id,
        name: contact.name,
        leader: cell?.leader_name || 'Sem líder',
        cell: cell?.name || 'Sem célula',
        status: contact.status,
        referredBy: genealogyMode === 'evangelism' ? contact.referred_by : contact.leader_id,
        referrals: [],
        whatsapp: contact.whatsapp,
        neighborhood: contact.neighborhood,
        baptized: contact.baptized || false,
        encounterWithGod: contact.encounter_with_god || false,
        level: 0,
        totalDescendants: 0,
        photo_url: contact.photo_url || null,
        founder: contact.founder || false,
        leader_id: contact.leader_id || null
      };
    });

    // Preencher referrals e calcular níveis baseado no modo
    allMembers.forEach(member => {
      const connectionField = genealogyMode === 'evangelism' ? 'referred_by' : 'leader_id';
      const sourceField = genealogyMode === 'evangelism' ? 'referredBy' : 'leader_id';
      
      member.referrals = allMembers
        .filter(m => m[sourceField] === member.id)
        .map(m => m.id);
      
      member.level = calculateMemberLevel(member.id, allMembers, genealogyMode);
      member.totalDescendants = calculateTotalDescendants(member.id, allMembers, genealogyMode);
    });

    // Separar membros conectados dos em standby
    const connected = allMembers.filter(member => {
      const connectionField = genealogyMode === 'evangelism' ? 'referredBy' : 'leader_id';
      return member[connectionField] || member.referrals.length > 0 || member.founder;
    });
    
    const standby = allMembers.filter(member => {
      const connectionField = genealogyMode === 'evangelism' ? 'referredBy' : 'leader_id';
      return !member[connectionField] && member.referrals.length === 0 && !member.founder;
    });

    // Criar estrutura hierárquica - incluir fundadores no topo
    const hierarchical = buildHierarchicalStructure(connected, genealogyMode);

    return { connectedMembers: connected, standbyMembers: standby, hierarchicalData: hierarchical };
  }, [contacts, cells, contactsLoading, cellsLoading, genealogyMode]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (prev.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Calcular métricas por nível
  const levelMetrics = useMemo(() => {
    const metrics: { [level: number]: { count: number; baptized: number; withEncounter: number } } = {};
    
    connectedMembers.forEach(member => {
      if (!metrics[member.level]) {
        metrics[member.level] = { count: 0, baptized: 0, withEncounter: 0 };
      }
      metrics[member.level].count++;
      if (member.baptized) metrics[member.level].baptized++;
      if (member.encounterWithGod) metrics[member.level].withEncounter++;
    });
    
    return metrics;
  }, [connectedMembers]);

  const expandAll = () => {
    setExpandedNodes(new Set(connectedMembers.map(m => m.id)));
  };

  const collapseAll = () => {
    const rootMembers = connectedMembers.filter(m => {
      const connectionField = genealogyMode === 'evangelism' ? 'referredBy' : 'leader_id';
      return !m[connectionField] || m.founder;
    });
    setExpandedNodes(new Set(rootMembers.map(m => m.id)));
  };

  if (contactsLoading || cellsLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando rede de discipulado...</p>
        </div>
      </div>
    );
  }

  if (!connectedMembers.length && !standbyMembers.length) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum membro encontrado para a rede de discipulado.</p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione contatos para visualizar a rede de discipulado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative border rounded-lg overflow-hidden bg-white">
      {/* Header com controles */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Seletor de modo de genealogia */}
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant={genealogyMode === 'evangelism' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGenealogyMode('evangelism')}
                className="text-xs h-8"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Quem Ganhou
              </Button>
              
              <Button
                variant={genealogyMode === 'discipleship' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGenealogyMode('discipleship')}
                className="text-xs h-8"
              >
                <Crown className="w-4 h-4 mr-1" />
                Discipulado
              </Button>
            </div>

            {/* Divisor visual */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Controles de visualização */}
            <Button
              variant={viewMode === 'pyramid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('pyramid')}
              className="text-xs h-8"
            >
              <Triangle className="w-4 h-4 mr-1" />
              Discipulado
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-xs h-8"
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
            
            {viewMode === 'list' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="text-xs h-8"
                >
                  <TreePine className="w-4 h-4 mr-1" />
                  Expandir
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="text-xs h-8"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Colapsar
                </Button>
              </>
            )}
          </div>

          <Button
            variant={showStandby ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStandby(!showStandby)}
            className="text-xs h-8"
          >
            <Users className="w-4 h-4 mr-1" />
            Standby ({standbyMembers.length})
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="pt-16 pb-2 h-full overflow-hidden">
        {viewMode === 'pyramid' ? (
          <PyramidGenealogyView members={connectedMembers} mode={genealogyMode} />
        ) : (
          <div className="h-full overflow-y-auto">
            {hierarchicalData.map(rootMember => (
              <HierarchicalTreeView 
                key={rootMember.id}
                member={rootMember}
                allMembers={connectedMembers}
                expandedNodes={expandedNodes}
                onToggleExpansion={toggleNodeExpansion}
                level={0}
                mode={genealogyMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Métricas da Rede */}
      {viewMode === 'list' && (
        <div className="absolute bottom-2 left-2 z-10">
          <NetworkMetrics 
            levelMetrics={levelMetrics}
            totalConnected={connectedMembers.length}
            totalStandby={standbyMembers.length}
          />
        </div>
      )}

      {/* Painel de Standby */}
      {showStandby && (
        <div className="absolute bottom-2 right-2 z-10">
          <StandbyPanel members={standbyMembers} />
        </div>
      )}
    </div>
  );
};

// Componente para renderizar árvore hierárquica
interface HierarchicalTreeViewProps {
  member: MemberNode;
  allMembers: MemberNode[];
  expandedNodes: Set<string>;
  onToggleExpansion: (nodeId: string) => void;
  level: number;
  mode: GenealogyMode;
}

const HierarchicalTreeView: React.FC<HierarchicalTreeViewProps> = ({
  member,
  allMembers,
  expandedNodes,
  onToggleExpansion,
  level,
  mode
}) => {
  // Encontrar filhos diretos baseado no modo
  const connectionField = mode === 'evangelism' ? 'referredBy' : 'leader_id';
  const children = allMembers.filter(m => m[connectionField] === member.id);
  const isExpanded = expandedNodes.has(member.id);

  return (
    <div>
      <HierarchicalGenealogyNode
        member={member}
        children={children}
        isExpanded={isExpanded}
        onToggleExpansion={onToggleExpansion}
        level={level}
      />
      
      {/* Renderizar filhos recursivamente */}
      {isExpanded && children.map(child => (
        <HierarchicalTreeView
          key={child.id}
          member={child}
          allMembers={allMembers}
          expandedNodes={expandedNodes}
          onToggleExpansion={onToggleExpansion}
          level={level + 1}
          mode={mode}
        />
      ))}
    </div>
  );
};

// Funções auxiliares com proteção contra loops infinitos
function calculateMemberLevel(memberId: string, members: MemberNode[], mode: GenealogyMode, visited = new Set<string>()): number {
  // Proteção contra loops infinitos
  if (visited.has(memberId)) {
    console.warn(`Circular reference detected for member ${memberId}`);
    return 0;
  }
  
  const member = members.find(m => m.id === memberId);
  if (!member) return 0;
  
  const connectionField = mode === 'evangelism' ? 'referredBy' : 'leader_id';
  const parentId = member[connectionField];
  
  if (!parentId || member.founder) return 0;
  
  // Adicionar este membro ao conjunto de visitados
  visited.add(memberId);
  
  const level = 1 + calculateMemberLevel(parentId, members, mode, visited);
  
  // Remover este membro do conjunto de visitados ao retornar
  visited.delete(memberId);
  
  return level;
}

function calculateTotalDescendants(memberId: string, members: MemberNode[], mode: GenealogyMode, visited = new Set<string>()): number {
  // Proteção contra loops infinitos
  if (visited.has(memberId)) {
    console.warn(`Circular reference detected for member ${memberId}`);
    return 0;
  }
  
  const member = members.find(m => m.id === memberId);
  if (!member) return 0;
  
  const connectionField = mode === 'evangelism' ? 'referredBy' : 'leader_id';
  const children = members.filter(m => m[connectionField] === memberId);
  
  // Adicionar este membro ao conjunto de visitados
  visited.add(memberId);
  
  let total = children.length;
  children.forEach(child => {
    total += calculateTotalDescendants(child.id, members, mode, visited);
  });
  
  // Remover este membro do conjunto de visitados ao retornar
  visited.delete(memberId);
  
  return total;
}

function buildHierarchicalStructure(members: MemberNode[], mode: GenealogyMode): MemberNode[] {
  const connectionField = mode === 'evangelism' ? 'referredBy' : 'leader_id';
  // Retornar membros raiz (fundadores ou sem conexão superior)
  return members.filter(member => !member[connectionField] || member.founder);
}
