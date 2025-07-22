
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Calendar } from 'lucide-react';

interface AttendanceData {
  period: string;
  members: number;
  visitors: number;
  total: number;
}

export const AttendanceLineChart = () => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchAttendanceData();
  }, [period]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      console.log('AttendanceLineChart: Buscando dados para período:', period);

      // Buscar dados de presença dos últimos 12 meses ou anos
      const { data: attendanceData, error } = await supabase
        .from('attendances')
        .select(`
          attendance_date,
          present,
          visitor,
          contact_id,
          contacts (
            status
          )
        `)
        .eq('present', true)
        .gte('attendance_date', 
          period === 'month' 
            ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 12 meses
            : new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 anos
        )
        .order('attendance_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar dados de presença:', error);
        return;
      }

      console.log('AttendanceLineChart: Dados brutos:', attendanceData);

      // Agrupar dados por período
      const groupedData: { [key: string]: { members: Set<string>, visitors: Set<string> } } = {};

      attendanceData?.forEach(attendance => {
        const date = new Date(attendance.attendance_date);
        let periodKey: string;

        if (period === 'month') {
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          periodKey = date.getFullYear().toString();
        }

        if (!groupedData[periodKey]) {
          groupedData[periodKey] = {
            members: new Set(),
            visitors: new Set()
          };
        }

        // Classificar como membro ou visitante baseado no status atual do contato
        const contactStatus = attendance.contacts?.status;
        const isVisitor = attendance.visitor || contactStatus === 'visitor';

        if (isVisitor) {
          groupedData[periodKey].visitors.add(attendance.contact_id);
        } else {
          groupedData[periodKey].members.add(attendance.contact_id);
        }
      });

      // Converter para array e formatar
      const formattedData: AttendanceData[] = Object.entries(groupedData)
        .map(([periodKey, data]) => {
          const membersCount = data.members.size;
          const visitorsCount = data.visitors.size;
          
          return {
            period: period === 'month' 
              ? new Date(periodKey + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
              : periodKey,
            members: membersCount,
            visitors: visitorsCount,
            total: membersCount + visitorsCount
          };
        })
        .sort((a, b) => a.period.localeCompare(b.period));

      console.log('AttendanceLineChart: Dados formatados:', formattedData);
      setData(formattedData);

    } catch (error) {
      console.error('Erro ao processar dados de presença:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = data.reduce((sum, item) => sum + item.members, 0);
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);
  const totalPresences = totalMembers + totalVisitors;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Presença ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Acompanhe a evolução da presença de membros e visitantes
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(value: 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Por Mês</SelectItem>
              <SelectItem value="year">Por Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="h-12 w-12 mb-4 text-gray-400" />
            <p>Nenhum dado de presença encontrado</p>
            <p className="text-sm">Registre presenças para visualizar o gráfico</p>
          </div>
        ) : (
          <>
            {/* Estatísticas resumidas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
                <div className="text-sm text-gray-600">Total Membros</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{totalVisitors}</div>
                <div className="text-sm text-gray-600">Total Visitantes</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{totalPresences}</div>
                <div className="text-sm text-gray-600">Total Presenças</div>
              </div>
            </div>

            {/* Gráfico */}
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="members" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                    name="Membros"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                    name="Visitantes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
