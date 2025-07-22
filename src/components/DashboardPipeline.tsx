
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Users } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  contact_count: number;
}

export const DashboardPipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
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
      const stagesWithCounts = await Promise.all(
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

      setStages(stagesWithCounts);
    } catch (error) {
      console.error('Erro ao buscar dados do pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando pipeline...</div>
        </CardContent>
      </Card>
    );
  }

  const totalContacts = stages.reduce((sum, stage) => sum + stage.contact_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Pipeline de Contatos
        </CardTitle>
        <CardDescription>
          Visualização dos contatos por estágio do funil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resumo Total */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-800">{totalContacts}</p>
            <p className="text-sm text-blue-600">Total de Contatos no Pipeline</p>
          </div>

          {/* Estágios do Pipeline */}
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const percentage = totalContacts > 0 ? (stage.contact_count / totalContacts) * 100 : 0;
              
              return (
                <div key={stage.id} className="relative">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{stage.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {stage.contact_count} contatos
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {percentage.toFixed(1)}% do total
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: stage.color }}>
                        {stage.contact_count}
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        backgroundColor: stage.color,
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                  
                  {/* Seta para próximo estágio */}
                  {index < stages.length - 1 && (
                    <div className="flex justify-center mt-2 mb-2">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {stages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum estágio de pipeline configurado.</p>
              <p className="text-sm">Configure os estágios nas configurações do sistema.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
