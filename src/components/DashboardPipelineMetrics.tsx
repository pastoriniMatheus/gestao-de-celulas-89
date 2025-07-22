
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users } from 'lucide-react';

interface PipelineMetric {
  id: string;
  name: string;
  color: string;
  position: number;
  contact_count: number;
}

export const DashboardPipelineMetrics = () => {
  const [metrics, setMetrics] = useState<PipelineMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineMetrics();
  }, []);

  const fetchPipelineMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar estágios
      const { data: stagesData, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('active', true)
        .order('position');

      if (stagesError) throw stagesError;

      // Buscar contagem de contatos por estágio
      const metricsWithCounts = await Promise.all(
        (stagesData || []).map(async (stage) => {
          const { count, error } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('pipeline_stage_id', stage.id);

          if (error) console.error('Erro ao contar contatos:', error);

          return {
            ...stage,
            contact_count: count || 0
          };
        })
      );

      setMetrics(metricsWithCounts);
    } catch (error) {
      console.error('Erro ao buscar métricas do pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estágios dos Discípulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando métricas...</div>
        </CardContent>
      </Card>
    );
  }

  const totalContacts = metrics.reduce((sum, metric) => sum + metric.contact_count, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Estágios dos Discípulos
        </CardTitle>
        <CardDescription>
          Distribuição dos discípulos por estágio do pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Geral */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-800">{totalContacts}</p>
            <p className="text-sm text-purple-600">Total de Discípulos no Pipeline</p>
          </div>

          {/* Grid de Métricas por Estágio */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
              const percentage = totalContacts > 0 ? (metric.contact_count / totalContacts) * 100 : 0;
              
              return (
                <div key={metric.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <h3 className="font-medium text-sm">{metric.name}</h3>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold" style={{ color: metric.color }}>
                      {metric.contact_count}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {percentage.toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-gray-500">
                        do total
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {metrics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Nenhum estágio configurado.</p>
              <p className="text-sm">Configure os estágios nas configurações.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
