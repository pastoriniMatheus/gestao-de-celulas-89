
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Eye, EyeOff, Focus } from 'lucide-react';

interface LevelMetrics {
  [level: number]: {
    count: number;
    stages: { [stage: string]: number };
  };
}

interface HierarchyLevelControlsProps {
  levelMetrics: LevelMetrics;
  visibleLevels: Set<number>;
  focusedLevel: number | null;
  onToggleLevel: (level: number) => void;
  onFocusLevel: (level: number | null) => void;
}

const getLevelName = (level: number): string => {
  const names = {
    0: 'Pastores',
    1: 'Líderes/Discipuladores',
    2: 'Em Formação',
    3: 'Novos Convertidos',
    4: '4ª Geração'
  };
  return names[level as keyof typeof names] || `Nível ${level}`;
};

const getLevelColor = (level: number): string => {
  const colors = {
    0: 'bg-purple-100 text-purple-800 border-purple-200',
    1: 'bg-blue-100 text-blue-800 border-blue-200',
    2: 'bg-green-100 text-green-800 border-green-200',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    4: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const HierarchyLevelControls: React.FC<HierarchyLevelControlsProps> = ({
  levelMetrics,
  visibleLevels,
  focusedLevel,
  onToggleLevel,
  onFocusLevel
}) => {
  const levels = Object.keys(levelMetrics).map(Number).sort();

  return (
    <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ChevronDown className="w-4 h-4" />
          Controle de Níveis Hierárquicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {levels.map(level => {
          const isVisible = visibleLevels.has(level);
          const isFocused = focusedLevel === level;
          const metrics = levelMetrics[level];
          
          return (
            <div
              key={level}
              className={`p-3 rounded-lg border transition-all ${
                isFocused 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getLevelColor(level)}`}>
                    Nível {level}
                  </Badge>
                  <span className="text-sm font-medium">
                    {getLevelName(level)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleLevel(level)}
                    className="h-6 w-6 p-0"
                  >
                    {isVisible ? 
                      <Eye className="w-3 h-3" /> : 
                      <EyeOff className="w-3 h-3" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFocusLevel(isFocused ? null : level)}
                    className="h-6 w-6 p-0"
                  >
                    <Focus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{metrics.count} membros</span>
                <div className="flex gap-1">
                  {Object.entries(metrics.stages).map(([stage, count]) => (
                    <Badge key={stage} variant="outline" className="text-xs px-1 py-0">
                      {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        
        {focusedLevel !== null && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFocusLevel(null)}
            className="w-full mt-3"
          >
            Remover Foco - Ver Todos os Níveis
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
