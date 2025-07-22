
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AddCityDialog } from './AddCityDialog';
import { AddNeighborhoodDialog } from './AddNeighborhoodDialog';
import { useLocationManager } from '@/hooks/useLocationManager';

export const LocationManager = () => {
  const {
    cities,
    neighborhoods,
    loading,
    deleteCity,
    deleteNeighborhood,
    updateCity,
    updateNeighborhood,
    refreshData
  } = useLocationManager();

  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [editingNeighborhood, setEditingNeighborhood] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const handleUpdateCity = async (id: string, updates: any) => {
    try {
      await updateCity(id, updates);
      setEditingCity(null);
      setEditValues({});
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleUpdateNeighborhood = async (id: string, updates: any) => {
    try {
      await updateNeighborhood(id, updates);
      setEditingNeighborhood(null);
      setEditValues({});
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta cidade? Isso também excluirá todos os bairros relacionados.')) {
      return;
    }

    try {
      await deleteCity(id);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteNeighborhood = async (id: string, name: string) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) {
      return;
    }

    try {
      await deleteNeighborhood(id, name);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city ? `${city.name} - ${city.state}` : 'Cidade não encontrada';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cidades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Cidades
              </CardTitle>
              <CardDescription>
                Gerencie as cidades do sistema
              </CardDescription>
            </div>
            <AddCityDialog onCityAdded={refreshData} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    {editingCity === city.id ? (
                      <Input
                        value={editValues.name || city.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      city.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCity === city.id ? (
                      <Input
                        value={editValues.state || city.state}
                        onChange={(e) => setEditValues(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-20"
                        maxLength={2}
                      />
                    ) : (
                      city.state
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${city.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {city.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingCity === city.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCity(city.id, editValues)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCity(null);
                              setEditValues({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCity(city.id);
                              setEditValues({ name: city.name, state: city.state });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCity(city.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bairros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Bairros
              </CardTitle>
              <CardDescription>
                Gerencie os bairros do sistema
              </CardDescription>
            </div>
            <AddNeighborhoodDialog cities={cities} onNeighborhoodAdded={refreshData} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {neighborhoods.map((neighborhood) => (
                <TableRow key={neighborhood.id}>
                  <TableCell>
                    {editingNeighborhood === neighborhood.id ? (
                      <Input
                        value={editValues.name || neighborhood.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      neighborhood.name
                    )}
                  </TableCell>
                  <TableCell>{getCityName(neighborhood.city_id)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${neighborhood.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {neighborhood.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingNeighborhood === neighborhood.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateNeighborhood(neighborhood.id, editValues)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNeighborhood(null);
                              setEditValues({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNeighborhood(neighborhood.id);
                              setEditValues({ name: neighborhood.name });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNeighborhood(neighborhood.id, neighborhood.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
