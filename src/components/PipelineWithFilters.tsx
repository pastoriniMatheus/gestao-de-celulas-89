import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Users, Filter } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
  contacts: Contact[];
}

interface Contact {
  id: string;
  name: string;
  whatsapp: string | null;
  neighborhood: string;
  cell_id: string | null;
  cell_name: string | null;
}

interface Cell {
  id: string;
  name: string;
}

export const PipelineWithFilters = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCell, setSelectedCell] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData();
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCells(data || []);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
    }
  };

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

      // Buscar contatos por estágio com informações da célula
      const stagesWithContacts = await Promise.all(
        (stagesData || []).map(async (stage) => {
          const { data: contacts, error } = await supabase
            .from('contacts')
            .select(`
              id,
              name,
              whatsapp,
              neighborhood,
              cell_id,
              cells!left(name)
            `)
            .eq('pipeline_stage_id', stage.id);

          if (error) console.error('Erro ao buscar contatos:', error);

          return {
            ...stage,
            contacts: (contacts || []).map(contact => ({
              ...contact,
              cell_name: contact.cells?.name || null
            }))
          };
        })
      );

      setStages(stagesWithContacts);
    } catch (error) {
      console.error('Erro ao buscar dados do pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContacts = (contacts: Contact[]) => {
    if (selectedCell === 'all') return contacts;
    if (selectedCell === 'no-cell') return contacts.filter(c => !c.cell_id);
    return contacts.filter(c => c.cell_id === selectedCell);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Discípulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando pipeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Pipeline de Discípulos
        </CardTitle>
        <CardDescription>
          Visualização dos discípulos por estágio do funil
        </CardDescription>
        
        {/* Filtro por Célula */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedCell} onValueChange={setSelectedCell}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por célula" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as células</SelectItem>
              <SelectItem value="no-cell">Sem célula</SelectItem>
              {cells.map((cell) => (
                <SelectItem key={cell.id} value={cell.id}>
                  {cell.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const filteredContacts = getFilteredContacts(stage.contacts);
            
            return (
              <div key={stage.id} className="relative">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-medium">{stage.name}</h3>
                      <Badge variant="secondary">
                        {filteredContacts.length} discípulos
                      </Badge>
                    </div>
                  </div>
                  
                  {/* ScrollArea para os contatos */}
                  <ScrollArea className="h-48 w-full">
                    <div className="space-y-2">
                      {filteredContacts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {selectedCell === 'all' 
                            ? 'Nenhum discípulo neste estágio' 
                            : 'Nenhum discípulo neste estágio para o filtro selecionado'
                          }
                        </p>
                      ) : (
                        filteredContacts.map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-gray-600">{contact.neighborhood}</p>
                              {contact.cell_name && (
                                <p className="text-blue-600 text-xs">{contact.cell_name}</p>
                              )}
                            </div>
                            {contact.whatsapp && (
                              <Badge variant="outline" className="text-xs">
                                {contact.whatsapp}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
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
      </CardContent>
    </Card>
  );
};
