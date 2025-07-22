
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

interface LevelMetrics {
  [level: number]: {
    count: number;
    stages: { [stage: string]: number };
  };
}

interface LevelMetricsProps {
  levelMetrics: LevelMetrics;
  totalMembers: number;
}

const getStageLabel = (stage: string): string => {
  const labels = {
    pastor: 'Pastor',
    lider: 'Líder',
    discipulador: 'Discipulador',
    em_formacao: 'Em Formação',
    novo_convertido: 'Novo Convertido'
  };
  return labels[stage as keyof typeof labels] || stage;
};

const getStageColor = (stage: string): string => {
  const colors = {
    pastor: 'bg-purple-100 text-purple-800',
    lider: 'bg-blue-100 text-blue-800',
    discipulador: 'bg-green-100 text-green-800',
    em_formacao: 'bg-yellow-100 text-yellow-800',
    novo_convertido: 'bg-red-100 text-red-800'
  };
  return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const LevelMetrics: React.FC<LevelMetricsProps> = ({
  levelMetrics,
  totalMembers
}) => {
  const levels = Object.keys(levelMetrics).map(Number).sort();
  const maxLevel = Math.max(...levels);
  
  // Calcular taxa de conversão por nível
  const conversionRates = levels.map(level => {
    if (level === 0) return 100;
    const previousLevel = level - 1;
    const currentCount = levelMetrics[level]?.count || 0;
    const previousCount = levelMetrics[previousLevel]?.count || 1;
    return Math.round((currentCount / previousCount) * 100);
  });

  return (
    <Card className="w-72 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Métricas da Hierarquia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo Geral */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total de Membros</span>
            <Badge className="bg-blue-600 text-white">
              {totalMembers}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profundidade Máxima</span>
            <Badge className="bg-purple-600 text-white">
              {maxLevel + 1} níveis
            </Badge>
          </div>
        </div>

        {/* Métricas por Nível */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Distribuição por Nível
          </h4>
          {levels.map((level, index) => {
            const metrics = levelMetrics[level];
            const percentage = Math.round((metrics.count / totalMembers) * 100);
            
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Nível {level}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metrics.count} ({percentage}%)
                    </Badge>
                    {index > 0 && (
                      <Badge 
                        className={`text-xs ${
                          conversionRates[index] >= 50 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {conversionRates[index]}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Estágios */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Por Estágio
          </h4>
          {Object.entries(
            levels.reduce((acc, level) => {
              Object.entries(levelMetrics[level].stages).forEach(([stage, count]) => {
                acc[stage] = (acc[stage] || 0) + count;
              });
              return acc;
            }, {} as { [stage: string]: number })
          ).map(([stage, count]) => (
            <div key={stage} className="flex items-center justify-between">
              <Badge className={`text-xs ${getStageColor(stage)}`}>
                {getStageLabel(stage)}
              </Badge>
              <span className="text-xs text-gray-600">
                {count} ({Math.round((count / totalMembers) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
