
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Filter } from 'lucide-react';

interface CityMetrics {
  city_id: string;
  city_name: string;
  state: string;
  total_contacts: number;
  members: number;
  visitors: number;
  cells: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  fill: string;
}

export const DashboardCharts = () => {
  const [cityMetrics, setCityMetrics] = useState<CityMetrics[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityMetrics();
  }, []);

  const fetchCityMetrics = async () => {
    setLoading(true);
    try {
      console.log('DashboardCharts: Buscando métricas das cidades...');

      // Buscar dados das cidades com contatos
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select(`
          id,
          name,
          state,
          active
        `)
        .eq('active', true);

      if (citiesError) {
        console.error('Erro ao buscar cidades:', citiesError);
        return;
      }

      // Buscar contatos agrupados por cidade
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          status,
          city_id,
          cities (
            id,
            name,
            state
          )
        `);

      if (contactsError) {
        console.error('Erro ao buscar contatos:', contactsError);
        return;
      }

      // Buscar células agrupadas por cidade através do bairro
      const { data: cellsData, error: cellsError } = await supabase
        .from('cells')
        .select(`
          id,
          active,
          neighborhoods (
            id,
            name,
            cities (
              id,
              name,
              state
            )
          )
        `)
        .eq('active', true);

      if (cellsError) {
        console.error('Erro ao buscar células:', cellsError);
        return;
      }

      console.log('Dados brutos:', { citiesData, contactsData, cellsData });

      // Processar métricas por cidade
      const metricsMap: { [key: string]: CityMetrics } = {};

      // Inicializar todas as cidades
      citiesData?.forEach(city => {
        metricsMap[city.id] = {
          city_id: city.id,
          city_name: city.name,
          state: city.state,
          total_contacts: 0,
          members: 0,
          visitors: 0,
          cells: 0
        };
      });

      // Contar contatos por cidade
      contactsData?.forEach(contact => {
        if (contact.city_id && metricsMap[contact.city_id]) {
          metricsMap[contact.city_id].total_contacts += 1;
          
          if (contact.status === 'member') {
            metricsMap[contact.city_id].members += 1;
          } else if (contact.status === 'visitor') {
            metricsMap[contact.city_id].visitors += 1;
          }
        }
      });

      // Contar células por cidade
      cellsData?.forEach(cell => {
        if (cell.neighborhoods?.cities?.id && metricsMap[cell.neighborhoods.cities.id]) {
          metricsMap[cell.neighborhoods.cities.id].cells += 1;
        }
      });

      // Converter para array e filtrar cidades com dados
      const formattedMetrics = Object.values(metricsMap)
        .filter(metric => metric.total_contacts > 0 || metric.cells > 0)
        .sort((a, b) => b.total_contacts - a.total_contacts);

      console.log('Métricas formatadas:', formattedMetrics);
      setCityMetrics(formattedMetrics);

    } catch (error) {
      console.error('Erro ao processar métricas das cidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCityData = () => {
    if (selectedCity === 'all') {
      return {
        total_contacts: cityMetrics.reduce((sum, city) => sum + city.total_contacts, 0),
        members: cityMetrics.reduce((sum, city) => sum + city.members, 0),
        visitors: cityMetrics.reduce((sum, city) => sum + city.visitors, 0),
        cells: cityMetrics.reduce((sum, city) => sum + city.cells, 0),
        city_name: 'Todas as Cidades'
      };
    }
    
    const cityData = cityMetrics.find(city => city.city_id === selectedCity);
    return cityData || {
      total_contacts: 0,
      members: 0,
      visitors: 0,
      cells: 0,
      city_name: 'Cidade não encontrada'
    };
  };

  const selectedData = getSelectedCityData();

  const statusDistribution: StatusDistribution[] = [
    {
      name: 'Membros',
      value: selectedData.members,
      fill: '#3b82f6'
    },
    {
      name: 'Visitantes',
      value: selectedData.visitors,
      fill: '#10b981'
    }
  ];

  const barChartData = selectedCity === 'all' 
    ? cityMetrics.slice(0, 10).map(city => ({
        name: `${city.city_name} - ${city.state}`,
        members: city.members,
        visitors: city.visitors,
        cells: city.cells
      }))
    : [{
        name: selectedData.city_name,
        members: selectedData.members,
        visitors: selectedData.visitors,
        cells: selectedData.cells
      }];

  return (
    <div className="space-y-6">
      {/* Filtro de Cidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Métricas por Cidade
          </CardTitle>
          <CardDescription>
            Visualize os dados filtrados por cidade ou visão geral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Filtrar por cidade:</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Cidades</SelectItem>
                  {cityMetrics.map((city) => (
                    <SelectItem key={city.city_id} value={city.city_id}>
                      {city.city_name} - {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedData.total_contacts}</div>
                  <div className="text-sm text-gray-600">Total Contatos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedData.cells}</div>
                  <div className="text-sm text-gray-600">Células</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedData.members}</div>
                  <div className="text-sm text-gray-600">Membros</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedData.visitors}</div>
                  <div className="text-sm text-gray-600">Visitantes</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      {!loading && cityMetrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCity === 'all' ? 'Contatos e Células por Cidade' : `Dados de ${selectedData.city_name}`}
              </CardTitle>
              <CardDescription>
                {selectedCity === 'all' ? 'Top 10 cidades' : 'Dados específicos da cidade selecionada'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666"
                      fontSize={11}
                      angle={selectedCity === 'all' ? -45 : 0}
                      textAnchor={selectedCity === 'all' ? 'end' : 'middle'}
                      height={selectedCity === 'all' ? 80 : 60}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="members" stackId="a" fill="#3b82f6" name="Membros" />
                    <Bar dataKey="visitors" stackId="a" fill="#10b981" name="Visitantes" />
                    <Bar dataKey="cells" fill="#8b5cf6" name="Células" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status</CardTitle>
              <CardDescription>
                Status em {selectedData.city_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedData.total_contacts > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Users className="h-12 w-12 mb-4 text-gray-400" />
                  <p>Nenhum contato encontrado para esta cidade</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && cityMetrics.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <MapPin className="h-12 w-12 mb-4 text-gray-400" />
              <p>Nenhuma cidade com dados encontrada</p>
              <p className="text-sm">Cadastre contatos com cidades para visualizar as métricas</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
