
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Star, Zap, UserCheck } from 'lucide-react';
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
  photo_url: string | null;
  founder: boolean;
  leader_id: string | null;
}

interface PyramidGenealogyViewProps {
  members: MemberNode[];
  mode: 'evangelism' | 'discipleship';
}

const getLevelColor = (level: number): string => {
  const colors = {
    0: 'bg-purple-100 text-purple-800 border-purple-300',
    1: 'bg-blue-100 text-blue-800 border-blue-300',
    2: 'bg-green-100 text-green-800 border-green-300',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    4: 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getLevelName = (level: number, mode: 'evangelism' | 'discipleship'): string => {
  if (mode === 'evangelism') {
    const names = {
      0: 'Fundadores',
      1: 'Primeira Geração',
      2: 'Segunda Geração',
      3: 'Terceira Geração',
      4: 'Quarta Geração'
    };
    return names[level as keyof typeof names] || `${level + 1}ª Geração`;
  } else {
    const names = {
      0: 'Pastores/Líderes',
      1: 'Discipuladores',
      2: 'Em Formação',
      3: 'Novos Convertidos',
      4: 'Visitantes'
    };
    return names[level as keyof typeof names] || `Nível ${level}`;
  }
};

export const PyramidGenealogyView: React.FC<PyramidGenealogyViewProps> = ({ members, mode }) => {
  // Agrupar membros por nível
  const membersByLevel = members.reduce((acc, member) => {
    if (!acc[member.level]) {
      acc[member.level] = [];
    }
    acc[member.level].push(member);
    return acc;
  }, {} as Record<number, MemberNode[]>);

  // Ordenar níveis
  const levels = Object.keys(membersByLevel).map(Number).sort();

  const getModeTitle = () => {
    return mode === 'evangelism' ? 'Rede por Indicação (Quem Ganhou)' : 'Rede de Discipulado (Liderança)';
  };

  const getModeDescription = () => {
    return mode === 'evangelism' 
      ? 'Estrutura baseada em quem ganhou cada pessoa para Jesus'
      : 'Estrutura baseada na liderança e discipulado';
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-50 to-blue-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header do modo */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            {mode === 'evangelism' ? <UserCheck className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
            {getModeTitle()}
          </h2>
          <p className="text-gray-600">{getModeDescription()}</p>
        </div>

        {levels.map(level => {
          const levelMembers = membersByLevel[level];
          const maxMembersPerRow = Math.max(1, Math.floor(12 / Math.max(1, level + 1)));
          
          return (
            <div key={level} className="space-y-4">
              {/* Header do Nível */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getLevelColor(level)}`}>
                  {level === 0 ? <Crown className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  <span className="font-bold text-lg">{getLevelName(level, mode)}</span>
                  <Badge variant="outline" className="ml-2">
                    {levelMembers.length} membros
                  </Badge>
                </div>
              </div>

              {/* Membros do Nível em Grade */}
              <div 
                className="grid gap-4 justify-center"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(levelMembers.length, maxMembersPerRow)}, minmax(200px, 1fr))`,
                  maxWidth: `${Math.min(levelMembers.length, maxMembersPerRow) * 220}px`,
                  margin: '0 auto'
                }}
              >
                {levelMembers.map(member => (
                  <div
                    key={member.id}
                    className={`
                      relative p-4 rounded-lg border-2 bg-white shadow-sm
                      hover:shadow-md transition-shadow cursor-pointer
                      ${getLevelColor(level)}
                      ${member.founder ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    {/* Conexão visual para o nível superior */}
                    {level > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                    )}

                    {/* Avatar e Nome */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <ContactAvatar
                          name={member.name}
                          photoUrl={member.photo_url}
                          size="md"
                        />
                        {member.founder && (
                          <div className="absolute -top-1 -right-1">
                            <Crown className="w-4 h-4 text-yellow-500 bg-white rounded-full p-0.5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-sm truncate max-w-full">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {member.cell}
                        </p>
                        {member.founder && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Fundador
                          </Badge>
                        )}
                      </div>

                      {/* Indicadores */}
                      <div className="flex items-center gap-1">
                        {member.baptized && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                        {member.encounterWithGod && (
                          <Zap className="w-4 h-4 text-blue-500" />
                        )}
                      </div>

                      {/* Estatísticas */}
                      {member.totalDescendants > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Rede: {member.totalDescendants}
                        </Badge>
                      )}
                    </div>

                    {/* Conexões para níveis inferiores */}
                    {member.referrals.length > 0 && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Linha conectora entre níveis */}
              {level < levels[levels.length - 1] && levelMembers.length > 0 && (
                <div className="flex justify-center mt-4">
                  <div className="w-32 h-px bg-gray-300"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Estatísticas Gerais */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-lg border shadow-sm">
            <div className="text-center">
              <div className="font-bold text-2xl text-purple-600">{members.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-blue-600">
                {members.filter(m => m.baptized).length}
              </div>
              <div className="text-xs text-gray-600">Batizados</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-green-600">
                {members.filter(m => m.encounterWithGod).length}
              </div>
              <div className="text-xs text-gray-600">c/ Encontro</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-yellow-600">
                {members.filter(m => m.founder).length}
              </div>
              <div className="text-xs text-gray-600">Fundadores</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
