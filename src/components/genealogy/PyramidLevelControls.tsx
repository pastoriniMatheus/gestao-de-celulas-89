
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Eye, EyeOff, Focus, Triangle } from 'lucide-react';

interface LevelMetrics {
  [level: number]: {
    count: number;
    baptized: number;
    withEncounter: number;
  };
}

interface PyramidLevelControlsProps {
  levelMetrics: LevelMetrics;
  visibleLevels: Set<number>;
  focusedLevel: number | null;
  onToggleLevel: (level: number) => void;
  onFocusLevel: (level: number | null) => void;
}

const getLevelName = (level: number): string => {
  const names = {
    0: 'Pastores',
    1: 'Líderes',
    2: 'Discipuladores',
    3: 'Em Formação',
    4: 'Novos Convertidos'
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

export const PyramidLevelControls: React.FC<PyramidLevelControlsProps> = ({
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
          <Triangle className="w-4 h-4" />
          Controle da Pirâmide de Níveis
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
                    title={isVisible ? 'Ocultar nível' : 'Mostrar nível'}
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
                    title={isFocused ? 'Remover foco' : 'Focar nível'}
                  >
                    <Focus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{metrics.count}</div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{metrics.baptized}</div>
                  <div className="text-gray-500">Batizados</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{metrics.withEncounter}</div>
                  <div className="text-gray-500">c/ Encontro</div>
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
            <ChevronDown className="w-4 h-4 mr-2" />
            Ver Todos os Níveis
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
