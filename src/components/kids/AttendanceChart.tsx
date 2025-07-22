
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function AttendanceChart() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: chartData = [], isLoading, error } = useQuery({
    queryKey: ['attendance_chart', selectedClass, selectedMonth],
    queryFn: async () => {
      try {
        console.log('Buscando dados do gráfico...', { selectedClass, selectedMonth });
        
        let query = supabase
          .from('class_records')
          .select('worship_date, class, total_members, total_visitors')
          .order('worship_date');

        if (selectedClass && selectedClass !== 'all') {
          query = query.eq('class', selectedClass);
        }

        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
          const startDate = `${year}-${month}-01`;
          const endDate = `${year}-${month}-${lastDayOfMonth.toString().padStart(2, '0')}`;
          
          console.log('Filtrando por período:', { startDate, endDate });
          query = query.gte('worship_date', startDate).lte('worship_date', endDate);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar dados do gráfico:', error);
          return [];
        }

        console.log('Dados retornados:', data);

        if (!data || data.length === 0) {
          return [];
        }

        return data.map(record => ({
          date: new Date(record.worship_date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          membros: record.total_members || 0,
          visitantes: record.total_visitors || 0,
          class: record.class
        }));
      } catch (error) {
        console.error('Erro na consulta do gráfico:', error);
        return [];
      }
    }
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['distinct_classes_for_chart'],
    queryFn: async () => {
      try {
        console.log('Buscando turmas disponíveis...');
        
        const { data, error } = await supabase
          .from('class_records')
          .select('class')
          .order('class');
        
        if (error) {
          console.error('Erro ao buscar turmas:', error);
          return [];
        }
        
        const uniqueClasses = [...new Set(data?.map(record => record.class) || [])];
        console.log('Turmas encontradas:', uniqueClasses);
        return uniqueClasses.filter(Boolean);
      } catch (error) {
        console.error('Erro na consulta de turmas:', error);
        return [];
      }
    }
  });

  if (error) {
    console.error('Erro no componente AttendanceChart:', error);
    return (
      <div className="space-y-2 w-full max-w-full overflow-hidden">
        <h3 className="text-sm font-semibold text-teal-700 px-3">Gráfico de Presença</h3>
        <Card className="mx-2">
          <CardContent className="p-3">
            <div className="text-center text-red-600">
              <p className="text-sm">Erro ao carregar o gráfico</p>
              <p className="text-xs text-gray-500 mt-1">Tente recarregar a página</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      <h3 className="text-sm font-semibold text-teal-700 px-3">Gráfico de Presença</h3>
      
      <div className="flex flex-col gap-2 px-3">
        <div className="flex items-center gap-2 w-full">
          <Filter className="w-3 h-3 text-gray-500 flex-shrink-0" />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {classes.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 px-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent flex-1 min-w-0"
          />
        </div>
      </div>

      <Card className="mx-2">
        <CardHeader className="pb-2 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Presença por Data</span>
            {selectedClass && selectedClass !== 'all' && (
              <span className="text-xs font-normal text-gray-600 truncate">
                - {selectedClass}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-gray-500 text-xs">Carregando gráfico...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-gray-500 text-xs text-center">
                Nenhum dado encontrado para o período selecionado
              </div>
            </div>
          ) : (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${value}`}
                    formatter={(value, name) => [
                      value, 
                      name === 'membros' ? 'Membros' : 'Visitantes'
                    ]}
                    contentStyle={{ fontSize: '11px', padding: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="membros" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 1, r: 3 }}
                    name="Membros"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitantes" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }}
                    name="Visitantes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 px-2">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-2 text-center">
              <div className="text-lg font-bold text-green-600">
                {chartData.reduce((sum, record) => sum + record.membros, 0)}
              </div>
              <div className="text-xs text-gray-600">Membros</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-2 text-center">
              <div className="text-lg font-bold text-blue-600">
                {chartData.reduce((sum, record) => sum + record.visitantes, 0)}
              </div>
              <div className="text-xs text-gray-600">Visitantes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-2 text-center">
              <div className="text-lg font-bold text-purple-600">
                {chartData.reduce((sum, record) => sum + record.membros + record.visitantes, 0)}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
