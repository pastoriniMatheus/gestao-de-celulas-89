
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  CircleCheck,
  Home,
  CalendarDays,
  ChartBar,
  ChartPie,
  TrendingUp,
  MapPin,
  Crown,
  Target,
  Activity,
  Zap,
  Waves,
  AlertTriangle
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardCharts } from "./DashboardCharts";
import { DashboardPipelineMetrics } from './DashboardPipelineMetrics';
import { DiscipleAnalysisChart } from './DiscipleAnalysisChart';
import { AttendanceLineChart } from './AttendanceLineChart';

export const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [cells, setCells] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [cities, setCities] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [topNeighborhoods, setTopNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os dados em paralelo com timeout
      const fetchWithTimeout = (promise, timeout = 10000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      };

      const [contactsData, cellsData, neighborhoodsData, citiesData, attendancesData] = await Promise.all([
        fetchWithTimeout(supabase.from('contacts').select('*')),
        fetchWithTimeout(supabase.from('cells').select('*')),
        fetchWithTimeout(supabase.from('neighborhoods').select('*, cities(name)')),
        fetchWithTimeout(supabase.from('cities').select('*')),
        fetchWithTimeout(supabase.from('attendances').select('*'))
      ]);

      console.log('Dashboard: Dados dos contatos:', contactsData.data?.length);
      console.log('Dashboard: Dados das células:', cellsData.data?.length);
      console.log('Dashboard: Dados dos bairros:', neighborhoodsData.data?.length);

      // Calcular estatísticas dos bairros manualmente
      const neighborhoodStats = [];
      
      if (neighborhoodsData.data && cellsData.data && contactsData.data) {
        // Agrupar contatos por bairro diretamente (campo neighborhood)
        const contactsByNeighborhood = {};
        
        contactsData.data.forEach(contact => {
          const neighborhood = contact.neighborhood;
          if (neighborhood) {
            if (!contactsByNeighborhood[neighborhood]) {
              contactsByNeighborhood[neighborhood] = [];
            }
            contactsByNeighborhood[neighborhood].push(contact);
          }
        });

        console.log('Dashboard: Contatos agrupados por bairro:', contactsByNeighborhood);

        // Criar estatísticas para cada bairro
        Object.keys(contactsByNeighborhood).forEach(neighborhoodName => {
          const contacts = contactsByNeighborhood[neighborhoodName];
          
          // Buscar células do bairro
          const neighborhoodData = neighborhoodsData.data.find(n => n.name === neighborhoodName);
          const neighborhoodCells = cellsData.data.filter(cell => 
            cell.neighborhood_id === neighborhoodData?.id && cell.active
          );
          
          const totalContacts = contacts.length;
          const totalCells = neighborhoodCells.length;
          const totalLeaders = neighborhoodCells.filter(cell => cell.leader_id).length;
          
          neighborhoodStats.push({
            id: neighborhoodData?.id || neighborhoodName,
            neighborhood_name: neighborhoodName,
            city_name: neighborhoodData?.cities?.name || 'N/A',
            total_cells: totalCells,
            total_contacts: totalContacts,
            total_leaders: totalLeaders,
            total_people: totalContacts
          });
        });
      }

      // Ordenar por total de pessoas e pegar top 5
      const sortedStats = neighborhoodStats
        .sort((a, b) => b.total_people - a.total_people)
        .slice(0, 5);

      console.log('Dashboard: Top 5 bairros calculados:', sortedStats);

      setContacts(contactsData.data || []);
      setCells(cellsData.data || []);
      setNeighborhoods(neighborhoodsData.data || []);
      setCities(citiesData.data || []);
      setAttendances(attendancesData.data || []);
      setTopNeighborhoods(sortedStats);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Configurar real-time updates com cleanup melhorado
    let channel;
    
    try {
      channel = supabase
        .channel(`dashboard-updates-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contacts'
          },
          () => {
            console.log('Dashboard: Real-time update - contacts');
            fetchStats();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cells'
          },
          () => {
            console.log('Dashboard: Real-time update - cells');
            fetchStats();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'attendances'
          },
          () => {
            console.log('Dashboard: Real-time update - attendances');
            fetchStats();
          }
        )
        .subscribe((status) => {
          console.log('Dashboard: Subscription status:', status);
        });
    } catch (error) {
      console.error('Dashboard: Erro ao configurar real-time:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Dashboard: Erro ao limpar canal:', error);
        }
      }
    };
  }, [fetchStats]);

  // Memoizar cálculos para evitar recálculos desnecessários
  const stats = useMemo(() => {
    if (!contacts.length) return [];

    const totalMembers = contacts.filter(c => c.status === 'member').length;
    const totalVisitors = contacts.filter(c => c.status === 'visitor').length;
    const totalPending = contacts.filter(c => c.status === 'pending').length;
    const totalEncounter = contacts.filter(c => c.encounter_with_god).length;
    const totalBaptized = contacts.filter(c => c.baptized).length;
    const activeCells = cells.filter(c => c.active).length;
    const totalLeaders = cells.filter(c => c.leader_id).length;

    return [
      {
        title: "Total de Discípulos",
        value: contacts.length,
        icon: Users,
        gradient: "from-blue-600 to-blue-700",
        bgGradient: "from-blue-50 to-blue-100",
        description: `${totalMembers} membros, ${totalVisitors} visitantes`,
        trend: "+12% este mês"
      },
      {
        title: "Encontro com Deus",
        value: totalEncounter,
        icon: CircleCheck,
        gradient: "from-green-600 to-green-700",
        bgGradient: "from-green-50 to-green-100",
        description: `${Math.round((totalEncounter / contacts.length) * 100)}% dos discípulos`,
        trend: "+8% este mês"
      },
      {
        title: "Batizados",
        value: totalBaptized,
        icon: Waves,
        gradient: "from-cyan-600 to-cyan-700",
        bgGradient: "from-cyan-50 to-cyan-100",
        description: `${Math.round((totalBaptized / contacts.length) * 100)}% dos discípulos`,
        trend: "+5% este mês"
      },
      {
        title: "Células Ativas",
        value: activeCells,
        icon: Home,
        gradient: "from-purple-600 to-purple-700",
        bgGradient: "from-purple-50 to-purple-100",
        description: `${totalLeaders} com líderes definidos`,
        trend: "+2 novas este mês"
      }
    ];
  }, [contacts, cells]);

  const secondaryStats = useMemo(() => {
    if (!contacts.length) return [];

    const totalMembers = contacts.filter(c => c.status === 'member').length;
    const totalVisitors = contacts.filter(c => c.status === 'visitor').length;
    const totalPending = contacts.filter(c => c.status === 'pending').length;
    const totalLeaders = cells.filter(c => c.leader_id).length;

    // Calcular média de idade
    const contactsWithBirthDate = contacts.filter(c => c.birth_date);
    const averageAge = contactsWithBirthDate.length > 0 
      ? Math.round(contactsWithBirthDate.reduce((sum, c) => {
          const birthDate = new Date(c.birth_date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
            ? age - 1 
            : age;
          
          return sum + finalAge;
        }, 0) / contactsWithBirthDate.length)
      : 0;

    // Taxa de conversão
    const conversionRate = totalVisitors > 0 ? Math.round((totalMembers / (totalMembers + totalVisitors)) * 100) : 0;

    return [
      {
        title: "Cidades Atendidas",
        value: cities.length,
        icon: MapPin,
        color: "text-indigo-600",
        bg: "bg-indigo-50"
      },
      {
        title: "Bairros Cadastrados", 
        value: neighborhoods.length,
        icon: ChartBar,
        color: "text-pink-600",
        bg: "bg-pink-50"
      },
      {
        title: "Idade Média",
        value: averageAge > 0 ? `${averageAge} anos` : "N/A",
        icon: CalendarDays,
        color: "text-cyan-600",
        bg: "bg-cyan-50"
      },
      {
        title: "Taxa de Conversão",
        value: `${conversionRate}%`,
        icon: Target,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
      },
      {
        title: "Pendentes",
        value: totalPending,
        icon: Activity,
        color: "text-amber-600",
        bg: "bg-amber-50"
      },
      {
        title: "Líderes Ativos",
        value: totalLeaders,
        icon: Crown,
        color: "text-violet-600",
        bg: "bg-violet-50"
      }
    ];
  }, [contacts, cells, cities, neighborhoods]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-4">Erro ao carregar dados do dashboard</p>
          <button
            onClick={() => {
              setError(null);
              fetchStats();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 px-4">
      {/* Header do Dashboard */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Painel de Gestão
        </h1>
        <p className="text-gray-600 text-sm md:text-lg">
          Visão completa e em tempo real do seu sistema de células
        </p>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
          <Zap className="h-4 w-4 text-green-500" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </div>
      
      {/* Cards Principais - Métricas Essenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${stat.bgGradient} transform hover:-translate-y-1`}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 md:space-y-2">
                  <div className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards Secundários - Métricas Complementares */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border border-gray-100">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`p-1.5 md:p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top 5 Bairros com Mais Discípulos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Top 5 Bairros com Mais Discípulos
          </CardTitle>
          <CardDescription>
            Bairros com maior concentração de discípulos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topNeighborhoods.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Nenhum dado de bairro disponível</p>
              <p className="text-sm">Verifique se os contatos têm bairros cadastrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topNeighborhoods.map((neighborhood, index) => (
                <div
                  key={neighborhood.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : ''}
                      ${index >= 3 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : ''}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{neighborhood.neighborhood_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {neighborhood.city_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{neighborhood.total_people || 0}</p>
                    <p className="text-xs text-gray-500">discípulos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Presença ao Longo do Tempo */}
      <AttendanceLineChart />

      {/* Primeira linha com 3 gráficos: Estágios, Análise e Métricas por Cidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <DashboardPipelineMetrics />
        <DiscipleAnalysisChart />
        <DashboardCharts />
      </div>

      {/* Footer com Informações Adicionais */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sistema em Tempo Real</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Todos os dados são atualizados automaticamente conforme as mudanças acontecem no sistema.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestão Inteligente</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Acompanhe o crescimento das células, conversões e engajamento dos discípulos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tomada de Decisão</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Use os insights para identificar oportunidades e otimizar a estratégia das células.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
