
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B'];

interface AnalysisData {
  name: string;
  value: number;
  color: string;
}

export const DiscipleAnalysisChart = () => {
  const [analysisType, setAnalysisType] = useState<string>('baptized');
  const [data, setData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [analysisType]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'member');

      if (error) throw error;

      let analysisData: AnalysisData[] = [];

      switch (analysisType) {
        case 'baptized':
          const baptized = contacts?.filter(c => c.baptized).length || 0;
          const notBaptized = (contacts?.length || 0) - baptized;
          analysisData = [
            { name: 'Batizados', value: baptized, color: COLORS[0] },
            { name: 'Não Batizados', value: notBaptized, color: COLORS[1] }
          ];
          break;
        
        case 'encounter':
          const withEncounter = contacts?.filter(c => c.encounter_with_god).length || 0;
          const withoutEncounter = (contacts?.length || 0) - withEncounter;
          analysisData = [
            { name: 'Encontro com Deus', value: withEncounter, color: COLORS[0] },
            { name: 'Sem Encontro', value: withoutEncounter, color: COLORS[1] }
          ];
          break;
        
        case 'status':
          const members = contacts?.filter(c => c.status === 'member').length || 0;
          const { data: visitorsData } = await supabase
            .from('contacts')
            .select('*')
            .eq('status', 'visitor');
          const visitors = visitorsData?.length || 0;
          const { data: pendingData } = await supabase
            .from('contacts')
            .select('*')
            .eq('status', 'pending');
          const pending = pendingData?.length || 0;
          
          analysisData = [
            { name: 'Membros', value: members, color: COLORS[0] },
            { name: 'Visitantes', value: visitors, color: COLORS[1] },
            { name: 'Pendentes', value: pending, color: COLORS[2] }
          ];
          break;
      }

      setData(analysisData.filter(item => item.value > 0));
    } catch (error) {
      console.error('Erro ao buscar dados de análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (analysisType) {
      case 'baptized':
        return 'Análise dos Discípulos - Batismo';
      case 'encounter':
        return 'Análise dos Discípulos - Encontro com Deus';
      case 'status':
        return 'Análise dos Discípulos - Status';
      default:
        return 'Análise dos Discípulos';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {getTitle()}
        </CardTitle>
        <CardDescription>
          Visualização detalhada dos discípulos por categoria
        </CardDescription>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tipo de análise:</label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baptized">Batizados</SelectItem>
              <SelectItem value="encounter">Encontro com Deus</SelectItem>
              <SelectItem value="status">Status dos Contatos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
