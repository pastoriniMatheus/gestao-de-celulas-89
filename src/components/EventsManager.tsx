
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Calendar, Users, BarChart3, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { AddEventDialog } from './AddEventDialog';
import { EditEventDialog } from './EditEventDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventsManager = () => {
  const { events, loading, toggleEventStatus, deleteEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvent(id);
    }
  };

  const downloadQRCode = (event: any) => {
    const link = document.createElement('a');
    link.download = `qr-${event.keyword}.png`;
    link.href = event.qr_code;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Eventos</h1>
          <p className="text-gray-600">Crie e gerencie eventos com QR codes</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <Badge variant={event.active ? "default" : "secondary"}>
                  {event.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => downloadQRCode(event)}
                  title="Clique para baixar o QR Code"
                >
                  <img 
                    src={event.qr_code} 
                    alt={`QR Code ${event.name}`}
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <QrCode className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Scans</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">{event.scan_count || 0}</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Cadastros</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">{event.registration_count || 0}</div>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Código:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{event.keyword}</code>
                </div>
                <div className="text-xs text-gray-500">
                  URL: {event.qr_url}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditEvent(event)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleEventStatus(event.id, !event.active)}
                  className="flex-1"
                >
                  {event.active ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {event.active ? 'Desativar' : 'Ativar'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento criado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro evento com QR code</p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      )}

      <AddEventDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      
      {selectedEvent && (
        <EditEventDialog
          event={selectedEvent}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};
