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

interface ContactDeletion {
  id: string;
  contact_id: string;
  contact_name: string;
  deleted_by: string | null;
  deleted_at: string;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  deleted_by_name?: string;
}

export const ReportsPage = () => {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [deletions, setDeletions] = useState<ContactDeletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('entries');
  const { isAdmin } = useUserPermissions();
  const { toast } = useToast();

  const fetchEntries = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Fetch contact entries
      let entriesQuery = supabase
        .from('contact_entries')
        .select(`
          *,
          contacts:contact_id(name),
          profiles:created_by(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch contact deletions with contact names
      let deletionsQuery = supabase
        .from('contact_deletions')
        .select(`
          *,
          contacts:contact_id(name)
        `)
        .order('deleted_at', { ascending: false });

      // Apply date filters if necessary
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
        
        entriesQuery = entriesQuery.gte('created_at', startDate.toISOString());
        deletionsQuery = deletionsQuery.gte('deleted_at', startDate.toISOString());
      }

      const [entriesResult, deletionsResult] = await Promise.all([
        entriesQuery,
        deletionsQuery
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (deletionsResult.error) throw deletionsResult.error;

      // Process entries data
      const processedEntries = (entriesResult.data || []).map(entry => ({
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

      // Process deletions data - fetch profile names separately if needed
      const processedDeletions = await Promise.all((deletionsResult.data || []).map(async (deletion) => {
        let deleted_by_name = 'Sistema';
        
        if (deletion.deleted_by) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', deletion.deleted_by)
              .single();
            
            if (profile) {
              deleted_by_name = profile.name;
            }
          } catch (error) {
            console.error('Error fetching profile for deletion:', error);
          }
        }

        return {
          id: deletion.id,
          contact_id: deletion.contact_id,
          contact_name: deletion.contacts?.name || 'Contato não encontrado',
          deleted_by: deletion.deleted_by,
          deleted_at: deletion.deleted_at,
          reason: deletion.reason,
          ip_address: typeof deletion.ip_address === 'string' ? deletion.ip_address : null,
          user_agent: deletion.user_agent,
          deleted_by_name
        };
      }));

      setEntries(processedEntries);
      setDeletions(processedDeletions);
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
  }, [isAdmin, entryTypeFilter, dateFilter, reportType]);

  // Filter data based on search and filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = entryTypeFilter === 'all' || entry.entry_type === entryTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const filteredDeletions = deletions.filter(deletion => {
    const matchesSearch = deletion.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deletion.deleted_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
      case 'cell_assignment':
        return <Badge className="bg-teal-100 text-teal-800">Atribuição Célula</Badge>;
      case 'cell_removal':
        return <Badge className="bg-red-100 text-red-800">Remoção Célula</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Statistics
  const totalEntries = filteredEntries.length;
  const totalDeletions = filteredDeletions.length;
  const entriesThisWeek = filteredEntries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const deletionsThisWeek = filteredDeletions.filter(deletion => {
    const deletionDate = new Date(deletion.deleted_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return deletionDate >= weekAgo;
  }).length;

  const entriesByType = {
    qr_form: filteredEntries.filter(e => e.entry_type === 'qr_form').length,
    event_form: filteredEntries.filter(e => e.entry_type === 'event_form').length,
    manual_admin: filteredEntries.filter(e => e.entry_type === 'manual_admin').length,
    manual_leader: filteredEntries.filter(e => e.entry_type === 'manual_leader').length,
    cell_assignment: filteredEntries.filter(e => e.entry_type === 'cell_assignment').length,
    cell_removal: filteredEntries.filter(e => e.entry_type === 'cell_removal').length,
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
            Acompanhe a entrada e saída de contatos no sistema
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Deletados</p>
            <p className="text-2xl font-bold text-red-600">{totalDeletions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entries">Entradas de Contatos</SelectItem>
                <SelectItem value="deletions">Contatos Deletados</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por contato ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {reportType === 'entries' && (
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
                  <SelectItem value="cell_assignment">Atribuição Célula</SelectItem>
                  <SelectItem value="cell_removal">Remoção Célula</SelectItem>
                </SelectContent>
              </Select>
            )}

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

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {reportType === 'entries' 
              ? `Registros de Entrada (${filteredEntries.length})`
              : `Contatos Deletados (${filteredDeletions.length})`
            }
          </CardTitle>
          <CardDescription>
            {reportType === 'entries'
              ? 'Histórico detalhado de quando cada contato foi adicionado ao sistema'
              : 'Histórico de contatos que foram removidos do sistema'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando registros...</span>
            </div>
          ) : (reportType === 'entries' ? filteredEntries.length === 0 : filteredDeletions.length === 0) ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || (reportType === 'entries' && entryTypeFilter !== 'all') || dateFilter !== 'all' 
                  ? 'Nenhum registro encontrado com os filtros aplicados.' 
                  : 'Nenhum registro encontrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {reportType === 'entries' ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Contato</th>
                      <th className="text-left p-3 font-semibold">Tipo de Entrada</th>
                      <th className="text-left p-3 font-semibold">Criado por</th>
                      <th className="text-left p-3 font-semibold">Data/Hora</th>
                      <th className="text-left p-3 font-semibold">Detalhes</th>
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
                        <td className="p-3 text-gray-600 text-xs max-w-xs">
                          {entry.source_info && Object.keys(entry.source_info).length > 0 
                            ? (
                              <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                                {JSON.stringify(entry.source_info, null, 1)}
                              </div>
                            )
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Contato</th>
                      <th className="text-left p-3 font-semibold">Deletado por</th>
                      <th className="text-left p-3 font-semibold">Data/Hora</th>
                      <th className="text-left p-3 font-semibold">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeletions.map((deletion) => (
                      <tr key={deletion.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{deletion.contact_name}</td>
                        <td className="p-3 text-gray-600">{deletion.deleted_by_name}</td>
                        <td className="p-3 text-gray-600 text-sm">
                          {formatDate(deletion.deleted_at)}
                        </td>
                        <td className="p-3 text-gray-600 text-sm">
                          {deletion.reason || 'Não informado'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};