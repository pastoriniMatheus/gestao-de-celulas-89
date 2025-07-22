
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Network, Users, UserPlus, TrendingUp } from 'lucide-react';

interface LevelMetrics {
  [level: number]: {
    count: number;
    baptized: number;
    withEncounter: number;
  };
}

interface NetworkMetricsProps {
  levelMetrics: LevelMetrics;
  totalConnected: number;
  totalStandby: number;
}

export const NetworkMetrics: React.FC<NetworkMetricsProps> = ({
  levelMetrics,
  totalConnected,
  totalStandby
}) => {
  const levels = Object.keys(levelMetrics).map(Number).sort();
  const totalMembers = totalConnected + totalStandby;
  const totalBaptized = Object.values(levelMetrics).reduce((sum, level) => sum + level.baptized, 0);
  const totalWithEncounter = Object.values(levelMetrics).reduce((sum, level) => sum + level.withEncounter, 0);
  
  // Calcular taxa de conversão (conexão vs standby)
  const connectionRate = totalMembers > 0 ? Math.round((totalConnected / totalMembers) * 100) : 0;
  
  return (
    <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Métricas da Rede
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo Geral */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Network className="w-4 h-4 text-purple-600" />
              <Badge className="bg-purple-600 text-white text-xs">
                {totalConnected}
              </Badge>
            </div>
            <div className="text-xs text-gray-600">Conectados</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <UserPlus className="w-4 h-4 text-orange-600" />
              <Badge className="bg-orange-600 text-white text-xs">
                {totalStandby}
              </Badge>
            </div>
            <div className="text-xs text-gray-600">Em Standby</div>
          </div>
        </div>

        {/* Taxa de Conexão */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de Conexão</span>
            <Badge className={`${connectionRate >= 70 ? 'bg-green-600' : connectionRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {connectionRate}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${connectionRate >= 70 ? 'bg-green-500' : connectionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${connectionRate}%` }}
            />
          </div>
        </div>

        {/* Progresso Espiritual */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Progresso Espiritual
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Batizados</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800">
                {totalBaptized}/{totalConnected}
              </Badge>
              <span className="text-xs text-gray-500">
                {totalConnected > 0 ? Math.round((totalBaptized / totalConnected) * 100) : 0}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Encontro com Deus</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                {totalWithEncounter}/{totalConnected}
              </Badge>
              <span className="text-xs text-gray-500">
                {totalConnected > 0 ? Math.round((totalWithEncounter / totalConnected) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Distribuição por Nível */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Distribuição Piramidal
          </h4>
          {levels.map(level => {
            const metrics = levelMetrics[level];
            const percentage = totalConnected > 0 ? Math.round((metrics.count / totalConnected) * 100) : 0;
            
            return (
              <div key={level} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Nível {level}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {metrics.count}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
