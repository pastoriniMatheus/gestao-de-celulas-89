import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Calendar, Users, Filter, Search, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ContactEntry {
  id: string;
  contact_id: string;
  entry_type: string;
  created_by: string | null;
  source_info: any;
  ip_address: string | null;
  created_at: string;
  contact_name?: string;
  created_by_name?: string;
}

export const ReportsPage = () => {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { isAdmin } = useUserPermissions();
  const { toast } = useToast();

  const fetchEntries = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('contact_entries')
        .select(`
          *,
          contacts:contact_id(name),
          profiles:created_by(name)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros de data se necessário
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Processar dados para facilitar a exibição
      const processedData = (data || []).map(entry => ({
        id: entry.id,
        contact_id: entry.contact_id,
        entry_type: entry.entry_type,
        created_by: entry.created_by,
        source_info: entry.source_info,
        ip_address: typeof entry.ip_address === 'string' ? entry.ip_address : null,
        created_at: entry.created_at,
        contact_name: entry.contacts?.name || 'Contato não encontrado',
        created_by_name: entry.profiles?.name || 'Sistema'
      }));

      setEntries(processedData);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEntries();
    }
  }, [isAdmin, entryTypeFilter, dateFilter]);

  // Filtrar dados baseado na busca e filtros
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = entryTypeFilter === 'all' || entry.entry_type === entryTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'qr_form':
        return <Badge className="bg-blue-100 text-blue-800">QR Code</Badge>;
      case 'event_form':
        return <Badge className="bg-green-100 text-green-800">Evento</Badge>;
      case 'manual_admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin Manual</Badge>;
      case 'manual_leader':
        return <Badge className="bg-orange-100 text-orange-800">Líder Manual</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Estatísticas
  const totalEntries = filteredEntries.length;
  const entriesThisWeek = filteredEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const entriesByType = {
    qr_form: filteredEntries.filter(e => e.entry_type === 'qr_form').length,
    event_form: filteredEntries.filter(e => e.entry_type === 'event_form').length,
    manual_admin: filteredEntries.filter(e => e.entry_type === 'manual_admin').length,
    manual_leader: filteredEntries.filter(e => e.entry_type === 'manual_leader').length,
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Acesso negado. Apenas administradores podem visualizar relatórios.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Relatórios
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe a entrada de contatos no sistema
          </p>
        </div>
        <Button
          onClick={fetchEntries}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Total de Entradas</p>
            <p className="text-2xl font-bold text-blue-600">{totalEntries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Esta Semana</p>
            <p className="text-2xl font-bold text-green-600">{entriesThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Via QR/Eventos</p>
            <p className="text-2xl font-bold text-purple-600">
              {entriesByType.qr_form + entriesByType.event_form}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Adição Manual</p>
            <p className="text-2xl font-bold text-orange-600">
              {entriesByType.manual_admin + entriesByType.manual_leader}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por contato ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="qr_form">QR Code</SelectItem>
                <SelectItem value="event_form">Evento</SelectItem>
                <SelectItem value="manual_admin">Admin Manual</SelectItem>
                <SelectItem value="manual_leader">Líder Manual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registros de Entrada ({filteredEntries.length})
          </CardTitle>
          <CardDescription>
            Histórico detalhado de quando cada contato foi adicionado ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando registros...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || entryTypeFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Nenhum registro encontrado com os filtros aplicados.' 
                  : 'Nenhum registro encontrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Contato</th>
                    <th className="text-left p-3 font-semibold">Tipo de Entrada</th>
                    <th className="text-left p-3 font-semibold">Criado por</th>
                    <th className="text-left p-3 font-semibold">Data/Hora</th>
                    <th className="text-left p-3 font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{entry.contact_name}</td>
                      <td className="p-3">
                        {getEntryTypeBadge(entry.entry_type)}
                      </td>
                      <td className="p-3 text-gray-600">{entry.created_by_name}</td>
                      <td className="p-3 text-gray-600 text-sm">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="p-3 text-gray-600 text-sm">
                        {entry.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};